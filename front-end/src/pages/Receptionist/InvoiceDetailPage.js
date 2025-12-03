import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

// Format date
const formatDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("vi-VN");
};

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState(null);

  const invoiceId = window.location.pathname.split("/").pop();

  const load = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setInvoice(data);
  };

  useEffect(() => {
    load();
  }, []);

  if (!invoice) return <div style={{ padding: 30 }}>Đang tải...</div>;

  const { header, services, medicines, diagnosis } = invoice;

  const totalServiceCost = services.reduce((a, s) => a + s.price, 0);

  const confirmPayment = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5000/api/invoices/pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ invoiceId }),
    });

    toast.success("Thanh toán thành công!");
    window.location.href = "/receptionist/invoices";
  };

  return (
    <div style={{ padding: "30px" }}>
      <div
        style={{
          background: "#F8FDFF",
          padding: "35px",
          borderRadius: "14px",
          maxWidth: "900px",
          margin: "auto",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          border: "1px solid #D9F3FF",
        }}
      >
        <h2
          style={{
            color: "#1AA3E8",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 25,
            fontSize: "26px",
          }}
        >
          HÓA ĐƠN KHÁM BỆNH #{header.invoiceId}
        </h2>

        {/* THÔNG TIN BỆNH NHÂN */}
        <Section title="Thông tin bệnh nhân">
          <Field label="Tên bệnh nhân" value={header.patientName} />
          <Field label="Số điện thoại" value={header.patientPhone} />
          <Field label="Bác sĩ khám" value={header.doctorName} />
          <Field label="Ngày khám" value={formatDate(header.examDate)} />
          <Field
            label="Giờ khám"
            value={`${header.startTime} - ${header.endTime}`}
          />
        </Section>

        {/* THÔNG TIN CHẨN ĐOÁN */}
        <Section title="Thông tin chẩn đoán">
          <Field label="Triệu chứng" value={diagnosis?.symptoms} />
          <Field label="Kết quả chẩn đoán" value={diagnosis?.diagnosisResult} />
          <Field label="Ghi chú bác sĩ" value={diagnosis?.doctorNote} />
        </Section>

        {/* DỊCH VỤ */}
        <Section title="Dịch vụ đã sử dụng">
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Dịch vụ</th>
                <th style={th}>Giá</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={i}>
                  <td style={td}>{s.serviceName}</td>
                  <td style={td}>{s.price.toLocaleString()} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* ĐƠN THUỐC */}
        <Section title="Đơn thuốc (không tính tiền)">
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Thuốc</th>
                <th style={th}>Liều dùng</th>
                <th style={th}>Số lượng</th>
                <th style={th}>Cách dùng</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => (
                <tr key={i}>
                  <td style={td}>{m.medicineName}</td>
                  <td style={td}>{m.dosage}</td>
                  <td style={td}>{m.quantity}</td>
                  <td style={td}>{m.usageInstruction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* TỔNG TIỀN */}
        <h3
          style={{
            color: "#E63946",
            marginTop: 20,
            fontSize: "22px",
            textAlign: "right",
          }}
        >
          Tổng tiền dịch vụ: {totalServiceCost.toLocaleString()} đ
        </h3>
        <p style={{ textAlign: "right", fontSize: "18px", margin: "5px 0" }}>
          Mã giảm giá: {header.promotionCode || "Không có"}
        </p>
        <p style={{ textAlign: "right", fontSize: "18px", margin: "5px 0" }}>
          Giảm giá: {(header.discountAmount || 0).toLocaleString()} đ
        </p>
        <h3
          style={{
            color: "#E63946",
            fontSize: "24px",
            textAlign: "right",
            fontWeight: "bold",
          }}
        >
          Tổng thanh toán: {header.finalAmount.toLocaleString()} đ
        </h3>

        <button style={btnPay} onClick={confirmPayment}>
          Xác nhận thanh toán
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 35 }}>
      <h3
        style={{
          color: "#1AA3E8",
          marginBottom: 12,
          fontSize: "20px",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <p style={{ margin: "6px 0", fontSize: "15px" }}>
      <b>{label}:</b> {value || "---"}
    </p>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  borderRadius: "10px",
  overflow: "hidden",
};

const th = {
  padding: 12,
  background: "#DFF2FF",
  textAlign: "left",
  color: "#1A76D2",
};

const td = {
  padding: 12,
  borderBottom: "1px solid #eee",
};

const btnPay = {
  marginTop: 30,
  width: "100%",
  padding: "14px",
  background: "#28a745",
  color: "#fff",
  borderRadius: "10px",
  fontSize: "18px",
  border: "none",
  cursor: "pointer",
};
