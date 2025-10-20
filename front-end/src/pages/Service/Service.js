// src/pages/ServicesPage.jsx
import React, { useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";

export default function ServicesPage() {
  const services = [
    {
      icon: "fa-tooth",
      title: "Trồng răng Implant",
      desc: "Khôi phục răng đã mất bằng trụ Implant bền chắc và thẩm mỹ cao.",
    },
    {
      icon: "fa-syringe",
      title: "Tẩy trắng răng",
      desc: "Mang lại nụ cười trắng sáng tự nhiên chỉ trong một buổi điều trị.",
    },
    {
      icon: "fa-smile-beam",
      title: "Niềng răng thẩm mỹ",
      desc: "Điều chỉnh răng đều đẹp, cải thiện khớp cắn và thẩm mỹ khuôn mặt.",
    },
    {
      icon: "fa-user-md",
      title: "Khám tổng quát răng miệng",
      desc: "Kiểm tra định kỳ giúp phát hiện sớm và điều trị kịp thời các vấn đề răng miệng.",
    },
    {
      icon: "fa-teeth",
      title: "Bọc răng sứ",
      desc: "Giúp răng sáng bóng, đều đẹp và tự tin hơn khi giao tiếp.",
    },
    {
      icon: "fa-tooth",
      title: "Lấy cao răng",
      desc: "Loại bỏ mảng bám, giúp răng sạch hơn và ngăn ngừa viêm nướu.",
    },
    {
      icon: "fa-teeth-open",
      title: "Trám răng thẩm mỹ",
      desc: "Phục hồi răng sâu hoặc sứt mẻ bằng vật liệu composite tự nhiên.",
    },
    {
      icon: "fa-tooth",
      title: "Nhổ răng không đau",
      desc: "Ứng dụng công nghệ gây tê hiện đại, an toàn và nhẹ nhàng cho bệnh nhân.",
    },
    {
      icon: "fa-tooth",
      title: "Điều trị tủy răng",
      desc: "Loại bỏ tủy bị viêm nhiễm, bảo tồn cấu trúc răng thật tối đa.",
    },
    {
      icon: "fa-x-ray",
      title: "Chụp X-quang răng",
      desc: "Chẩn đoán chính xác tình trạng răng miệng bằng máy X-quang kỹ thuật số.",
    },
    {
      icon: "fa-tooth",
      title: "Cạo vôi và đánh bóng răng",
      desc: "Làm sạch mảng bám, mang lại hơi thở thơm mát và nụ cười tươi sáng.",
    },
    {
      icon: "fa-tooth",
      title: "Hàm tháo lắp",
      desc: "Giải pháp tiết kiệm thay thế răng mất, dễ dàng tháo lắp và vệ sinh.",
    },
  ];

  // ---- Pagination logic ----
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 6;
  const totalPages = Math.ceil(services.length / servicesPerPage);

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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
            {currentServices.map((s, i) => (
              <div key={i} className="col-md-6 col-lg-4">
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
                      className={`fa-solid ${s.icon}`}
                      style={{ color: "#2ECCB6", fontSize: "2rem" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-2">{s.title}</h5>
                  <p className="text-muted small">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination buttons */}
          <div className="d-flex justify-content-center align-items-center mt-5">
            <button
              className="btn btn-outline-secondary me-3"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              ← Trang trước
            </button>
            <span className="fw-semibold">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary ms-3"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Trang sau →
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
