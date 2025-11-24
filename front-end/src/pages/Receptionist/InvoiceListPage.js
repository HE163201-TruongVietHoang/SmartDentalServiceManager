import React, { useEffect, useState } from "react";

export default function InvoiceListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/invoices/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (Array.isArray(data)) setList(data);
      else setList([]);
    } catch (err) {
      console.error("LOAD INVOICE ERROR:", err);
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: 30 }}>Đang tải...</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ color: "#1E90FF", fontWeight: "bold" }}>
        Danh sách hóa đơn chờ thanh toán
      </h2>

      <div
        style={{
          marginTop: "20px",
          background: "#F0FAFF",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ background: "#DFF2FF", textAlign: "left" }}>
              <th style={th}>Mã hóa đơn</th>
              <th style={th}>Bệnh nhân</th>
              <th style={th}>Bác sĩ</th>
              <th style={th}>Ngày</th>
              <th style={th}>Giờ khám</th>
              <th style={th}></th>
            </tr>
          </thead>

          <tbody>
            {list.map((i) => (
              <tr key={i.invoiceId} style={tr}>
                <td style={td}>#{i.invoiceId}</td>
                <td style={td}>{i.patientName}</td>
                <td style={td}>{i.doctorName}</td>
                <td style={td}>
                  {i.examDate
                    ? new Date(i.examDate).toLocaleDateString("vi-VN")
                    : "Không rõ"}
                </td>

                <td style={td}>
                  {i.startTime} - {i.endTime}
                </td>
                <td style={td}>
                  <a href={`/receptionist/invoices/${i.invoiceId}`} style={btn}>
                    Xem chi tiết
                  </a>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td style={{ padding: 20, textAlign: "center" }} colSpan={6}>
                  Không có hóa đơn nào đang chờ thanh toán.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// STYLE
const th = {
  padding: "12px",
  fontWeight: "bold",
  color: "#333",
};

const td = {
  padding: "12px",
  borderBottom: "1px solid #e0e0e0",
};

const tr = {
  background: "#fff",
};

const btn = {
  padding: "6px 14px",
  background: "#1E90FF",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
};
