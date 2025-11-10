const  doctorAccess  = require("../access/doctorAccess.js");

const doctorService = {
  async getDoctors() {
    return await doctorAccess.getAll();
  },
};

module.exports =  doctorService;