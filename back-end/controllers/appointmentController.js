const { appointmentService } = require("../services/appointmentService");
const { getIO } = require("../utils/socket");
const appointmentController = {
  async makeAppointment(req, res) {
    try {
      const io = getIO(); // Lấy socket instance
      const appointment = await appointmentService.makeAppointment(
        req.body,
        io
      );
      res.json({ success: true, appointment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getAvailableSlots(req, res) {
    const { doctorId, date } = req.query;
    const { getAvailable } = require("../access/slotAccess");
    try {
      const slots = await getAvailable(Number(doctorId), date);
      res.json(slots);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async getMyAppointments(req, res) {
    try {
      const userId = req.user.userId; // req.user từ middleware auth
      const appointments = await appointmentService.getUserAppointments(userId);
      res.json({ success: true, appointments });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi khi lấy lịch hẹn" });
    }
  },

  /**
   * Lấy danh sách tất cả các lịch hẹn
   *
   * @return {json} Danh sách các lịch hẹn
   */
  async getAllAppointment(req, res) {
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.json({ success: true, data: appointments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  async cancelAppointment(req, res) {
    try {
      const appointmentId = parseInt(req.params.id);
      const userId = req.user?.userId;
      const io = req.app.get("io"); // lấy socket.io instance từ app.js

      const result = await appointmentService.cancelAppointment(
        appointmentId,
        userId,
        io
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  async markInProgress(req, res) {
    const { appointmentId } = req.params;

    try {
      const result = await appointmentService.markInProgress(
        Number(appointmentId)
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  async makeAppointmentReceptionistController(req, res) {
    try {
      const appointmentData = req.body;
      const io = req.app.get("io"); // nếu dùng socket.io
      const result = await appointmentService.makeAppointmentForReceptionist(
        appointmentData,
        io
      );
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getAppointmentById(req, res) {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const appointment = await appointmentService.getAppointmentById(
        appointmentId
      );
      res.json({ success: true, appointment });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
};
module.exports = { appointmentController };
