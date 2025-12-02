
import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { createPaymentUrl } from '../../api/api';

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


  if (!invoice)
    return (
      <div style={{ padding: 30, minHeight: "100vh", background: "#f6fbff" }}>
        <Header />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3">Đang tải thông tin hóa đơn...</p>
        </div>
        <Footer />
      </div>
    );

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

    alert("Thanh toán thành công!");
    window.location.href = "/invoice/me";
  };

  const handlePayment = async () => {
    try {
      const payload = {
        appointmentId: header.appointmentId,
        amount: header.finalAmount,
        invoiceId: header.invoiceId,
        bankCode: ""
      };
      const response = await createPaymentUrl(payload);
      if (response.success) {
        window.location.href = response.data.vnpUrl;
      } else {
        alert('Không thể tạo URL thanh toán');
      }
    } catch (err) {
      alert('Lỗi khi thanh toán');
    }
  };


  return (
    <div style={{ background: "#f6fbff", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 900, margin: "32px auto 0 auto", padding: 0 }}>
        <div style={{
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 4px 16px rgba(30,144,255,0.07)",
          border: "1px solid #e3eaf3",
          padding: "32px 18px 24px 18px",
        }}>
          <h2 style={{ color: "#1AA3E8", fontWeight: 700, textAlign: "center", marginBottom: 18, fontSize: 26, letterSpacing: 1 }}>HÓA ĐƠN KHÁM BỆNH #{header.invoiceId}</h2>
          <Section title="Thông tin bệnh nhân">
            <Field label="Tên bệnh nhân" value={header.patientName} />
            <Field label="Số điện thoại" value={header.patientPhone} />
            <Field label="Bác sĩ khám" value={header.doctorName} />
            <Field label="Ngày khám" value={formatDate(header.examDate)} />
            <Field label="Giờ khám" value={`${header.startTime} - ${header.endTime}`} />
          </Section>
          <Section title="Thông tin chẩn đoán">
            <Field label="Triệu chứng" value={diagnosis?.symptoms} />
            <Field label="Kết quả chẩn đoán" value={diagnosis?.diagnosisResult} />
            <Field label="Ghi chú bác sĩ" value={diagnosis?.doctorNote} />
          </Section>
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
          <div style={{ marginTop: 30, borderTop: "1px dashed #e3eaf3", paddingTop: 18 }}>
            <div style={{ textAlign: "right", fontSize: 16, color: "#444" }}>
              <div style={{ marginBottom: 4 }}>Tổng tiền dịch vụ: <b style={{ color: "#1AA3E8" }}>{totalServiceCost.toLocaleString()} đ</b></div>
              <div style={{ marginBottom: 4 }}>Mã giảm giá: <b>{header.promotionCode || "Không có"}</b></div>
              <div style={{ marginBottom: 4 }}>Giảm giá: <b style={{ color: "#28a745" }}>{(header.discountAmount || 0).toLocaleString()} đ</b></div>
              <div style={{ fontSize: 20, color: "#E63946", fontWeight: 700, marginTop: 8 }}>Tổng thanh toán: {header.finalAmount.toLocaleString()} đ</div>
            </div>
            {header.status === 'Paid' ? (
              <div style={{ textAlign: 'center', padding: '20px', background: '#d4edda', color: '#155724', borderRadius: '10px', marginTop: 22 }}>
                <h4>Đã thanh toán</h4>
                <p>Hóa đơn này đã được thanh toán thành công.</p>
              </div>
            ) : (
              <button style={btnPay} onClick={handlePayment}>Thanh toán bằng VNPay</button>
            )}
          </div>
        </div>
      </div>
      <Footer />
      <style>{`
        @media (max-width: 600px) {
          .invoice-detail-section { padding: 0 2px !important; }
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { display: none; }
          tr { margin-bottom: 14px; }
          td, th { padding: 10px 6px !important; font-size: 14px !important; }
        }
      `}</style>
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
  marginTop: 8,
};

const th = {
  padding: "13px 8px",
  background: "#eaf6ff",
  textAlign: "left",
  color: "#1A76D2",
  fontWeight: 700,
  fontSize: 15,
  borderBottom: "1px solid #e3eaf3",
};

const td = {
  padding: "12px 8px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 15,
  color: "#222",
};

const btnPay = {
  marginTop: 22,
  width: "100%",
  padding: "14px",
  background: "#28a745",
  color: "#fff",
  borderRadius: "10px",
  fontSize: "18px",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 2px 8px #eaf6ff",
  transition: "background 0.15s, color 0.15s",
};
