const { getPool, sql } = require("../config/db");
const { checkSlot, markAsBooked, unmarkAsBooked } = require("../access/slotAccess");
const { create, getByUser, getAll, getById, cancelAppointment, countUserCancellations, updateStatus } = require("../access/appointmentAccess");
const { normalizeTime } = require("../utils/timeUtils");
const appointmentService = {
  async makeAppointment({ patientId, doctorId, slotId, reason, workDate, appointmentType }, io) {
    if (!appointmentType) throw new Error("appointmentType is required");
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    try {
      const slot = await checkSlot(slotId, transaction);
      if (!slot) throw new Error("Slot không tồn tại");
      if (slot.isBooked) throw new Error("Slot đã được đặt");

      await markAsBooked(slotId, transaction);

      const appointment = await create({ patientId, doctorId, slotId, reason, workDate, appointmentType }, transaction);

      await transaction.commit();

      // Emit realtime cho frontend
      if (io) io.emit("slotBooked", { slotId });

      return appointment;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
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
      await transaction.begin(); // phải gọi trước mọi request

      // --- lấy appointment ---
      const appointment = await getById(appointmentId); // đây vẫn là query ngoài transaction, vẫn OK

      // kiểm tra quyền và thời gian
      if (!appointment) throw new Error("Không tìm thấy cuộc hẹn");
      if (appointment.patientId !== userId) throw new Error("Không có quyền hủy");

      const appointmentDate = new Date(appointment.workDate);
      const [hours, minutes] = normalizeTime(appointment.startTime).split(":").map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const now = new Date();
      if ((appointmentDate - now) / (1000 * 60 * 60) < 12)
        throw new Error("Không thể hủy — chỉ được hủy trước ít nhất 12 giờ!");

      // --- update appointment trong transaction ---
      await cancelAppointment(appointmentId, transaction);

      // --- mở lại slot ---
      await unmarkAsBooked(appointment.slotId, transaction);

      // --- cập nhật updatedAt ---
      await transaction.request()
        .input("appointmentId", sql.Int, appointmentId)
        .query(`UPDATE Appointments SET updatedAt = GETDATE() WHERE appointmentId = @appointmentId`);

      await transaction.commit();

      // --- realtime ---
      if (io) io.emit("slotReleased", { slotId: appointment.slotId });

      // --- kiểm tra số lần hủy ---
      const cancelCount = await countUserCancellations(userId);
      if (cancelCount >= 5) {
        await pool.request()
          .input("userId", sql.Int, userId)
          .query(`UPDATE Users SET isActive = 0 WHERE userId = @userId`);
        throw new Error("Bạn đã hủy quá 5 lần — tài khoản bị khóa!");
      }

      return { success: true, message: "Hủy cuộc hẹn thành công" };

    } catch (err) {
      try { await transaction.rollback(); } catch (_) { }
      throw err;
    }
  },
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
          const startStr = normalizeTime(appt.startTime); // luôn trả về "HH:mm:ss"
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
            await cancelAppointment(appt.appointmentId, transaction);

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
  }
};
module.exports = { appointmentService };
