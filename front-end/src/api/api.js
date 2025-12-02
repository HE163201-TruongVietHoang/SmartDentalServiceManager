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

// Promotion APIs
export const getAllPromotions = async () => {
  const res = await axios.get(`${API_URL}/promotions`);
  return res.data;
};

export const createPromotion = async (promotionData) => {
  const res = await axios.post(`${API_URL}/promotions`, promotionData);
  return res.data;
};

export const updatePromotion = async (id, promotionData) => {
  const res = await axios.put(`${API_URL}/promotions/${id}`, promotionData);
  return res.data;
};

export const deletePromotion = async (id) => {
  const res = await axios.delete(`${API_URL}/promotions/${id}`);
  return res.data;
};

export const applyPromotion = async (data) => {
  const res = await axios.post(`${API_URL}/promotions/apply`, data);
  return res.data;
};

// Invoice APIs
export const getAllInvoices = async () => {
  const res = await axios.get(`${API_URL}/invoices`);
  return res.data;
};

export const createInvoice = async (invoiceData) => {
  const res = await axios.post(`${API_URL}/invoices`, invoiceData);
  return res.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const res = await axios.put(`${API_URL}/invoices/${id}`, invoiceData);
  return res.data;
};

export const getInvoiceById = async (id) => {
  const res = await axios.get(`${API_URL}/invoices/${id}`);
  return res.data;
};

export const getInvoiceDetail = async (id) => {
  const res = await axios.get(`${API_URL}/invoices/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}` // Giả sử token lưu trong localStorage
    }
  });
  return res.data;
};

export const getReceptionist = async () => {
  const res = await axios.get(`${API_URL}/auth/receptionist`);
  return res.data;
};

export const getReceptionists = async () => {
  const res = await axios.get(`${API_URL}/auth/receptionists`);
  return res.data;
};

export const getInvoicesByPatient = async (patientId) => {
  const res = await axios.get(`${API_URL}/invoices/patient/${patientId}`);
  return res.data;
};

// Payment APIs
export const createPaymentUrl = async (paymentData) => {
  const res = await axios.post(`${API_URL}/payments/create-url`, paymentData);
  return res.data;
};

export const getAllPayments = async () => {
  const res = await axios.get(`${API_URL}/payments`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};

export const getPaymentsByUserId = async (userId) => {
  const res = await axios.get(`${API_URL}/payments/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data;
};
