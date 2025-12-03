import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DoctorPrescription() {
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [items, setItems] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ======================================
  // FETCH API HELPER
  // ======================================
  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const res = await fetch(`http://localhost:5000/api${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!res.ok) throw new Error((await res.json()).error);
    return await res.json();
  };

  // ======================================
  // LOAD APPOINTMENTS + MEDICINES
  // ======================================
  useEffect(() => {
    loadAppointments();
    loadMedicines();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI("/prescriptions/waiting");

      // Bạn cần tạo API này để lấy các appointment có status = WaitingForPrescription
      setAppointments(data);
    } catch (err) {
      toast.error("Lỗi load appointment: " + err.message);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không tải được danh sách thuốc");
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      toast.error("Lỗi load medicines: " + err.message);
    }
  };

  // ======================================
  // SELECT APPOINTMENT
  // ======================================
  const handleSelectAppointment = (id) => {
    const a = appointments.find((ap) => ap.appointmentId === parseInt(id));
    setSelectedAppointment(a);
    setItems([]);
  };

  // ======================================
  // ADD MEDICINE ITEM
  // ======================================
  const addItem = () => {
    setItems([
      ...items,
      {
        medicineId: "",
        quantity: 1,
        dosage: "",
        usageInstruction: "",
      },
    ]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (i) => {
    setItems(items.filter((_, idx) => idx !== i));
  };

  // ======================================
  // SUBMIT PRESCRIPTION
  // ======================================
  const submitPrescription = async () => {
    if (!selectedAppointment) return toast.warning("Chưa chọn ca khám!");
    if (items.length === 0) return toast.warning("Chưa thêm thuốc!");

    try {
      await fetchAPI("/prescriptions/create", "POST", {
        diagnosisId: selectedAppointment.diagnosisId,
        patientId: selectedAppointment.patientId,
        medicines: items,
      });

      toast.success("Kê đơn thành công!");
      loadAppointments();
      setSelectedAppointment(null);
      setItems([]);
    } catch (err) {
      toast.error("Lỗi kê đơn: " + err.message);
    }
  };

  // ======================================
  // RENDER UI
  // ======================================
  return (
    <div style={{ padding: "30px", maxWidth: "1100px", margin: "auto" }}>
      <h2 style={{ color: "#2DBA8F", fontWeight: "bold", textAlign: "center" }}>
        KÊ ĐƠN THUỐC – BÁC SĨ
      </h2>

      {/* Select Appointment */}
      <div
        style={{
          margin: "20px 0",
          padding: 20,
          background: "#E8FAF2",
          borderRadius: 10,
        }}
      >
        <label style={{ fontWeight: 600 }}>Chọn ca khám đang chờ kê đơn:</label>
        <select
          onChange={(e) => handleSelectAppointment(e.target.value)}
          style={selectStyle}
        >
          <option value="">-- Chọn ca khám --</option>
          {appointments.map((a) => (
            <option key={a.appointmentId} value={a.appointmentId}>
              #{a.appointmentId} | {a.patientName} | {a.startTime}-{a.endTime}
            </option>
          ))}
        </select>
      </div>

      {/* Prescription Form */}
      {selectedAppointment && (
        <>
          <h3 style={{ marginTop: 20, color: "#333" }}>Thông tin đơn thuốc</h3>

          {items.map((item, index) => (
            <div key={index} style={itemContainer}>
              <select
                value={item.medicineId}
                onChange={(e) =>
                  updateItem(index, "medicineId", e.target.value)
                }
                style={{ ...inputStyle, width: "30%" }}
              >
                <option value="">-- Chọn thuốc --</option>
                {medicines.map((m) => (
                  <option key={m.medicineId} value={m.medicineId}>
                    {m.medicineName} – {m.price}đ
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={item.quantity}
                min={1}
                style={{ ...inputStyle, width: "12%" }}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                placeholder="Số lượng"
              />

              <input
                type="text"
                value={item.dosage}
                style={{ ...inputStyle, width: "20%" }}
                onChange={(e) => updateItem(index, "dosage", e.target.value)}
                placeholder="Liều dùng"
              />

              <input
                type="text"
                value={item.usageInstruction}
                style={{ ...inputStyle, width: "25%" }}
                onChange={(e) =>
                  updateItem(index, "usageInstruction", e.target.value)
                }
                placeholder="Hướng dẫn dùng"
              />

              <button style={btnDanger} onClick={() => removeItem(index)}>
                X
              </button>
            </div>
          ))}

          <button onClick={addItem} style={btnAdd}>
            + Thêm thuốc
          </button>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button style={btnSave} onClick={submitPrescription}>
              LƯU ĐƠN THUỐC
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ======================================
// CSS Styles
// ======================================
const selectStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  borderRadius: "8px",
  border: "2px solid #2DBA8F",
  background: "#fff",
  fontSize: "16px",
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #bbb",
  borderRadius: "8px",
  fontSize: "14px",
};

const itemContainer = {
  display: "flex",
  gap: "10px",
  background: "#F7FFFA",
  padding: "15px",
  marginTop: "10px",
  borderRadius: "10px",
  alignItems: "center",
};

const btnAdd = {
  padding: "10px 20px",
  background: "#24C08C",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  marginTop: "10px",
  cursor: "pointer",
};

const btnSave = {
  padding: "14px 40px",
  background: "#0094FF",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnDanger = {
  background: "red",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: "8px",
  cursor: "pointer",
};
