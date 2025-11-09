const { appointmentService } = require("../services/appointmentService");

const appointmentController = {
  async makeAppointment(req, res) {
    try {
      const io = req.app.get("io"); // Lấy socket instance
      const appointment = await appointmentService.makeAppointment(req.body, io);
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
  async getAllAppointment (req, res){
    try {
      const appointments = await appointmentService.getAllAppointments();
      res.json({ success: true, data: appointments });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
module.exports = { appointmentController };
