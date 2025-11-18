// src/components/doctor/DoctorDiagnosisHistory.js
import React, { useEffect, useState } from "react";

export default function DoctorDiagnosisHistory() {
  const [history, setHistory] = useState([]);
  const [services, setServices] = useState([]);

  const [dateFilter, setDateFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const token = localStorage.getItem("token");

  // ---------- CHỈ HIỂN THỊ GIỜ (HH:mm) ----------
  const formatTimeOnly = (time) => {
    if (!time || time === "null" || time === "undefined") return "--:--";
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "--:--";
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // ---------- HIỂN THỊ NGÀY + GIỜ (dùng cho popup nếu cần) ----------
  const formatDateTime = (date, time) => {
    if (!date || !time) return "N/A";
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "N/A";
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // ---------- LOAD SERVICES ----------
  useEffect(() => {
    fetch(`http://localhost:5000/api/services`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setServices)
      .catch(console.error);
  }, [token]);

  // ---------- LOAD HISTORY ----------
  const loadHistory = async () => {
    const p = new URLSearchParams();
    dateFilter && p.append("date", dateFilter);
    patientFilter && p.append("patient", patientFilter);
    serviceFilter && p.append("serviceId", serviceFilter);

    try {
      const res = await fetch(
        `http://localhost:5000/api/diagnoses/history?${p}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error();
      setHistory(await res.json());
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [dateFilter, patientFilter, serviceFilter, token]);

  // ---------- UI ----------
  return (
    <div style={{ background: "#f0f8ff", minHeight: "100vh", padding: "30px" }}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>LỊCH SỬ CHẨN ĐOÁN</h2>

        {/* FILTERS */}
        <div style={filterGrid}>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Lọc theo bệnh nhân..."
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            style={inputStyle}
          />
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="">-- Lọc theo dịch vụ --</option>
            {services.map((s) => (
              <option key={s.serviceId} value={s.serviceId}>
                {s.serviceName}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Bệnh nhân</th>
                <th>Ngày khám</th>
                <th>Thời gian</th>
                <th>Kết quả</th>
                <th>Dịch vụ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.diagnosisId}>
                    <td>#{h.diagnosisId}</td>
                    <td>{h.patientName}</td>
                    <td>{new Date(h.workDate).toLocaleDateString("vi-VN")}</td>
                    <td>
                      {formatTimeOnly(h.startTime)} -{" "}
                      {formatTimeOnly(h.endTime)}
                    </td>
                    <td>{h.diagnosisResult || "N/A"}</td>
                    <td>{h.serviceName || "Không có"}</td>
                    <td>
                      <button
                        onClick={() => setSelectedItem(h)}
                        style={btnStyleSmall}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* POPUP - Vẫn giữ ngày + giờ để chi tiết */}
        {selectedItem && (
          <div style={popupOverlay} onClick={() => setSelectedItem(null)}>
            <div style={popupBox} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: "#1E90FF", marginTop: 0 }}>
                Chi tiết chẩn đoán #{selectedItem.diagnosisId}
              </h3>
              <p>
                <strong>Bệnh nhân:</strong> {selectedItem.patientName}
              </p>
              <p>
                <strong>Ngày khám:</strong>{" "}
                {new Date(selectedItem.workDate).toLocaleDateString("vi-VN")}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {formatTimeOnly(selectedItem.startTime)} –{" "}
                {formatTimeOnly(selectedItem.endTime)}
              </p>
              <p>
                <strong>Triệu chứng:</strong>{" "}
                {selectedItem.symptoms || "Không có"}
              </p>
              <p>
                <strong>Kết quả:</strong>{" "}
                {selectedItem.diagnosisResult || "Không có"}
              </p>
              <p>
                <strong>Ghi chú:</strong>{" "}
                {selectedItem.doctorNote || "Không có"}
              </p>
              <p>
                <strong>Dịch vụ:</strong>{" "}
                {selectedItem.serviceName || "Không có"}
              </p>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ ...btnStyleSmall, marginTop: "20px", width: "100%" }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const containerStyle = {
  maxWidth: "1200px",
  margin: "auto",
  background: "#fff",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(0,0,0,.1)",
};

const titleStyle = {
  textAlign: "center",
  fontWeight: "bold",
  color: "#1E90FF",
  marginBottom: "30px",
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "2px solid #1E90FF",
  fontSize: "16px",
  background: "#fff",
  outline: "none",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(0,0,0,.1)",
  minWidth: "800px",
};

const btnStyleSmall = {
  padding: "8px 16px",
  background: "#1E90FF",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
};

const popupOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const popupBox = {
  background: "#fff",
  padding: "25px",
  borderRadius: "15px",
  width: "90%",
  maxWidth: "500px",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
};
