// src/components/doctor/DoctorDiagnosis.js
import React, { useEffect, useState } from "react";

export default function DoctorDiagnosis() {
  const [appointments, setAppointments] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  // Form inputs
  const [symptoms, setSymptoms] = useState("");
  const [diagnosisResult, setDiagnosisResult] = useState("");
  const [doctorNote, setDoctorNote] = useState("");
  const [activeTab, setActiveTab] = useState("diagnosis");

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  // ===============================
  // FETCH API
  // ===============================
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

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    if (token && userId) {
      loadAppointments();
      loadAllServices();
    }
  }, [token, userId]);

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI(`/appointments`);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      alert("Lỗi load ca khám: " + err.message);
    }
  };

  const loadAllServices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Không tải được dịch vụ");
      const data = await res.json();
      setAllServices(data);
    } catch (err) {
      console.error("LỖI LOAD DỊCH VỤ:", err);
      alert("Không tải được danh sách dịch vụ!");
    }
  };

  // ===============================
  // CHỌN CA KHÁM
  // ===============================
  const handleAppointmentChange = (appointmentId) => {
    const appointment = appointments.find(
      (a) => a.appointmentId === parseInt(appointmentId)
    );
    setSelectedAppointment(appointment);
    setDiagnosis(null);
    setSelectedServices([]);
    setSymptoms("");
    setDiagnosisResult("");
    setDoctorNote("");
    setActiveTab("diagnosis");
  };

  // ===============================
  // TẠO CHẨN ĐOÁN MỚI
  // ===============================
  const handleCreateDiagnosis = async () => {
    if (!selectedAppointment || !diagnosisResult.trim()) {
      return alert("Chọn ca và nhập kết quả chẩn đoán!");
    }

    try {
      const data = await fetchAPI("/create", "POST", {
        appointmentId: selectedAppointment.appointmentId,
        symptoms: symptoms || null,
        diagnosisResult,
        doctorNote: doctorNote || null,
      });

      setDiagnosis(data);
      setActiveTab("services");
      ting();
      alert("✅ Tạo chẩn đoán thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // ===============================
  // THÊM DỊCH VỤ CHO CHẨN ĐOÁN
  // ===============================
  const handleAddServices = async () => {
    if (!diagnosis || selectedServices.length === 0) {
      return alert("Chọn ít nhất một dịch vụ!");
    }

    try {
      // map mảng ID sang dạng có note (nếu cần)
      const servicesPayload = selectedServices.map((id) => ({
        serviceId: id,
        note: "Thêm bởi bác sĩ",
      }));

      await fetchAPI(`/${diagnosis.diagnosisId}/services`, "POST", {
        services: servicesPayload,
      });

      ting();
      alert(`Đã thêm ${selectedServices.length} dịch vụ!`);
      setSelectedServices([]);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // ===============================
  // GIAO DIỆN
  // ===============================
  const formatTime = (t) => {
    if (!t) return "";
    // Nếu server trả về "PT09H30M00S" hoặc tương tự, cắt thành hh:mm
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

  const ting = () =>
    new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
    )
      .play()
      .catch(() => {});

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "auto" }}>
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            boxShadow: "0 4px 20px rgba(0,0,0,.1)",
          }}
        >
          <h2
            style={{
              color: "#2ECCB6",
              textAlign: "center",
              marginBottom: "30px",
              fontWeight: "bold",
            }}
          >
            CHẨN ĐOÁN & DỊCH VỤ – BÁC SĨ
          </h2>

          {/* Chọn ca khám */}
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              background: "#E8FAF6",
              borderRadius: "10px",
            }}
          >
            <label
              style={{
                fontWeight: 600,
                display: "block",
                marginBottom: "10px",
              }}
            >
              Chọn ca khám hôm nay:
            </label>
            <select
              onChange={(e) => handleAppointmentChange(e.target.value)}
              style={selectStyle}
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

          {/* Tabs */}
          {selectedAppointment && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              {[
                { key: "diagnosis", label: "CHẨN ĐOÁN", color: "#1E90FF" },
                {
                  key: "services",
                  label: "THÊM DỊCH VỤ",
                  color: "#32CD32",
                  disabled: !diagnosis,
                },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => !t.disabled && setActiveTab(t.key)}
                  disabled={t.disabled}
                  style={{
                    ...btnStyle(t.color),
                    margin: "0 8px",
                    opacity: t.disabled ? 0.4 : activeTab === t.key ? 1 : 0.7,
                    transform: activeTab === t.key ? "scale(1.05)" : "scale(1)",
                    transition: "all .2s",
                    cursor: t.disabled ? "not-allowed" : "pointer",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Form Chẩn đoán */}
          {activeTab === "diagnosis" && selectedAppointment && (
            <div
              style={{
                padding: "20px",
                background: "#e6f7ff",
                borderRadius: "10px",
              }}
            >
              <p>
                <b>Bệnh nhân:</b> {selectedAppointment.patientName}
              </p>
              <p>
                <b>Thời gian:</b> {formatTime(selectedAppointment.startTime)} -{" "}
                {formatTime(selectedAppointment.endTime)}
              </p>

              <textarea
                placeholder="Triệu chứng (symptoms)..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                style={{ ...inputStyle, height: "80px", resize: "none" }}
              />

              <textarea
                placeholder="Kết quả chẩn đoán (diagnosisResult)..."
                value={diagnosisResult}
                onChange={(e) => setDiagnosisResult(e.target.value)}
                style={{ ...inputStyle, height: "100px", resize: "none" }}
              />

              <input
                type="text"
                placeholder="Ghi chú của bác sĩ (tùy chọn)..."
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
                style={inputStyle}
              />

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={handleCreateDiagnosis}
                  style={btnStyle("#1E90FF")}
                >
                  TẠO CHẨN ĐOÁN
                </button>
              </div>
            </div>
          )}

          {/* Danh sách dịch vụ */}
          {activeTab === "services" && diagnosis && (
            <div
              style={{
                padding: "20px",
                background: "#f0fff0",
                borderRadius: "10px",
              }}
            >
              <h4 style={{ color: "#32CD32", marginBottom: "10px" }}>
                Chọn dịch vụ điều trị
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))",
                  gap: "12px",
                }}
              >
                {allServices.map((s) => (
                  <div
                    key={s.serviceId}
                    onClick={() => toggleService(s.serviceId)}
                    style={{
                      padding: "14px",
                      background: selectedServices.includes(s.serviceId)
                        ? "#e6f7e6"
                        : "#fff",
                      borderRadius: "8px",
                      border: `2px solid ${
                        selectedServices.includes(s.serviceId)
                          ? "#32CD32"
                          : "#ddd"
                      }`,
                      cursor: "pointer",
                    }}
                  >
                    <strong>{s.serviceName}</strong>
                    <p style={{ margin: "4px 0", color: "#666" }}>
                      {s.price?.toLocaleString("vi-VN")} VNĐ
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={handleAddServices}
                  style={btnStyle("#32CD32")}
                  disabled={selectedServices.length === 0}
                >
                  THÊM DỊCH VỤ ({selectedServices.length})
                </button>
              </div>
            </div>
          )}

          {!selectedAppointment && (
            <p
              style={{ textAlign: "center", color: "#888", marginTop: "40px" }}
            >
              Vui lòng chọn một ca khám để bắt đầu chẩn đoán.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ===============================
// STYLE
// ===============================
const selectStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "2px solid #1E90FF",
  fontSize: "16px",
  background: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "2px solid #1E90FF",
  fontSize: "16px",
  marginBottom: "15px",
};

const btnStyle = (bg) => ({
  padding: "14px 40px",
  background: bg,
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,.2)",
});
