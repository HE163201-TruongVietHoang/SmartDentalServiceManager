const  doctorService  = require("../services/doctorService.js");

const doctorController = {
  async getAll(req, res) {
    try {
      const doctors = await doctorService.getDoctors();
      res.json(doctors);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};


module.exports = doctorController;