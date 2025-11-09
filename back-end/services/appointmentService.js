const { getPool, sql } = require("../config/db");
const { checkSlot, markAsBooked } = require("../access/slotAccess");
const { create, getByUser,getAll } = require("../access/appointmentAccess");

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
  }
};
module.exports = { appointmentService };
