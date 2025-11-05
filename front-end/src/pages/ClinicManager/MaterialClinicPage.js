import React, { useEffect, useState } from "react";

export default function ClinicManagerMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usageReport, setUsageReport] = useState([]);
  const [activeTab, setActiveTab] = useState("transactions"); // Mở luôn giao dịch để bạn thấy ngay

  const token = localStorage.getItem("token");
  const userId = JSON.parse(localStorage.getItem("user") || "{}").userId;

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
              { k: "materials", l: "DANH SÁCH", c: "#2ECCB6" },
              { k: "transactions", l: "GIAO DỊCH", c: "#3498db" },
              { k: "import", l: "NHẬP KHO", c: "#27ae60" },
              { k: "report", l: "BÁO CÁO", c: "#e74c3c" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                style={{
                  padding: "12px 28px",
                  background: activeTab === t.k ? t.c : "#e0e0e0",
                  color: activeTab === t.k ? "#fff" : "#555",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow:
                    activeTab === t.k ? "0 4px 10px rgba(0,0,0,.2)" : "none",
                }}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* LỊCH SỬ GIAO DỊCH – ĐÃ CÓ TÊN BỆNH NHÂN */}
          {activeTab === "transactions" && (
            <div>
              <h4
                style={{
                  color: "#3498db",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                LỊCH SỬ GIAO DỊCH VẬT TƯ
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead style={{ background: "#3498db", color: "#fff" }}>
                    <tr>
                      <th style={{ padding: "12px" }}>Loại</th>
                      <th style={{ padding: "12px" }}>Vật tư</th>
                      <th style={{ padding: "12px" }}>SL</th>
                      <th style={{ padding: "12px" }}>Bệnh nhân</th>
                      <th style={{ padding: "12px" }}>Y tá</th>
                      <th style={{ padding: "12px" }}>Thời gian</th>
                      <th style={{ padding: "12px" }}>Ghi chú</th> {/* ← MỚI */}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#999",
                          }}
                        >
                          Chưa có giao dịch
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t, i) => (
                        <tr
                          key={t.transactionId}
                          style={{ background: i % 2 ? "#f8f9fa" : "#fff" }}
                        >
                          <td style={{ padding: "12px", textAlign: "center" }}>
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "20px",
                                fontWeight: "bold",
                                fontSize: "11px",
                                color: "#fff",
                                background:
                                  t.transactionType === "IMPORT"
                                    ? "#27ae60"
                                    : t.transactionType === "USE"
                                    ? "#e74c3c"
                                    : t.transactionType === "RETURN"
                                    ? "#f39c12"
                                    : "#95a5a6",
                              }}
                            >
                              {t.transactionType === "IMPORT"
                                ? "NHẬP"
                                : t.transactionType === "USE"
                                ? "LẤY"
                                : t.transactionType === "RETURN"
                                ? "HOÀN"
                                : "KHÁC"}
                            </span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>
                            {t.materialName}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            {t.quantity}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontWeight: "600",
                              color: "#2c3e50",
                            }}
                          >
                            {t.patientName || "—"}
                          </td>
                          <td style={{ padding: "12px" }}>{t.operatorName}</td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "12px",
                              color: "#7f8c8d",
                            }}
                          >
                            {formatDate(t.transactionDate)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "13px",
                              color: "#555",
                              maxWidth: "200px",
                              wordBreak: "break-word",
                            }}
                          >
                            {t.note || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BÁO CÁO */}
          {activeTab === "report" && (
            <div>
              <h4
                style={{
                  color: "#e74c3c",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                BÁO CÁO ĐỊNH MỨC vs THỰC TẾ
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#e74c3c", color: "#fff" }}>
                    <tr>
                      <th style={{ padding: "14px" }}>Dịch vụ</th>
                      <th style={{ padding: "14px" }}>Vật tư</th>
                      <th style={{ padding: "14px", textAlign: "center" }}>
                        Định mức
                      </th>
                      <th style={{ padding: "14px", textAlign: "center" }}>
                        Thực tế
                      </th>
                      <th style={{ padding: "14px", textAlign: "center" }}>
                        Chênh lệch
                      </th>
                      <th style={{ padding: "14px", textAlign: "center" }}>
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageReport.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "#999",
                          }}
                        >
                          Chưa có dữ liệu – Y tá cần{" "}
                          <strong>GHI NHẬN ĐÃ DÙNG</strong>
                        </td>
                      </tr>
                    ) : (
                      usageReport.map((r, i) => {
                        const std = r.Standard ?? 0;
                        const act = r.Actual ?? 0;
                        const diff = act - std;
                        const over = diff > 0;
                        const under = diff < 0;
                        return (
                          <tr
                            key={i}
                            style={{ background: i % 2 ? "#f8f9fa" : "#fff" }}
                          >
                            <td style={{ padding: "12px", fontWeight: "600" }}>
                              {r.serviceName || "—"}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {r.materialName}
                            </td>
                            <td
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              {std}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                fontWeight: "bold",
                              }}
                            >
                              {act}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "center",
                                fontWeight: "bold",
                                color: over
                                  ? "#e74c3c"
                                  : under
                                  ? "#27ae60"
                                  : "#7f8c8d",
                              }}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                            <td
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              <span
                                style={{
                                  padding: "6px 14px",
                                  borderRadius: "20px",
                                  background: over
                                    ? "#e74c3c"
                                    : under
                                    ? "#27ae60"
                                    : "#95a5a6",
                                  color: "#fff",
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                }}
                              >
                                {over ? "VƯỢT" : under ? "TIẾT KIỆM" : "ĐÚNG"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DANH SÁCH VẬT TƯ */}
          {activeTab === "materials" && (
            <div>
              <h4 style={{ color: "#2ECCB6", marginBottom: "20px" }}>
                DANH SÁCH VẬT TƯ
              </h4>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ background: "#2ECCB6", color: "#fff" }}>
                    <tr>
                      <th style={{ padding: "12px" }}>ID</th>
                      <th style={{ padding: "12px" }}>Tên</th>
                      <th style={{ padding: "12px" }}>Đơn vị</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Giá
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Tồn
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m, i) => (
                      <tr
                        key={m.materialId}
                        style={{ background: i % 2 ? "#f8f9fa" : "#fff" }}
                      >
                        <td style={{ padding: "12px" }}>{m.materialId}</td>
                        <td style={{ padding: "12px", fontWeight: "600" }}>
                          {m.materialName}
                        </td>
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
