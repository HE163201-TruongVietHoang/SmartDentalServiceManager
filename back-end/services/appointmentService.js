const { getPool, sql } = require("../config/db");
const { checkSlot, markAsBooked, unmarkAsBooked } = require("../access/slotAccess");
const { sendNotificationToMany } = require("../access/notificationAccess");
const { getByIdPatient } = require("../access/patientAccess");
const { create, getByUser, getAll, getById, cancelAppointments, countUserCancellations, updateStatus, findUserByEmailOrPhone, createUser, addServiceToAppointment } = require("../access/appointmentAccess");
const { normalizeTime, minutesToHHMM } = require("../utils/timeUtils");
const { getIO } = require("../utils/socket");
const appointmentService = {
  async makeAppointment({ patientId, doctorId, slotId, reason, workDate, appointmentType }, io) {
    const pool = await getPool();
    // Transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let appointment;
    let slot;
    try {
      slot = await checkSlot(slotId, transaction);
      if (!slot) throw new Error("Slot không tồn tại");
      if (slot.isBooked) throw new Error("Slot đã được đặt");

      await markAsBooked(slotId, transaction);

      appointment = await create(
        { patientId, doctorId, slotId, reason, workDate, appointmentType },
        transaction
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
    // Realtime slot booked
    io.emit("slotBooked", { slotId });

    // Chuẩn bị danh sách notification
    const notifyUsers = [];
    const startTime = slot.startTime; // kiểu Date
    const timeStr = startTime.toTimeString().slice(0, 5);
    const workDateStr = slot.workDate ? slot.workDate.toISOString().slice(0, 10) : null;
    // Bệnh nhân
    notifyUsers.push({
      receiverId: patientId,
      senderId: null,
      title: "Đặt lịch thành công",
      message: `Bạn đã đặt lịch vào ${timeStr} ${workDateStr}`,
      type: "appointment"
    });
    const patient = await getByIdPatient(patientId);
    // Bác sĩ
    notifyUsers.push({
      receiverId: doctorId,
      senderId: patientId,
      title: "Có lịch hẹn mới",
      message: `Bệnh nhân ${patient.fullName} vừa đặt lịch vào ${timeStr} ${workDateStr}`,
      type: "appointment"
    });

    // Gửi tất cả notifications + realtime bằng helper
    await sendNotificationToMany(notifyUsers);

    return appointment;
  },



  async getUserAppointments(userId) {
    const appointments = await getByUser(userId);
    return appointments.map(a => ({
      ...a,
      workDate: a.workDate ? a.workDate.toISOString().slice(0, 10) : null,
      startTime: a.startTime.toISOString().slice(11, 16),
      endTime: a.endTime.toISOString().slice(11, 16)
    }));
  },
  async getAllAppointments() {
    const appointments = await getAll();
    return appointments.map(a => ({
      ...a,
      workDate: a.workDate ? a.workDate.toISOString().slice(0, 10) : null,
      startTime: a.startTime.toISOString().slice(11, 16),
      endTime: a.endTime.toISOString().slice(11, 16)
    }));
  },

  async cancelAppointment(appointmentId, userId, io) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
      // 1. Kiểm tra số lần hủy trước khi bắt đầu
      const cancelCount = await countUserCancellations(userId);
      if (cancelCount >= 5) {
        await pool.request()
          .input("userId", sql.Int, userId)
          .query(`UPDATE Users SET isActive = 0 WHERE userId = @userId`);

        return {
          success: false,
          code: "ACCOUNT_LOCKED",
          message: "Bạn đã hủy quá 5 lần — tài khoản bị khóa!"
        };
      }


      await transaction.begin();

      // 2. Lấy appointment
      const appointment = await getById(appointmentId);
      if (!appointment)
        return { success: false, message: "Không tìm thấy cuộc hẹn" };

      if (appointment.patientId !== userId)
        return { success: false, message: "Không có quyền hủy" };

      // 3. Kiểm tra thời gian
      const appointmentDate = new Date(appointment.workDate);
      const [h, m] = normalizeTime(appointment.startTime).split(":").map(Number);
      appointmentDate.setHours(h, m, 0, 0);

      const now = new Date();
      if ((appointmentDate - now) / (1000 * 60 * 60) < 12) {
        return {
          success: false,
          message: "Không thể hủy — chỉ được hủy trước ít nhất 12 giờ!"
        };
      }

      // 4. Hủy appointment
      await cancelAppointments(appointmentId, transaction);

      // 5. Mở lại slot
      await unmarkAsBooked(appointment.slotId, transaction);

      // 6. update updatedAt
      await transaction.request()
        .input("appointmentId", sql.Int, appointmentId)
        .query(`UPDATE Appointments SET updatedAt = GETDATE() WHERE appointmentId = @appointmentId`);

      await transaction.commit();

      // Realtime update
      if (io) io.emit("slotReleased", { slotId: appointment.slotId });

      return { success: true, message: "Hủy cuộc hẹn thành công" };

    } catch (err) {
      try { await transaction.rollback(); } catch (_) { }
      return { success: false, message: err.message };
    }
  }
  ,
  async markInProgress(appointmentId) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Update status thành "InProgress"
      await updateStatus(appointmentId, "InProgress", transaction);

      await transaction.commit();
      return { success: true, message: "Appointment đã chuyển sang InProgress" };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  async autoCancelNoShow(io) {
    try {
      const pool = await getPool();
      const io = getIO();
      // Lấy tất cả appointment đang Scheduled
      const result = await pool.request().query(`
        SELECT a.appointmentId, a.patientId, a.slotId, s.startTime, sch.workDate
        FROM Appointments a
        JOIN Slots s ON a.slotId = s.slotId
        JOIN Schedules sch ON s.scheduleId = sch.scheduleId
        WHERE a.status = 'Scheduled'
      `);

      const appointments = result.recordset;

      const now = new Date();

      for (const appt of appointments) {
        try {
          if (!appt.startTime || !appt.workDate) continue;

          // Chuẩn hóa giờ startTime
          const startStr = normalizeTime(appt.startTime);
          const [h, m] = startStr.split(":").map(Number);

          // Tạo datetime chính xác của appointment
          const workDate = new Date(
            new Date(appt.workDate).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
          );
          workDate.setHours(h, m, 0, 0);

          // Diff giờ
          const now = new Date();
          const diffHours = (now - workDate) / (1000 * 60 * 60);

          if (diffHours >= 2) {
            // Xử lý từng appointment trong transaction riêng
            const transaction = new sql.Transaction(pool);
            await transaction.begin();

            // Hủy appointment
            await cancelAppointments(appt.appointmentId, transaction);

            // Mở lại slot
            await unmarkAsBooked(appt.slotId, transaction);

            // Cập nhật updatedAt
            await transaction.request()
              .input("appointmentId", sql.Int, appt.appointmentId)
              .query(`UPDATE Appointments SET updatedAt = GETDATE() WHERE appointmentId = @appointmentId`);

            await transaction.commit();

            // Realtime
            if (io) io.emit("slotReleased", { slotId: appt.slotId });

            // Kiểm tra số lần hủy
            const cancelCount = await countUserCancellations(appt.patientId);
            if (cancelCount >= 5) {
              await pool.request()
                .input("userId", sql.Int, appt.patientId)
                .query(`UPDATE Users SET isActive = 0 WHERE userId = @userId`);
            }

            console.log(`Auto-canceled appointment ${appt.appointmentId}`);
          }

        } catch (innerErr) {
          console.error(`Error processing appointment ${appt.appointmentId}:`, innerErr);
        }
      }

      console.log("Auto-cancel no-show finished");

    } catch (err) {
      console.error("Error in auto-cancel no-show:", err);
    }
  },
  async makeAppointmentForReceptionist({ email, phone, fullName, gender, dob, address, doctorId, slotId, reason, workDate, appointmentType }, io) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1️⃣ Tìm user theo email hoặc sđt
      let patient = await findUserByEmailOrPhone(email, phone);

      // 2️⃣ Nếu chưa tồn tại thì tạo mới
      if (!patient) {
        patient = await createUser({ email, phone, fullName, gender, dob, address });
      }

      // 3️⃣ Kiểm tra slot
      const slot = await checkSlot(slotId, transaction);
      if (!slot) throw new Error("Slot không tồn tại");
      if (slot.isBooked) throw new Error("Slot đã được đặt");

      await markAsBooked(slotId, transaction);

      // 4️⃣ Tạo appointment
      const appointment = await create({
        patientId: patient.userId,
        doctorId,
        slotId,
        reason,
        workDate,
        appointmentType
      }, transaction);

      await transaction.commit();

      if (io) io.emit("slotBooked", { slotId });

      return { success: true, appointment, patientId: patient.userId };

    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async getAppointmentById(appointmentId) {
    const appointment = await getById(appointmentId);
    if (!appointment) throw new Error("Không tìm thấy cuộc hẹn");

    return {
      ...appointment,
      workDate: appointment.workDate ? appointment.workDate.toISOString().slice(0, 10) : null,
      startTime: appointment.startTime.toISOString().slice(11, 16),
      endTime: appointment.endTime.toISOString().slice(11, 16)
    };
  },

  async addServiceToAppointment(appointmentId, serviceId) {
    await addServiceToAppointment(appointmentId, serviceId);
    return { success: true, message: "Dịch vụ đã được thêm vào cuộc hẹn" };
  }
};
module.exports = { appointmentService };
