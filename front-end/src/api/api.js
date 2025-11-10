import axios from "axios";

const API_URL = "http://localhost:5000/api"; // sửa theo backend

export const getAvailableSlots = async (doctorId, date) => {
  const res = await axios.get(`${API_URL}/slots/available`, {
    params: { doctorId, date }
  });
  return res.data;
};

export const makeAppointment = async ({ patientId, doctorId, slotId, reason, workDate, appointmentType }) => {
  const res = await axios.post(`${API_URL}/appointments`, {
    patientId,
    doctorId,
    slotId,
    reason,
    workDate,
    appointmentType
  });
  return res.data;
};

export const getDoctors = async () => {
  const res = await axios.get(`${API_URL}/auth/doctors`);
  return res.data;
};
