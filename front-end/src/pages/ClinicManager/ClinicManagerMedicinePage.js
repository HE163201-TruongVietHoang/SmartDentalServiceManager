import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ClinicManagerMedicinePage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // ADD state
  const [newName, setNewName] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");

  // SEARCH state
  const [search, setSearch] = useState("");

  // EDIT state
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUnit, setEditUnit] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const token = localStorage.getItem("token");

  // LOAD ALL MEDICINES
  const loadMedicines = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/medicines", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      const normalized = Array.isArray(data)
        ? data.map((m) => ({
            ...m,
            unit: m.unit || "",
            description: m.description || "",
          }))
        : [];

      setMedicines(normalized);
    } catch (err) {
      console.error(err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadMedicines();
  }, [token]);

  // ADD MEDICINE
  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setError("");

    if (!newName.trim()) return setError("Tên thuốc không được để trống");
    if (!newUnit.trim()) return setError("Đơn vị không được để trống");

    try {
      const res = await fetch("http://localhost:5000/api/medicines/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          medicineName: newName.trim(),
          unit: newUnit.trim(),
          description: newDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Không thêm được thuốc");

      const newMed = {
        ...data,
        unit: data.unit || "",
        description: data.description || "",
      };

      setMedicines((prev) => [newMed, ...prev]);
      setNewName("");
      setNewUnit("");
      setNewDescription("");
    } catch (err) {
      setError(err.message);
    }
  };

  // DELETE MEDICINE
  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thuốc này?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/medicines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMedicines((prev) => prev.filter((m) => m.medicineId !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // OPEN EDIT MODAL
  const openEditModal = (m) => {
    setEditing(m.medicineId);
    setEditName(m.medicineName);
    setEditUnit(m.unit);
    setEditDescription(m.description);
  };

  // UPDATE MEDICINE
  const handleUpdateMedicine = async () => {
    if (!editName.trim()) return toast.error("Tên thuốc không được trống");
    if (!editUnit.trim()) return toast.error("Đơn vị không được trống");

    try {
      const res = await fetch(
        `http://localhost:5000/api/medicines/update/${editing}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            medicineName: editName,
            unit: editUnit,
            description: editDescription,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMedicines((prev) =>
        prev.map((m) => (m.medicineId === editing ? data : m))
      );

      setEditing(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // FILTER SEARCH
  const filtered = medicines.filter((m) =>
    (m.medicineName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", minHeight: "100vh" }}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>QUẢN LÝ THUỐC</h2>

        {/* ADD MEDICINE FORM */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, color: "#1E90FF" }}>Thêm thuốc mới</h3>

          <form
            onSubmit={handleAddMedicine}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="text"
              placeholder="Tên thuốc..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Đơn vị (viên, ống, tuýp...)"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              style={inputStyle}
            />

            <input
              type="text"
              placeholder="Mô tả (không bắt buộc)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={btnPrimary}>
              + Thêm thuốc
            </button>
          </form>

          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </div>

        {/* MEDICINE LIST */}
        <div style={{ ...cardStyle, marginTop: "25px" }}>
          <h3 style={{ marginTop: 0, color: "#1E90FF" }}>Danh sách thuốc</h3>

          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: 10 }}
          />

          {loading ? (
            <p>Đang tải...</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={th}>ID</th>
                  <th style={th}>Tên thuốc</th>
                  <th style={th}>Đơn vị</th>
                  <th style={th}>Mô tả</th>
                  <th style={th}></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((m) => (
                  <tr key={m.medicineId}>
                    <td style={td}>#{m.medicineId}</td>
                    <td style={td}>{m.medicineName}</td>
                    <td style={td}>{m.unit || "—"}</td>
                    <td style={td}>{m.description || "—"}</td>
                    <td style={td}>
                      <button
                        onClick={() => openEditModal(m)}
                        style={{
                          ...btnPrimary,
                          background: "#FFA500",
                          marginRight: "8px",
                        }}
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => handleDeleteMedicine(m.medicineId)}
                        style={btnDanger}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      style={{ textAlign: "center", padding: 20 }}
                    >
                      Không có thuốc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================= EDIT MODAL ========================= */}
      {editing && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginTop: 0, color: "#1E90FF" }}>
              Chỉnh sửa thuốc #{editing}
            </h3>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Tên thuốc"
              style={{ ...inputStyle, marginBottom: 10 }}
            />

            <input
              type="text"
              value={editUnit}
              onChange={(e) => setEditUnit(e.target.value)}
              placeholder="Đơn vị"
              style={{ ...inputStyle, marginBottom: 10 }}
            />

            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Mô tả"
              style={{ ...inputStyle, marginBottom: 10 }}
            />

            <button onClick={handleUpdateMedicine} style={btnPrimary}>
              Lưu thay đổi
            </button>
            <button
              onClick={() => setEditing(null)}
              style={{ ...btnDanger, marginLeft: 10 }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ======================== STYLES ======================== */

const containerStyle = {
  maxWidth: "1000px",
  margin: "auto",
  background: "#fff",
  padding: "25px",
  borderRadius: "20px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
};

const titleStyle = {
  textAlign: "center",
  color: "#2ECCB6",
  fontWeight: "bold",
  marginBottom: "20px",
};

const cardStyle = {
  background: "#F0FAFF",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "2px solid #1E90FF",
  fontSize: "15px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  padding: "10px",
  background: "#DFF2FF",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const btnPrimary = {
  padding: "10px 16px",
  background: "#1E90FF",
  color: "#fff",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
};

const btnDanger = {
  padding: "6px 12px",
  background: "#ff4d4f",
  color: "#fff",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  width: "400px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
};
