import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/services";

  // --- Lấy dữ liệu từ backend ---
  const fetchServices = async () => {
    try {
      const res = await axios.get(API_URL);
      if (Array.isArray(res.data)) {
        setServices(res.data);
      } else if (res.data.services) {
        setServices(res.data.services);
      } else {
        throw new Error("Dữ liệu không hợp lệ từ server");
      }
    } catch (err) {
      console.error("❌ Lỗi khi tải dịch vụ:", err);
      setError("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- Load More / Thu gọn ---
  const handleLoadMore = () =>
    setVisibleCount((prev) => Math.min(prev + 9, services.length));

  const handleCollapse = () => setVisibleCount((prev) => Math.max(prev - 9, 9));

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

          {/* Hiển thị khi đang tải */}
          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p className="mt-3 text-muted">Đang tải danh sách dịch vụ...</p>
            </div>
          )}

          {/* Hiển thị khi lỗi */}
          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          {/* Hiển thị danh sách */}
          {!loading && !error && (
            <>
              {services.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có dịch vụ nào để hiển thị.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {services.slice(0, visibleCount).map((s) => (
                    <div key={s.serviceId} className="col-md-6 col-lg-4">
                      <div
                        className="card border-0 shadow-sm h-100 text-center p-4"
                        style={{
                          borderRadius: "15px",
                          cursor: "pointer",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                        }}
                        onClick={() => navigate(`/service/${s.serviceId}`)}
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
                            className="fa-solid fa-tooth"
                            style={{ color: "#2ECCB6", fontSize: "2rem" }}
                          ></i>
                        </div>
                        <h5 className="fw-bold mb-2">{s.serviceName}</h5>
                        <p className="text-muted small">{s.description}</p>
                        {s.price && (
                          <p className="fw-semibold">{formatPrice(s.price)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Nút tải thêm / thu gọn */}
          {!loading && !error && services.length > 9 && (
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
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
