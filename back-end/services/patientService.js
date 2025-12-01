const patientAccess = require("../access/patientAccess");
const { getAll, getById } = require("../access/patientAccess");

const patientService = {
  async getAllPatients() {
    const patients = await getAll();
    return patients.map((p) => ({
      ...p,
      createdAt: p.createdAt?.toISOString(),
      updatedAt: p.updatedAt?.toISOString(),
    }));
  },

  async getPatientDetail(patientId) {
    const patient = await getById(patientId);
    if (!patient) throw new Error("Patient not found");
    return {
      ...patient,
      createdAt: patient.createdAt?.toISOString(),
      updatedAt: patient.updatedAt?.toISOString(),
    };
  },
  async getPatientMedicalRecord(patientId) {
    return await patientAccess.getPatientMedicalRecord(patientId);
  },
};

module.exports = { patientService };
