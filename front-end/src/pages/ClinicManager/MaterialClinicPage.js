import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";

export default function ClinicManagerMaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usageReport, setUsageReport] = useState([]);
  const [activeTab, setActiveTab] = useState("materials"); // materials, transactions, import, report
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    materialName: "",
    unit: "",
    unitPrice: "",
    stockQuantity: 0,
    note: "",
  });

  // Form states for import
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [importQuantity, setImportQuantity] = useState(1);
  const [importNote, setImportNote] = useState("");

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
    loadMaterials();
    loadTransactions();
    loadUsageReport();
  }, []);

  const loadMaterials = async () => {
    try {
      const data = await fetchAPI("/");
      if (Array.isArray(data)) {
        setMaterials(data);
      } else {
        console.error("Dữ liệu không phải mảng:", data);
        setMaterials([]);
      }
    } catch (err) {
      alert("Không thể tải danh sách vật tư: " + err.message);
      setMaterials([]);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await fetchAPI("/transactions");
      if (Array.isArray(data)) {
        setTransactions(data);
      } else {
        console.error("Dữ liệu không phải mảng:", data);
        setTransactions([]);
      }
    } catch (err) {
      alert("Không thể tải lịch sử giao dịch: " + err.message);
      setTransactions([]);
    }
  };

  const loadUsageReport = async () => {
    try {
      const data = await fetchAPI("/report");
      if (Array.isArray(data)) {
        setUsageReport(data);
      } else {
        console.error("Dữ liệu không phải mảng:", data);
        setUsageReport([]);
      }
    } catch (err) {
      console.error("Không thể tải báo cáo sử dụng:", err);
      setUsageReport([]);
    }
  };

  const handleImport = async () => {
    if (!selectedMaterialId || !importQuantity) {
      alert("Vui lòng chọn vật tư và nhập số lượng");
      return;
    }

    try {
      const res = await fetchAPI("/import", "POST", {
        materialId: parseInt(selectedMaterialId),
        userId: userId,
        quantity: parseFloat(importQuantity),
        note: importNote || null,
      });
      alert(res.message || "Nhập kho thành công!");
      resetImportForm();
      loadMaterials();
      loadTransactions();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const resetImportForm = () => {
    setSelectedMaterialId("");
    setImportQuantity(1);
    setImportNote("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "IMPORT":
        return "#27ae60";
      case "USE":
        return "#e74c3c";
      case "RETURN":
        return "#f39c12";
      case "DAMAGED":
        return "#95a5a6";
      default:
        return "#333";
    }
  };
  const handleAddNewMaterial = async () => {
    const { materialName, unit, unitPrice, stockQuantity, note } = newMaterial;
    if (!materialName || !unit || !unitPrice) {
      alert("Vui lòng nhập đầy đủ thông tin vật tư mới!");
      return;
    }

    try {
      const res = await fetchAPI("/add", "POST", {
        materialName,
        unit,
        unitPrice: parseFloat(unitPrice),
        stockQuantity: parseFloat(stockQuantity || 0),
        note: note || null,
      });
      alert(res.message || "Thêm vật tư mới thành công!");
      setIsAddingNew(false);
      setNewMaterial({
        materialName: "",
        unit: "",
        unitPrice: "",
        stockQuantity: 0,
        note: "",
      });
      loadMaterials();
    } catch (err) {
      alert("Lỗi khi thêm vật tư: " + err.message);
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "IMPORT":
        return "Nhập kho";
      case "USE":
        return "Lấy vật tư";
      case "RETURN":
        return "Hoàn vật tư";
      case "DAMAGED":
        return "Hỏng hóc";
      default:
        return type;
    }
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
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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
              📦 Quản lý vật tư — Clinic Manager
            </h2>

            {/* TAB NAVIGATION */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                marginBottom: "30px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => setActiveTab("materials")}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    activeTab === "materials" ? "#2ECCB6" : "#e0e0e0",
                  color: activeTab === "materials" ? "white" : "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                📋 Danh sách vật tư
              </button>
              <button
                onClick={() => setActiveTab("transactions")}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    activeTab === "transactions" ? "#2ECCB6" : "#e0e0e0",
                  color: activeTab === "transactions" ? "white" : "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                📜 Lịch sử giao dịch
              </button>
              <button
                onClick={() => setActiveTab("import")}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    activeTab === "import" ? "#27ae60" : "#e0e0e0",
                  color: activeTab === "import" ? "white" : "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                📥 Nhập kho
              </button>
              <button
                onClick={() => setActiveTab("report")}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    activeTab === "report" ? "#e74c3c" : "#e0e0e0",
                  color: activeTab === "report" ? "white" : "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                📊 Báo cáo sử dụng
              </button>
            </div>

            {/* DANH SÁCH VẬT TƯ */}
            {activeTab === "materials" && (
              <div>
                <h4 style={{ color: "#2ECCB6", marginBottom: "20px" }}>
                  📋 Danh sách vật tư hiện có
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{ backgroundColor: "#2ECCB6", color: "white" }}
                      >
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          ID
                        </th>
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          Tên vật tư
                        </th>
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          Đơn vị
                        </th>
                        <th style={{ padding: "12px", textAlign: "right" }}>
                          Đơn giá
                        </th>
                        <th style={{ padding: "12px", textAlign: "right" }}>
                          Tồn kho
                        </th>
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          Cập nhật
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m, index) => (
                        <tr
                          key={m.materialId}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#f8f9fa" : "white",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <td style={{ padding: "12px" }}>{m.materialId}</td>
                          <td style={{ padding: "12px", fontWeight: "600" }}>
                            {m.materialName}
                          </td>
                          <td style={{ padding: "12px" }}>{m.unit}</td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {m.unitPrice
                              ? `${Number(m.unitPrice).toLocaleString(
                                  "vi-VN"
                                )}đ`
                              : "N/A"}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontWeight: "bold",
                              color:
                                m.stockQuantity < 10 ? "#e74c3c" : "#27ae60",
                            }}
                          >
                            {m.stockQuantity}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            {formatDate(m.updatedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {materials.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#999",
                      }}
                    >
                      Chưa có vật tư nào
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* LỊCH SỬ GIAO DỊCH */}
            {activeTab === "transactions" && (
              <div>
                <h4 style={{ color: "#2ECCB6", marginBottom: "20px" }}>
                  📜 Lịch sử giao dịch vật tư
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{ backgroundColor: "#2ECCB6", color: "white" }}
                      >
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          ID
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Loại
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Vật tư
                        </th>
                        <th style={{ padding: "10px", textAlign: "right" }}>
                          Số lượng
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Người thao tác
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Bệnh nhân
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Thời gian
                        </th>
                        <th style={{ padding: "10px", textAlign: "left" }}>
                          Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t, index) => (
                        <tr
                          key={t.transactionId}
                          style={{
                            backgroundColor:
                              index % 2 === 0 ? "#f8f9fa" : "white",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <td style={{ padding: "10px" }}>
                            #{t.transactionId}
                          </td>
                          <td style={{ padding: "10px" }}>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                backgroundColor: getTransactionTypeColor(
                                  t.transactionType
                                ),
                                color: "white",
                                fontSize: "12px",
                                fontWeight: "bold",
                              }}
                            >
                              {getTransactionTypeLabel(t.transactionType)}
                            </span>
                          </td>
                          <td style={{ padding: "10px", fontWeight: "600" }}>
                            {t.materialName}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              textAlign: "right",
                              fontWeight: "bold",
                            }}
                          >
                            {t.quantity}
                          </td>
                          <td style={{ padding: "10px" }}>{t.operatorName}</td>
                          <td style={{ padding: "10px" }}>
                            {t.patientName || "-"}
                          </td>
                          <td style={{ padding: "10px", fontSize: "13px" }}>
                            {formatDate(t.transactionDate)}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              fontSize: "13px",
                              color: "#666",
                            }}
                          >
                            {t.note || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#999",
                      }}
                    >
                      Chưa có giao dịch nào
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* NHẬP KHO / THÊM VẬT TƯ MỚI */}
            {activeTab === "import" && (
              <div>
                <h4 style={{ color: "#27ae60", marginBottom: "20px" }}>
                  📥 Nhập kho hoặc thêm vật tư mới
                </h4>

                <div
                  style={{
                    padding: "30px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "10px",
                    maxWidth: "600px",
                    margin: "0 auto",
                  }}
                >
                  {/* CHỌN VẬT TƯ CŨ ĐỂ NHẬP */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Chọn vật tư có sẵn:
                    </label>
                    <select
                      value={selectedMaterialId}
                      onChange={(e) => setSelectedMaterialId(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #27ae60",
                        fontSize: "15px",
                      }}
                    >
                      <option value="">-- Chọn vật tư cần nhập --</option>
                      {materials.map((m) => (
                        <option key={m.materialId} value={m.materialId}>
                          {m.materialName} ({m.unit}) - Hiện tại:{" "}
                          {m.stockQuantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* NHẬP SỐ LƯỢNG */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Số lượng nhập:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={importQuantity}
                      onChange={(e) => setImportQuantity(e.target.value)}
                      placeholder="Nhập số lượng"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #27ae60",
                        fontSize: "15px",
                      }}
                    />
                  </div>

                  {/* NHẬP GHI CHÚ (tùy chọn) */}
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        fontWeight: "600",
                      }}
                    >
                      Ghi chú (tùy chọn):
                    </label>
                    <textarea
                      value={importNote}
                      onChange={(e) => setImportNote(e.target.value)}
                      placeholder="Ví dụ: nhập từ nhà cung cấp A..."
                      rows="2"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #27ae60",
                        fontSize: "15px",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  {/* NÚT NHẬP KHO */}
                  <button
                    onClick={handleImport}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: "#27ae60",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      marginBottom: "25px",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#229954")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "#27ae60")
                    }
                  >
                    ✅ Xác nhận nhập kho
                  </button>

                  {/* KHU VỰC THÊM VẬT TƯ MỚI */}
                  <h5 style={{ color: "#2ECCB6", marginBottom: "15px" }}>
                    ➕ Thêm vật tư mới
                  </h5>

                  <div style={{ marginBottom: "15px" }}>
                    <input
                      type="text"
                      placeholder="Tên vật tư mới"
                      id="newMaterialName"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #2ECCB6",
                        fontSize: "15px",
                        marginBottom: "10px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Đơn vị (ví dụ: hộp, cái, ml...)"
                      id="newMaterialUnit"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #2ECCB6",
                        fontSize: "15px",
                        marginBottom: "10px",
                      }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Đơn giá (VNĐ)"
                      id="newMaterialPrice"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: "2px solid #2ECCB6",
                        fontSize: "15px",
                        marginBottom: "15px",
                      }}
                    />
                    <button
                      onClick={async () => {
                        const materialName = document
                          .getElementById("newMaterialName")
                          .value.trim();
                        const unit = document
                          .getElementById("newMaterialUnit")
                          .value.trim();
                        const unitPrice = parseFloat(
                          document.getElementById("newMaterialPrice").value
                        );

                        if (!materialName || !unit || isNaN(unitPrice)) {
                          alert("Vui lòng nhập đầy đủ thông tin vật tư mới.");
                          return;
                        }

                        try {
                          const res = await fetch(
                            "http://localhost:5000/api/materials/add",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                              },
                              body: JSON.stringify({
                                materialName,
                                unit,
                                unitPrice,
                              }),
                            }
                          );

                          if (!res.ok)
                            throw new Error("Không thể thêm vật tư mới");
                          const data = await res.json();
                          alert(data.message || "Đã thêm vật tư mới!");
                          loadMaterials();
                          document.getElementById("newMaterialName").value = "";
                          document.getElementById("newMaterialUnit").value = "";
                          document.getElementById("newMaterialPrice").value =
                            "";
                        } catch (err) {
                          alert("Lỗi khi thêm vật tư mới: " + err.message);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#2ECCB6",
                        color: "white",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#26b5a3")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#2ECCB6")
                      }
                    >
                      ➕ Thêm vật tư mới
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BÁO CÁO SỬ DỤNG */}
            {activeTab === "report" && (
              <div>
                <h4 style={{ color: "#e74c3c", marginBottom: "20px" }}>
                  📊 Báo cáo so sánh vật tư (Định mức vs Thực tế)
                </h4>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{ backgroundColor: "#e74c3c", color: "white" }}
                      >
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          Dịch vụ
                        </th>
                        <th style={{ padding: "12px", textAlign: "left" }}>
                          Vật tư
                        </th>
                        <th style={{ padding: "12px", textAlign: "right" }}>
                          Định mức
                        </th>
                        <th style={{ padding: "12px", textAlign: "right" }}>
                          Thực tế
                        </th>
                        <th style={{ padding: "12px", textAlign: "right" }}>
                          Chênh lệch
                        </th>
                        <th style={{ padding: "12px", textAlign: "center" }}>
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {usageReport.map((r, index) => {
                        const diff = r.Difference || 0;
                        const isOver = diff > 0;
                        const isUnder = diff < 0;

                        return (
                          <tr
                            key={index}
                            style={{
                              backgroundColor:
                                index % 2 === 0 ? "#f8f9fa" : "white",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            <td style={{ padding: "12px", fontWeight: "600" }}>
                              {r.serviceName}
                            </td>
                            <td style={{ padding: "12px" }}>
                              {r.materialName}
                            </td>
                            <td style={{ padding: "12px", textAlign: "right" }}>
                              {r.Standard || "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                fontWeight: "bold",
                              }}
                            >
                              {r.Actual}
                            </td>
                            <td
                              style={{
                                padding: "12px",
                                textAlign: "right",
                                fontWeight: "bold",
                                color: isOver
                                  ? "#e74c3c"
                                  : isUnder
                                  ? "#27ae60"
                                  : "#333",
                              }}
                            >
                              {diff > 0 ? `+${diff}` : diff}
                            </td>
                            <td
                              style={{ padding: "12px", textAlign: "center" }}
                            >
                              {isOver ? (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#e74c3c",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Vượt định mức
                                </span>
                              ) : isUnder ? (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#27ae60",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Tiết kiệm
                                </span>
                              ) : (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#95a5a6",
                                    color: "white",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Đúng định mức
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {usageReport.length === 0 && (
                    <p
                      style={{
                        textAlign: "center",
                        padding: "20px",
                        color: "#999",
                      }}
                    >
                      Chưa có dữ liệu báo cáo
                    </p>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#fff3cd",
                    borderRadius: "8px",
                    border: "1px solid #ffc107",
                  }}
                >
                  <p
                    style={{ margin: "0", color: "#856404", fontSize: "14px" }}
                  >
                    <strong>ℹ️ Giải thích:</strong> Chênh lệch dương (+) nghĩa
                    là sử dụng nhiều hơn định mức, chênh lệch âm (-) nghĩa là sử
                    dụng ít hơn định mức.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// style helper
const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  border: "2px solid #27ae60",
  fontSize: "15px",
};
