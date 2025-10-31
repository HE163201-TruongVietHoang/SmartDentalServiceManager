import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";

export default function NurseMaterialPage() {
  const [appointments, setAppointments] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceMaterials, setServiceMaterials] = useState([]);

  // Form states
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [activeTab, setActiveTab] = useState("use"); // use, return, used

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/materials${endpoint}`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: body ? JSON.stringify(body) : null,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Lỗi khi gọi API");
      }

      return await res.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  };

  useEffect(() => {
    loadAppointments();
    loadAllMaterials();
  }, []);

  const loadAllMaterials = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/materials", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAllMaterials(data);
      }
    } catch (err) {
      console.error("Không thể tải danh sách vật tư:", err);
      setAllMaterials([]);
    }
  };

  const loadAppointments = async () => {
    try {
      const data = await fetchAPI("/appointments");
      if (Array.isArray(data)) setAppointments(data);
      else setAppointments([]);
    } catch (err) {
      alert("Không thể tải danh sách ca khám: " + err.message);
      setAppointments([]);
    }
  };

  const handleAppointmentChange = async (appointmentId) => {
    const appointment = appointments.find(
      (a) => a.appointmentId === parseInt(appointmentId)
    );
    setSelectedAppointment(appointment);

    if (appointment?.serviceId) {
      setSelectedService(appointment.serviceId);
      try {
        const data = await fetchAPI(`/service/${appointment.serviceId}`);
        setServiceMaterials(data);
      } catch {
        setServiceMaterials([]);
      }
    } else setServiceMaterials([]);
  };

  const handleUse = async () => {
    if (!selectedAppointment || !materialId || !quantity) {
      alert("Vui lòng chọn ca khám và nhập đầy đủ thông tin");
      return;
    }
    try {
      const res = await fetchAPI("/use", "POST", {
        materialId: parseInt(materialId),
        userId,
        appointmentId: selectedAppointment.appointmentId,
        quantity: parseFloat(quantity),
        note: note || null,
      });
      alert(res.message || "Đã lấy vật tư thành công!");
      resetForm();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleReturn = async () => {
    if (!selectedAppointment || !materialId || !quantity) {
      alert("Vui lòng chọn ca khám và nhập đầy đủ thông tin");
      return;
    }
    try {
      const res = await fetchAPI("/return", "POST", {
        materialId: parseInt(materialId),
        userId,
        appointmentId: selectedAppointment.appointmentId,
        quantity: parseFloat(quantity),
        note: note || null,
      });
      alert(res.message || "Đã hoàn vật tư thành công!");
      resetForm();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleUsed = async () => {
    if (!selectedAppointment || !materialId || !quantity) {
      alert("Vui lòng chọn ca khám và nhập đầy đủ thông tin");
      return;
    }
    try {
      const res = await fetchAPI("/used", "POST", {
        appointmentId: selectedAppointment.appointmentId,
        materialId: parseInt(materialId),
        quantityUsed: parseFloat(quantity),
        note: note || null,
      });
      alert(res.message || "Đã ghi nhận vật tư thực tế!");
      resetForm();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleUseAllByStandard = async () => {
    if (!selectedAppointment) {
      alert("Vui lòng chọn ca khám");
      return;
    }
    if (serviceMaterials.length === 0) {
      alert("Ca khám này chưa có vật tư định mức");
      return;
    }

    const materialList = serviceMaterials
      .map((m) => `- ${m.materialName}: ${m.standardQuantity} ${m.unit}`)
      .join("\n");
    const confirmMsg = `Bạn có chắc muốn lấy tất cả ${serviceMaterials.length} vật tư theo định mức?\n\n${materialList}`;
    if (!window.confirm(confirmMsg)) return;

    let successCount = 0,
      failCount = 0,
      errors = [];
    for (const material of serviceMaterials) {
      try {
        await fetchAPI("/use", "POST", {
          materialId: material.materialId,
          userId,
          appointmentId: selectedAppointment.appointmentId,
          quantity: parseFloat(material.standardQuantity),
          note: `Lấy theo định mức - ${selectedAppointment.serviceName}`,
        });
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`${material.materialName}: ${err.message}`);
      }
    }

    let resultMsg = `🎉 Hoàn thành!\n✅ Thành công: ${successCount}\n❌ Thất bại: ${failCount}`;
    if (errors.length > 0)
      resultMsg += `\n\n📋 Chi tiết lỗi:\n${errors.join("\n")}`;
    alert(resultMsg);
  };

  const resetForm = () => {
    setMaterialId("");
    setQuantity(1);
    setNote("");
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#f0fffa",
          minHeight: "100vh",
          padding: "40px 20px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
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
              🦷 Quản lý vật tư y tế — Y tá
            </h2>

            {/* --- CHỌN CA KHÁM --- */}
            <div
              style={{
                marginBottom: "30px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <label
                style={{
                  fontWeight: "600",
                  marginBottom: "10px",
                  display: "block",
                }}
              >
                📋 Chọn ca khám hôm nay:
              </label>
              <select
                onChange={(e) => handleAppointmentChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "2px solid #2ECCB6",
                  fontSize: "16px",
                }}
              >
                <option value="">-- Chọn ca khám --</option>
                {appointments.map((a) => (
                  <option key={a.appointmentId} value={a.appointmentId}>
                    #{a.appointmentId} | {a.patientName} | {a.startTime} -{" "}
                    {a.endTime} | BS: {a.doctorName} |{" "}
                    {a.serviceName || "Chưa có dịch vụ"}
                  </option>
                ))}
              </select>
            </div>

            {/* --- VẬT TƯ ĐỊNH MỨC --- */}
            {serviceMaterials.length > 0 && (
              <div
                style={{
                  marginBottom: "30px",
                  padding: "20px",
                  backgroundColor: "#e8f8f5",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h6
                    style={{ color: "#27ae60", margin: 0, fontWeight: "bold" }}
                  >
                    📦 Vật tư định mức cho dịch vụ:
                  </h6>
                  <button
                    onClick={handleUseAllByStandard}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    ⚡ Lấy tất cả theo định mức
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {serviceMaterials.map((sm) => (
                    <div
                      key={sm.materialId}
                      onClick={() => setMaterialId(sm.materialId)}
                      style={{
                        padding: "12px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "2px solid #27ae60",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ color: "#27ae60" }}>
                        ID: {sm.materialId}
                      </strong>
                      <p>{sm.materialName}</p>
                      <p style={{ color: "#666" }}>
                        Định mức: {sm.standardQuantity} {sm.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FORM NHẬP LIỆU --- */}
            <div
              style={{
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label style={{ fontWeight: "600" }}>Vật tư:</label>
                  <select
                    value={materialId}
                    onChange={(e) => setMaterialId(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid #2ECCB6",
                    }}
                  >
                    <option value="">-- Chọn vật tư --</option>
                    {allMaterials.map((m) => (
                      <option key={m.materialId} value={m.materialId}>
                        {m.materialName} ({m.unit}) - Tồn: {m.stockQuantity}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight: "600" }}>Số lượng:</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid #2ECCB6",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontWeight: "600" }}>Ghi chú:</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid #2ECCB6",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* --- NÚT THỰC HIỆN --- */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              {activeTab === "use" && (
                <button onClick={handleUse} style={btnStyle("#2ECCB6")}>
                  📤 Xác nhận lấy vật tư
                </button>
              )}
              {activeTab === "return" && (
                <button onClick={handleReturn} style={btnStyle("#f39c12")}>
                  🔄 Xác nhận hoàn vật tư
                </button>
              )}
              {activeTab === "used" && (
                <button onClick={handleUsed} style={btnStyle("#27ae60")}>
                  ✅ Ghi nhận vật tư đã dùng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 🔧 Style helper
const btnStyle = (bg) => ({
  padding: "14px 40px",
  backgroundColor: bg,
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
});
