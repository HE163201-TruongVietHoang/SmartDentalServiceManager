// src/components/doctor/DoctorDiagnosis.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function DoctorDiagnosis() {
  const [appointments, setAppointments] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);

  const [symptoms, setSymptoms] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState("");
  const [doctorNote, setDoctorNote] = useState("");

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  // =============================
  // API WRAPPER
  // =============================
  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const res = await fetch(`http://localhost:5000/api/diagnoses${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Lỗi server");
    }
    return await res.json();
  };

  // =============================
  // LOAD DATA
  // =============================
  useEffect(() => {
    if (token && userId) {
      loadAppointments();
      loadAllServices();
      loadAllMedicines();
    }
  }, [token, userId]);

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI(`/appointments`);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Lỗi load ca khám: " + err.message);
    }
  };

  const loadAllServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllServices(data);
    } catch (err) {
      toast.error("Không tải được danh sách dịch vụ!");
    }
  };

  const loadAllMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      toast.error("Không tải được danh sách thuốc!");
    }
  };

  // =============================
  // HANDLE APPOINTMENT
  // =============================
  const handleAppointmentChange = (appointmentId) => {
    const appointment = appointments.find(
      (a) => a.appointmentId === parseInt(appointmentId)
    );
    setSelectedAppointment(appointment || null);
    setSelectedServices([]);
    setSelectedMedicines([]);
    setSymptoms("");
    setDiagnosisResult("");
    setDoctorNote("");
  };

  // =============================
  // MEDICINES
  // =============================
  const addMedicine = () => {
    setSelectedMedicines((prev) => [
      ...prev,
      { medicineId: "", quantity: 1, dosage: "", usageInstruction: "" },
    ]);
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...selectedMedicines];
    updated[index][field] = value;
    setSelectedMedicines(updated);
  };

  const removeMedicine = (index) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  // =============================
  // SUBMIT DIAGNOSIS
  // =============================
  const handleCreateDiagnosis = async () => {
    if (!selectedAppointment) return toast.warning("Vui lòng chọn ca khám.");

    if (!diagnosisResult.trim())
      return toast.info("Vui lòng nhập kết luận chẩn đoán.");

    const payload = {
      appointmentId: selectedAppointment.appointmentId,
      symptoms,
      diagnosisResult,
      doctorNote,
      services: selectedServices.map((id) => ({
        serviceId: id,
        note: "Thêm bởi bác sĩ",
      })),
      medicines: selectedMedicines,
    };

    try {
      await fetchAPI("/create", "POST", payload);

      // Sau khi tạo diagnosis, thêm services vào appointment
      for (const serviceId of selectedServices) {
        await fetch(
          `http://localhost:5000/api/appointments/${selectedAppointment.appointmentId}/services`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ serviceId }),
          }
        );
      }

      toast.success("Hoàn tất chẩn đoán & kê đơn!");
      window.location.reload();
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    }
  };

  // =============================
  // HELPERS
  // =============================
  const formatTime = (t) => {
    if (!t) return "";
    const parts = t.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : t;
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={pageInner}>
      <div style={headerBox}>
        <h1 style={headerTitle}>Chẩn đoán & Kê đơn</h1>
      </div>

      <div style={cardShell}>
        {/* Chọn ca khám */}
        <div style={appointmentRow}>
          <div style={{ flex: 1 }}>
            <label style={labelStrong}>Chọn ca khám</label>
            <select
              style={selectMain}
              onChange={(e) => handleAppointmentChange(e.target.value)}
              value={selectedAppointment?.appointmentId || ""}
            >
              <option value="">-- Chọn ca khám --</option>

              {appointments.map((a) => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  #{a.appointmentId} | {a.patientName} |{" "}
                  {formatTime(a.startTime)} - {formatTime(a.endTime)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nếu đã chọn ca khám */}
        {selectedAppointment ? (
          <div style={gridTwoCols}>
            {/* Cột trái */}
            <div style={leftCol}>
              <div style={infoCard}>
                <span style={infoBadge}>Thông tin bệnh nhân</span>
                <p style={infoText}>
                  <b>Bệnh nhân:</b> {selectedAppointment.patientName}
                </p>
                <p style={infoText}>
                  <b>Thời gian:</b> {formatTime(selectedAppointment.startTime)}{" "}
                  - {formatTime(selectedAppointment.endTime)}
                </p>
              </div>

              {/* Chẩn đoán */}
              <div style={blockMint}>
                <h3 style={sectionTitle}>Chẩn đoán</h3>

                <textarea
                  placeholder="Triệu chứng..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  style={{ ...inputArea, minHeight: 80 }}
                />

                <textarea
                  placeholder="Kết luận chẩn đoán..."
                  value={diagnosisResult}
                  onChange={(e) => setDiagnosisResult(e.target.value)}
                  style={{ ...inputArea, minHeight: 90 }}
                />

                <input
                  type="text"
                  placeholder="Ghi chú bác sĩ..."
                  value={doctorNote}
                  onChange={(e) => setDoctorNote(e.target.value)}
                  style={inputText}
                />
              </div>
            </div>

            {/* Cột phải */}
            <div style={rightCol}>
              {/* Dịch vụ */}
              <div style={blockMint}>
                <h3 style={sectionTitle}>Dịch vụ thực hiện</h3>

                <div style={serviceGrid}>
                  {allServices.map((s) => (
                    <div
                      key={s.serviceId}
                      onClick={() => toggleService(s.serviceId)}
                      style={serviceBox(selectedServices.includes(s.serviceId))}
                    >
                      <b>{s.serviceName}</b>
                      <span style={servicePrice}>
                        {s.price?.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Đơn thuốc */}
              <div style={blockMint}>
                <h3 style={sectionTitle}>Đơn thuốc</h3>

                {selectedMedicines.map((med, index) => (
                  <div
                    key={index}
                    style={{ ...medicineRow, position: "relative" }}
                  >
                    {/* Nút xóa thuốc */}
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      style={{
                        position: "absolute",
                        right: "-10px",
                        top: "-10px",
                        background: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 24,
                        height: 24,
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </button>

                    {/* Các input thuốc giữ nguyên */}
                    <select
                      style={selectSmall}
                      value={med.medicineId}
                      onChange={(e) =>
                        updateMedicine(index, "medicineId", e.target.value)
                      }
                    >
                      <option value="">Thuốc</option>
                      {medicines.map((m) => (
                        <option key={m.medicineId} value={m.medicineId}>
                          {m.medicineName}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      style={inputSmall}
                      placeholder="SL"
                      value={med.quantity}
                      onChange={(e) =>
                        updateMedicine(index, "quantity", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      style={inputSmall}
                      placeholder="Liều dùng"
                      value={med.dosage}
                      onChange={(e) =>
                        updateMedicine(index, "dosage", e.target.value)
                      }
                    />

                    <input
                      type="text"
                      style={inputSmall}
                      placeholder="Hướng dẫn"
                      value={med.usageInstruction}
                      onChange={(e) =>
                        updateMedicine(
                          index,
                          "usageInstruction",
                          e.target.value
                        )
                      }
                    />
                  </div>
                ))}

                <button type="button" onClick={addMedicine} style={btnAdd}>
                  + Thêm thuốc
                </button>
              </div>
            </div>

            <div style={footerRow}>
              <button
                type="button"
                onClick={handleCreateDiagnosis}
                style={btnPrimary}
              >
                HOÀN TẤT CHẨN ĐOÁN
              </button>
            </div>
          </div>
        ) : (
          <p style={emptyHint}>Vui lòng chọn ca khám để bắt đầu chẩn đoán.</p>
        )}
      </div>
    </div>
  );
}

/* =============================
   STYLE — tông xanh mint nhẹ
   ============================= */

const pageWrapper = {
  minHeight: "100vh",
  padding: "40px 20px",
  background: "#f5fffd",
};

const pageInner = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const headerBox = {
  textAlign: "center",
  marginBottom: 20,
};

const headerTitle = {
  fontSize: 28,
  fontWeight: 700,
  color: "#16a39c",
};

const cardShell = {
  background: "#ffffff",
  borderRadius: 18,
  padding: 25,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
};

const appointmentRow = {
  marginBottom: 20,
  padding: 18,
  background: "#E8FAF6",
  borderRadius: 12,
  border: "1px solid #CDEDE8",
};

const labelStrong = {
  fontWeight: 600,
  marginBottom: 8,
  color: "#0ba892",
};

const selectMain = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "2px solid #2ec9b4",
  background: "#ffffff",
  fontSize: "15px",
};

const gridTwoCols = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
};

const leftCol = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const rightCol = {
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const infoCard = {
  background: "#ffffff",
  borderRadius: 12,
  padding: 15,
  border: "1px solid #dff5f0",
};

const infoBadge = {
  background: "#2ec9b4",
  color: "#fff",
  padding: "4px 12px",
  borderRadius: "20px",
  fontSize: 12,
  display: "inline-block",
  marginBottom: 8,
};

const infoText = {
  margin: "4px 0",
  color: "#145f58",
};

const blockMint = {
  background: "#E8FAF6",
  borderRadius: 12,
  padding: 16,
  border: "1px solid #CDEDE8",
};

const sectionTitle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 10,
  color: "#118c82",
};

const inputText = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "2px solid #2ec9b4",
  background: "#ffffff",
  marginBottom: 10,
};

const inputArea = {
  ...inputText,
  resize: "vertical",
};

const serviceGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  gap: 12,
};

const serviceBox = (active) => ({
  padding: 14,
  borderRadius: 10,
  background: active ? "#C6F5EC" : "#fff",
  border: `2px solid ${active ? "#2ec9b4" : "#d9d9d9"}`,
  cursor: "pointer",
  transition: "0.2s",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  minHeight: "70px",
});

const servicePrice = {
  fontSize: 13,
  color: "#555",
};

const medicineRow = {
  display: "grid",
  gridTemplateColumns: "1.5fr 0.5fr 1fr 1fr",
  gap: 8,
  marginBottom: 10,
};

const selectSmall = {
  ...selectMain,
  padding: "8px",
  fontSize: 14,
};

const inputSmall = {
  ...inputText,
  padding: "8px",
  marginBottom: 0,
};

const btnAdd = {
  width: "100%",
  padding: 12,
  background: "#2ec9b4",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginTop: 6,
};

const footerRow = {
  gridColumn: "1 / -1",
  marginTop: 15,
};

const btnPrimary = {
  width: "100%",
  padding: "14px",
  background: "#12c2a0",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(18,194,160,0.35)",
};

const emptyHint = {
  marginTop: 20,
  textAlign: "center",
  color: "#7aa8a3",
  fontStyle: "italic",
};
