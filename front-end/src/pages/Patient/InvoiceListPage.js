import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { createPaymentUrl } from "../../api/api";
import { toast } from "react-toastify";

export default function WaitingPaymentPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/invoices/pending/user/${user.userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (Array.isArray(data)) setList(data);
        else setList([]);
      } catch (err) {
        setList([]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handlePayment = async (invoice) => {
    try {
      const payload = {
        appointmentId: invoice.appointmentId,
        amount: (invoice.totalAmount || 0) - (invoice.discountAmount || 0),
        invoiceId: invoice.invoiceId,
        bankCode: "",
      };
      const response = await createPaymentUrl(payload);
      if (response.success) {
        window.location.href = response.data.vnpUrl;
      } else {
        toast.error("Không thể tạo URL thanh toán");
      }
    } catch (err) {
      toast.error("Lỗi khi thanh toán");
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container py-5 text-center">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p className="mt-3" style={{ color: "#ff9800" }}>
            Đang tải hóa đơn chờ thanh toán...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ background: "#f6fbff", minHeight: "100vh" }}>
      <Header />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 0 0 0" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src="https://png.pngtree.com/png-clipart/20230403/original/pngtree-bill-line-icon-png-image_9021663.png"
            alt="invoice"
            style={{
              width: 80,
              marginBottom: 8,
              filter: "drop-shadow(0 2px 8px #ddd)",
            }}
          />
          <h2
            style={{
              color: "#4682b4",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 8,
              letterSpacing: 1,
            }}
          >
            Chờ thanh toán hóa đơn
          </h2>
          <div style={{ color: "#666", fontSize: 16, marginBottom: 12 }}>
            Vui lòng hoàn tất thanh toán để tiếp tục sử dụng dịch vụ.
          </div>
        </div>
        <div
          style={{
            padding: "16px",
            background: "#f8f9fa",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #e9ecef",
          }}
        >
          <h5 style={{ marginBottom: "12px", color: "#4682b4" }}>
            Lọc theo ngày
          </h5>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <label>
              Từ ngày:{" "}
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value })
                }
                style={{ padding: "4px", borderRadius: "4px" }}
              />
            </label>
            <label>
              Đến ngày:{" "}
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value })
                }
                style={{ padding: "4px", borderRadius: "4px" }}
              />
            </label>
          </div>
        </div>
        {(() => {
          const filteredList = list.filter((item) => {
            const itemDate = new Date(item.examDate);
            const fromDate = filters.dateFrom
              ? new Date(filters.dateFrom)
              : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
            const matchesDate =
              (!fromDate || itemDate >= fromDate) &&
              (!toDate || itemDate <= toDate);
            return matchesDate;
          });
          const totalPages = Math.ceil(filteredList.length / itemsPerPage);
          const paginatedList = filteredList.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          );
          return (
            <>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  boxShadow: "0 4px 16px rgba(70,130,180,0.07)",
                  padding: 0,
                  overflow: "hidden",
                  border: "1px solid #e9ecef",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#e6f3ff" }}>
                      <th style={thWait}>Mã hóa đơn</th>
                      <th style={thWait}>Bác sĩ</th>
                      <th style={thWait}>Ngày</th>
                      <th style={thWait}>Giờ khám</th>
                      <th style={thWait}>Trạng thái</th>
                      <th style={thWait}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.length === 0 ? (
                      <tr>
                        <td
                          style={{
                            padding: 32,
                            textAlign: "center",
                            color: "#b26a00",
                            fontSize: 18,
                          }}
                          colSpan={6}
                        >
                          {list.length === 0 ? (
                            <>
                              <img
                                src="https://png.pngtree.com/png-clipart/20230403/original/pngtree-bill-line-icon-png-image_9021663.png"
                                alt="no-waiting"
                                style={{
                                  width: 60,
                                  marginBottom: 8,
                                  opacity: 0.7,
                                }}
                              />
                              <div>
                                Bạn không có hóa đơn chờ thanh toán nào.
                              </div>
                            </>
                          ) : (
                            "Không có hóa đơn nào khớp với bộ lọc ngày."
                          )}
                        </td>
                      </tr>
                    ) : (
                      paginatedList.map((i) => (
                        <tr key={i.invoiceId} style={trWait}>
                          <td style={tdWait}>#{i.invoiceId}</td>
                          <td style={tdWait}>{i.doctorName}</td>
                          <td style={tdWait}>
                            {i.examDate
                              ? new Date(i.examDate).toLocaleDateString("vi-VN")
                              : "Không rõ"}
                          </td>
                          <td style={tdWait}>
                            {i.startTime} - {i.endTime}
                          </td>
                          <td style={tdStatusWait}>
                            <span className="badge-status-wait">
                              Chờ thanh toán
                            </span>
                          </td>
                          <td style={tdWait}>
                            <a
                              href={`/invoice/me/${i.invoiceId}`}
                              style={btnWait}
                            >
                              Xem chi tiết
                            </a>
                            <button
                              onClick={() => handlePayment(i)}
                              style={{
                                ...btnWait,
                                background: "#ff9800",
                                marginLeft: "8px",
                                animation: "pulse 1.2s infinite",
                              }}
                            >
                              Thanh toán
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "16px",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={
                      currentPage === 1
                        ? {
                            ...pageBtnWait,
                            opacity: 0.5,
                            cursor: "not-allowed",
                          }
                        : pageBtnWait
                    }
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={
                          currentPage === page
                            ? {
                                ...pageBtnWait,
                                background: "#ff9800",
                                color: "#fff",
                              }
                            : pageBtnWait
                        }
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={
                      currentPage === totalPages
                        ? {
                            ...pageBtnWait,
                            opacity: 0.5,
                            cursor: "not-allowed",
                          }
                        : pageBtnWait
                    }
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>
      <Footer />
      <style>{`
        .badge-status-wait {
          display: inline-block;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          padding: 5px 14px;
          background: #e6f3ff;
          color: #4682b4;
          border: 1px solid #b0d4ff;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #e6f3ff; }
          70% { box-shadow: 0 0 0 10px rgba(70, 130, 180, 0); }
          100% { box-shadow: 0 0 0 0 rgba(70, 130, 180, 0); }
        }
        @media (max-width: 600px) {
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { display: none; }
          tr { margin-bottom: 18px; }
          td { border: none !important; padding: 10px 8px !important; }
          .badge-status-wait { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}

// STYLE cho trang chờ thanh toán
const thWait = {
  padding: "14px 8px",
  fontWeight: 700,
  color: "#4682b4",
  fontSize: 15,
  borderBottom: "1px solid #e9ecef",
};

const tdWait = {
  padding: "13px 8px",
  borderBottom: "1px solid #f8f9fa",
  fontSize: 15,
  color: "#333",
};

const tdStatusWait = {
  padding: "13px 8px",
  borderBottom: "1px solid #f8f9fa",
  textAlign: "center",
};

const trWait = {
  background: "#fff",
  transition: "background 0.15s",
};

const btnWait = {
  padding: "7px 16px",
  background: "#4682b4",
  color: "#fff",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
  boxShadow: "0 2px 8px #e6f3ff",
  transition: "background 0.15s, color 0.15s",
  display: "inline-block",
  border: "none",
};

const pageBtnWait = {
  padding: "8px 12px",
  margin: "0 4px",
  border: "1px solid #4682b4",
  background: "#fff",
  color: "#4682b4",
  borderRadius: "4px",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};
