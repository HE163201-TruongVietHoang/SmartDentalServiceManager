import React, { useEffect, useState } from "react";

export default function ClinicManagerMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usageReport, setUsageReport] = useState([]);
  const [activeTab, setActiveTab] = useState("transactions"); // Mở luôn giao dịch để bạn thấy ngay

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

  // ==================== ĐỊNH MỨC DỊCH VỤ – STATE ====================
  const [services, setServices] = useState([]);
  const [serviceMaterials, setServiceMaterials] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [editQty, setEditQty] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterialId, setNewMaterialId] = useState("");
  const [newStandardQty, setNewStandardQty] = useState("");

  // ==================== API CALL ====================
  const fetchAPI = async (endpoint, method = "GET", body = null) => {
    const res = await fetch(`http://localhost:5000/api/materials${endpoint}`, {
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

  // ==================== LOAD DATA ====================
  useEffect(() => {
    loadMaterials();
    loadTransactions();
    loadUsageReport();
    loadServices();
    loadServiceMaterials();
    const interval = setInterval(() => {
      loadTransactions();
      loadUsageReport();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadMaterials = async () => {
    try {
      setMaterials(await fetchAPI("/"));
    } catch (err) {
      alert("Lỗi load vật tư: " + err.message);
    }
  };

  const loadTransactions = async () => {
    try {
      setTransactions(await fetchAPI("/transactions"));
    } catch {}
  };

  const loadUsageReport = async () => {
    try {
      setUsageReport(await fetchAPI("/report"));
    } catch {}
  };

  const loadServices = async () => {
    try {
      const data = await fetchAPI("/service/all");
      setServices(data);
      if (data.length > 0 && !selectedService) {
        setSelectedService(data[0].serviceId);
      }
    } catch (err) {
      console.error("Lỗi load dịch vụ:", err);
    }
  };

  const loadServiceMaterials = async () => {
    try {
      const data = await fetchAPI("/service/materials");
      setServiceMaterials(data);
    } catch (err) {
      console.error("Lỗi load định mức:", err);
    }
  };

  // ==================== NHẬP KHO ====================
  const [selId, setSelId] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const handleImport = async () => {
    if (!selId || !qty) return alert("Chọn vật tư + số lượng!");
    try {
      await fetchAPI("/import", "POST", {
        materialId: +selId,
        userId,
        quantity: +qty,
        note: note || "Nhập kho",
      });
      alert("NHẬP KHO THÀNH CÔNG!");
      setSelId("");
      setQty(1);
      setNote("");
      loadMaterials();
      loadTransactions();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // ==================== THÊM VẬT TƯ MỚI ====================
  const [newMat, setNewMat] = useState({ name: "", unit: "", price: "" });
  const handleAddNew = async () => {
    if (!newMat.name || !newMat.unit || !newMat.price)
      return alert("Nhập đủ thông tin!");
    try {
      await fetchAPI("/add", "POST", {
        materialName: newMat.name,
        unit: newMat.unit,
        unitPrice: +newMat.price,
        stockQuantity: 0,
      });
      alert("THÊM MỚI THÀNH CÔNG!");
      setNewMat({ name: "", unit: "", price: "" });
      loadMaterials();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // ==================== ĐỊNH MỨC DỊCH VỤ – HÀM XỬ LÝ ====================
  const handleUpdateStandard = async (id, qty) => {
    if (qty < 0) return alert("Số lượng không hợp lệ");
    try {
      const sm = serviceMaterials.find((s) => s.id === id);
      await fetchAPI(
        `/service/${selectedService}/material/${sm.materialId}`,
        "PUT",
        {
          standardQuantity: +qty,
        }
      );
      alert("Cập nhật thành công!");
      loadServiceMaterials();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleAddToService = async () => {
    if (!newMaterialId || !newStandardQty)
      return alert("Chọn vật tư + số lượng");
    try {
      await fetchAPI(`/service/${selectedService}/material`, "POST", {
        materialId: +newMaterialId,
        standardQuantity: +newStandardQty,
      });
      alert("Thêm thành công!");
      setShowAddModal(false);
      setNewMaterialId("");
      setNewStandardQty("");
      loadServiceMaterials();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleRemoveFromService = async (id) => {
    if (!confirm("Xóa vật tư khỏi dịch vụ?")) return;
    try {
      const sm = serviceMaterials.find((s) => s.id === id);
      await fetchAPI(
        `/service/${selectedService}/material/${sm.materialId}`,
        "DELETE"
      );
      alert("Xóa thành công!");
      loadServiceMaterials();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // ==================== HELPER ====================
  const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");
  const ting = () =>
    new Audio(
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
    )
      .play()
      .catch(() => {});

  // ==================== RENDER ====================
  return (
    <div
      style={{
        background: "#f0fffa",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "auto" }}>
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
            QUẢN LÝ VẬT TƯ – CLINIC MANAGER
          </h2>

          {/* TAB */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              marginBottom: "30px",
              flexWrap: "wrap",
            }}
          >
            {[
              { k: "material", l: "Vật tư" },
              { k: "transactions", l: "Giao dịch" },
              { k: "report", l: "Báo cáo" },
              { k: "import", l: "Nhập kho" },
              { k: "standard", l: "Định mức" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                style={{
                  padding: "12px 24px",
                  background: activeTab === t.k ? "#2ECCB6" : "#ecf0f1",
                  color: activeTab === t.k ? "#fff" : "#2c3e50",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* VẬT TƯ */}
          {activeTab === "material" && (
            <div>
              <h4 style={{ color: "#27ae60", textAlign: "center" }}>
                DANH SÁCH VẬT TƯ
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#27ae60", color: "#fff" }}>
                      <th style={{ padding: "12px" }}>ID</th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Tên vật tư
                      </th>
                      <th style={{ padding: "12px" }}>Đơn vị</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Giá (đ)
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Tồn kho
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => (
                      <tr
                        key={m.materialId}
                        style={{
                          background: m.stockQuantity < 10 ? "#fadbd8" : "#fff",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {m.materialId}
                        </td>
                        <td style={{ padding: "12px" }}>{m.materialName}</td>
                        <td style={{ padding: "12px" }}>{m.unit}</td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {Number(m.unitPrice).toLocaleString("vi")}đ
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "bold",
                            color: m.stockQuantity < 10 ? "#e74c3c" : "#27ae60",
                          }}
                        >
                          {m.stockQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* GIAO DỊCH */}
          {activeTab === "transactions" && (
            <div>
              <h4 style={{ color: "#3498db", textAlign: "center" }}>
                LỊCH SỬ GIAO DỊCH
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#3498db", color: "#fff" }}>
                      <th style={{ padding: "12px" }}>Thời gian</th>
                      <th style={{ padding: "12px" }}>Loại</th>
                      <th style={{ padding: "12px" }}>Vật tư</th>
                      <th style={{ padding: "12px" }}>SL</th>
                      <th style={{ padding: "12px" }}>Người thực hiện</th>
                      <th style={{ padding: "12px" }}>Ca khám</th>
                      <th style={{ padding: "12px" }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr
                        key={t.transactionId}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td style={{ padding: "12px" }}>
                          {formatDate(t.transactionDate)}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              background:
                                t.transactionType === "IMPORT"
                                  ? "#27ae60"
                                  : t.transactionType === "USE"
                                  ? "#e67e22"
                                  : t.transactionType === "RETURN"
                                  ? "#9b59b6"
                                  : "#95a5a6",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          >
                            {t.transactionType}
                          </span>
                        </td>
                        <td style={{ padding: "12px" }}>{t.materialName}</td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            fontWeight: "bold",
                            color:
                              t.transactionType === "IMPORT"
                                ? "#27ae60"
                                : "#e74c3c",
                          }}
                        >
                          {t.transactionType === "IMPORT" ? "+" : ""}
                          {t.quantity}
                        </td>
                        <td style={{ padding: "12px" }}>{t.operatorName}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {t.appointmentId || "—"}
                        </td>
                        <td style={{ padding: "12px" }}>{t.note || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BÁO CÁO */}
          {activeTab === "report" && (
            <div>
              <h4 style={{ color: "#9b59b6", textAlign: "center" }}>
                BÁO CÁO SỬ DỤNG VẬT TƯ
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#9b59b6", color: "#fff" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Dịch vụ
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Vật tư
                      </th>
                      <th style={{ padding: "12px", textAlign: "center" }}>
                        Chuẩn
                      </th>
                      <th style={{ padding: "12px", textAlign: "center" }}>
                        Thực tế
                      </th>
                      <th style={{ padding: "12px", textAlign: "center" }}>
                        Chênh lệch
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageReport.map((r, i) => (
                      <tr
                        key={i}
                        style={{
                          background: r.Difference > 0 ? "#fadbd8" : "#d5f5e3",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <td style={{ padding: "12px" }}>{r.serviceName}</td>
                        <td style={{ padding: "12px" }}>{r.materialName}</td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {r.Standard}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center" }}>
                          {r.Actual}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            fontWeight: "bold",
                            color: r.Difference > 0 ? "#e74c3c" : "#27ae60",
                          }}
                        >
                          {r.Difference > 0 ? "+" : ""}
                          {r.Difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NHẬP KHO + THÊM MỚI */}
          {activeTab === "import" && (
            <div style={{ maxWidth: "600px", margin: "auto" }}>
              <h4 style={{ color: "#27ae60", textAlign: "center" }}>
                NHẬP KHO
              </h4>
              <div
                style={{
                  padding: "25px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                }}
              >
                <select
                  value={selId}
                  onChange={(e) => setSelId(e.target.value)}
                  style={s}
                >
                  <option value="">-- Chọn vật tư --</option>
                  {materials.map((m) => (
                    <option key={m.materialId} value={m.materialId}>
                      {m.materialName} ({m.unit}) - Tồn: {m.stockQuantity}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="Số lượng"
                  style={i}
                />
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú"
                  rows="2"
                  style={i}
                />
                <button onClick={handleImport} style={b("#27ae60")}>
                  XÁC NHẬN NHẬP
                </button>
              </div>

              <h5
                style={{
                  color: "#2ECCB6",
                  margin: "30px 0 15px",
                  textAlign: "center",
                }}
              >
                THÊM VẬT TƯ MỚI
              </h5>
              <div
                style={{
                  padding: "25px",
                  background: "#f0f8ff",
                  borderRadius: "12px",
                }}
              >
                <input
                  value={newMat.name}
                  onChange={(e) =>
                    setNewMat({ ...newMat, name: e.target.value })
                  }
                  placeholder="Tên vật tư"
                  style={i}
                />
                <input
                  value={newMat.unit}
                  onChange={(e) =>
                    setNewMat({ ...newMat, unit: e.target.value })
                  }
                  placeholder="Đơn vị"
                  style={i}
                />
                <input
                  type="number"
                  value={newMat.price}
                  onChange={(e) =>
                    setNewMat({ ...newMat, price: e.target.value })
                  }
                  placeholder="Giá (VNĐ)"
                  style={i}
                />
                <button onClick={handleAddNew} style={b("#2ECCB6")}>
                  THÊM MỚI
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB ĐỊNH MỨC DỊCH VỤ ==================== */}
          {activeTab === "standard" && (
            <div>
              <h4
                style={{
                  color: "#9b59b6",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                ĐỊNH MỨC VẬT TƯ THEO DỊCH VỤ
              </h4>

              {services.length === 0 ? (
                <p style={{ textAlign: "center", color: "#7f8c8d" }}>
                  Đang tải dịch vụ...
                </p>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {services.map((srv) => (
                      <button
                        key={srv.serviceId}
                        onClick={() => setSelectedService(srv.serviceId)}
                        style={{
                          padding: "10px 18px",
                          background:
                            selectedService === srv.serviceId
                              ? "#9b59b6"
                              : "#3498db",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        {srv.serviceName}
                      </button>
                    ))}
                  </div>

                  {selectedService && (
                    <div
                      style={{
                        background: "#f9f9f9",
                        padding: "20px",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <h5 style={{ color: "#8e44ad", margin: 0 }}>
                          {
                            services.find(
                              (s) => s.serviceId === selectedService
                            )?.serviceName
                          }
                        </h5>
                        <button
                          onClick={() => setShowAddModal(true)}
                          style={{
                            padding: "8px 14px",
                            background: "#27ae60",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          + Thêm vật tư
                        </button>
                      </div>

                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead>
                          <tr style={{ background: "#ecf0f1" }}>
                            <th style={{ padding: "10px", textAlign: "left" }}>
                              Vật tư
                            </th>
                            <th
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              Đơn vị
                            </th>
                            <th
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              Định mức
                            </th>
                            <th
                              style={{ padding: "10px", textAlign: "center" }}
                            >
                              Hành động
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceMaterials
                            .filter((sm) => sm.serviceId === selectedService)
                            .map((sm) => {
                              const mat = materials.find(
                                (m) => m.materialId === sm.materialId
                              );
                              return (
                                <tr
                                  key={sm.id}
                                  style={{ borderBottom: "1px solid #eee" }}
                                >
                                  <td style={{ padding: "10px" }}>
                                    {mat?.materialName || "—"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {mat?.unit || "—"}
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        editQty[sm.id] ?? sm.standardQuantity
                                      }
                                      onChange={(e) =>
                                        setEditQty({
                                          ...editQty,
                                          [sm.id]: e.target.value,
                                        })
                                      }
                                      style={{
                                        width: "70px",
                                        padding: "5px",
                                        borderRadius: "5px",
                                        border: "1px solid #bdc3c7",
                                        textAlign: "center",
                                      }}
                                    />
                                  </td>
                                  <td
                                    style={{
                                      padding: "10px",
                                      textAlign: "center",
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        handleUpdateStandard(
                                          sm.id,
                                          editQty[sm.id] ?? sm.standardQuantity
                                        )
                                      }
                                      style={{
                                        background: "#3498db",
                                        color: "#fff",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        marginRight: "5px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRemoveFromService(sm.id)
                                      }
                                      style={{
                                        background: "#e74c3c",
                                        color: "#fff",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Xóa
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          {serviceMaterials.filter(
                            (sm) => sm.serviceId === selectedService
                          ).length === 0 && (
                            <tr>
                              <td
                                colSpan="4"
                                style={{
                                  textAlign: "center",
                                  padding: "20px",
                                  color: "#95a5a6",
                                }}
                              >
                                Chưa có vật tư định mức
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* MODAL THÊM VẬT TƯ */}
              {showAddModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                  }}
                  onClick={() => setShowAddModal(false)}
                >
                  <div
                    style={{
                      background: "#fff",
                      padding: "25px",
                      borderRadius: "14px",
                      width: "380px",
                      maxWidth: "90%",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h5
                      style={{
                        color: "#9b59b6",
                        textAlign: "center",
                        marginBottom: "15px",
                      }}
                    >
                      Thêm vật tư vào dịch vụ
                    </h5>
                    <select
                      value={newMaterialId}
                      onChange={(e) => setNewMaterialId(e.target.value)}
                      style={s}
                    >
                      <option value="">-- Chọn vật tư --</option>
                      {materials
                        .filter(
                          (m) =>
                            !serviceMaterials.some(
                              (sm) =>
                                sm.materialId === m.materialId &&
                                sm.serviceId === selectedService
                            )
                        )
                        .map((m) => (
                          <option key={m.materialId} value={m.materialId}>
                            {m.materialName} ({m.unit}) - Tồn: {m.stockQuantity}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newStandardQty}
                      onChange={(e) => setNewStandardQty(e.target.value)}
                      placeholder="Số lượng định mức"
                      style={i}
                    />
                    <div
                      style={{ display: "flex", gap: "8px", marginTop: "15px" }}
                    >
                      <button
                        onClick={handleAddToService}
                        style={{ ...b("#27ae60"), flex: 1 }}
                      >
                        Thêm
                      </button>
                      <button
                        onClick={() => setShowAddModal(false)}
                        style={{ ...b("#95a5a6"), flex: 1 }}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// STYLE
const s = {
  width: "100%",
  padding: "14px",
  borderRadius: "10px",
  border: "2px solid #27ae60",
  fontSize: "16px",
  marginBottom: "15px",
};
const i = { ...s, borderColor: "#2ECCB6" };
const b = (c) => ({
  width: "100%",
  padding: "16px",
  background: c,
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: "10px",
});
