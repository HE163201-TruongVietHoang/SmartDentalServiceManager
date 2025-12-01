const doctorService = require("../services/doctorService.js");

const doctorController = {
  async getAll(req, res) {
    try {
      const doctors = await doctorService.getDoctors();
      res.json(doctors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getDetail(req, res) {
    try {
      const { userId } = req.params;
      const doctor = await doctorService.getDoctorById(userId);

      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      res.json(doctor);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = doctorController;
