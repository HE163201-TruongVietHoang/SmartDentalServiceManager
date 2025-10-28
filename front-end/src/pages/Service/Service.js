// src/pages/ServicesPage.jsx
import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import axios from "axios";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9); // hiển thị 9 dịch vụ đầu tiên
  const increment = 9; // mỗi lần tải thêm 9 dịch vụ

  const API_URL = "http://localhost:5000/api/services"; // backend API của bạn

  // --- Lấy dữ liệu từ backend ---
  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      setServices(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách dịch vụ");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- Load More / Thu gọn ---
  const handleLoadMore = () =>
    setVisibleCount((prev) => Math.min(prev + increment, services.length));
  const handleCollapse = () =>
    setVisibleCount((prev) => Math.max(prev - increment, 9));

  // --- Format giá VND ---
  const formatPrice = (price) =>
    Number(price).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });

  return (
    <div>
      <Header />
      <section className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container-lg">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
              Các dịch vụ tại phòng khám
            </h2>
            <p className="text-muted lead">
              Chúng tôi cung cấp đầy đủ các dịch vụ nha khoa hiện đại, an toàn
              và tận tâm cho bạn và gia đình.
            </p>
          </div>

          {/* Cards */}
          <div className="row g-4">
            {services.slice(0, visibleCount).map((s) => (
              <div key={s.ServiceID} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm h-100 text-center p-4"
                  style={{
                    borderRadius: "15px",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(46, 204, 182, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(0,0,0,0.05)";
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-center mb-3"
                    style={{
                      width: "70px",
                      height: "70px",
                      margin: "0 auto",
                      borderRadius: "50%",
                      backgroundColor: "#E8FAF6",
                    }}
                  >
                    <i
                      className={`fa-solid fa-tooth`} // backend không trả icon, dùng default
                      style={{ color: "#2ECCB6", fontSize: "2rem" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-2">{s.ServiceName}</h5>
                  <p className="text-muted small">{s.Description}</p>
                  {s.Price && (
                    <p className="fw-semibold">{formatPrice(s.Price)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More / Thu gọn */}
          <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
            {visibleCount < services.length && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleLoadMore}
              >
                Tải thêm
              </button>
            )}
            {visibleCount > 9 && (
              <button
                className="btn btn-outline-secondary"
                onClick={handleCollapse}
              >
                Thu gọn
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
