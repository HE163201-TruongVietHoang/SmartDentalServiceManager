const doctorAccess = require("../access/doctorAccess.js");

const doctorService = {
  async getDoctors() {
    return await doctorAccess.getAll();
  },
  async getDoctorById(userId) {
    return await doctorAccess.getById(userId);
  },
};

module.exports = doctorService;
