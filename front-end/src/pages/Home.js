// import React from "react";
// import Header from "../components/home/Header/Header";
// import Footer from "../components/home/Footer/Footer";
// import Sale from "../components/home/Sale/Sale";
// import Banner from "../components/Banner/Banner";
// import CustomSlider from "../components/slider/Slider";

// function Home() {
//   return (
//     <div>
//       <Header />
//       <Banner /> {/* Hiển thị banner ngay sau header */}
//       <CustomSlider />
//       <main style={{ padding: "20px" }}>
//         <h2>Chào mừng bạn đến với phòng khám nha khoa</h2>
//         <p>
//           Chúng tôi mang đến dịch vụ chăm sóc răng miệng chất lượng cao, hiện
//           đại và an toàn.
//         </p>

//         <Sale />
//       </main>
//       <Footer />
//     </div>
//   );
// }

// export default Home;

import Header from "../components/home/Header/Header";
import Footer from "../components/home/Footer/Footer";
import Feedback from "../components/home/Feedback/Feedback";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section
        className="hero-section py-5 py-md-6"
        style={{ backgroundColor: "#f0fffa" }}
      >
        <div className="container-lg">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4 text-dark">
                Nụ cười khỏe mạnh, cuộc sống tươi sáng
              </h1>
              <p className="lead text-muted mb-4">
                Dịch vụ nha khoa tận tâm với công nghệ hiện đại và đội ngũ
                chuyên nghiệp.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button
                  className="btn btn-lg px-4"
                  style={{
                    backgroundColor: "#2ECCB6",
                    borderColor: "#2ECCB6",
                    color: "#fff",
                  }}
                  onClick={() => navigate("/signin")}
                >
                  Đặt lịch ngay
                </button>
                <button
                  className="btn btn-outline-primary btn-lg px-4"
                  style={{
                    borderColor: "#2ECCB6",
                    color: "#2ECCB6",
                  }}
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
            {/* Ảnh */}
            {/* <div className="col-lg-6 text-center">
              <img
                src="/images/home/1.jpg"
                alt="Phòng khám nha khoa hiện đại"
                className="img-fluid rounded-3 shadow-sm"
                style={{ maxHeight: "480px", objectFit: "cover" }}
              />
            </div> */}
            <div className="col-lg-6 text-center">
              <Slider
                dots={true}
                infinite={true}
                autoplay={true}
                autoplaySpeed={2000}
                speed={800}
                slidesToShow={1}
                slidesToScroll={1}
                arrows={false}
              >
                {[
                  "/images/home/1.jpg",
                  "/images/home/2.jpg",
                  "/images/home/5.jpg",
                  "/images/home/4.jpg",
                ].map((src, i) => (
                  <div key={i}>
                    <img
                      src={src}
                      alt={`Ảnh phòng khám ${i + 1}`}
                      className="img-fluid rounded-3 shadow-sm"
                      style={{
                        maxHeight: "480px",
                        objectFit: "cover",
                        width: "100%",
                        borderRadius: "15px",
                      }}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container-lg">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
              Dịch vụ nổi bật của chúng tôi
            </h2>
            <p className="text-muted lead">
              Mang đến cho bạn trải nghiệm nha khoa an toàn, hiện đại và tận
              tâm.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "fa-tooth",
                title: "Trồng răng giả",
                desc: "Khôi phục răng đã mất bằng răng giả bền, đẹp và tự nhiên.",
              },
              {
                icon: "fa-syringe",
                title: "Tẩy trắng răng",
                desc: "Mang lại nụ cười trắng sáng tự nhiên chỉ trong 1 buổi.",
              },
              {
                icon: "fa-smile-beam",
                title: "Niềng răng",
                desc: "Điều chỉnh răng đều đẹp, cải thiện khớp cắn và thẩm mỹ.",
              },
            ].map((s, i) => (
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
        </div>
      </section>

      {/* About Section */}
      <section
        className="py-5"
        style={{ backgroundColor: "#f0fffa", borderTop: "1px solid #e5e5e5" }}
      >
        <div className="container-lg">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="/images/home/3.jpg"
                alt="Đội ngũ bác sĩ nha khoa"
                className="img-fluid rounded-3 shadow-sm"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
                Tận tâm – Chuyên nghiệp – Hiện đại
              </h2>
              <p className="text-muted mb-4">
                Chúng tôi luôn đặt sức khỏe răng miệng và sự hài lòng của bạn
                lên hàng đầu, với đội ngũ chuyên gia giàu kinh nghiệm cùng trang
                thiết bị hiện đại.
              </p>
              <ul className="list-unstyled text-muted">
                <li className="mb-2">
                  <i
                    className="fas fa-check-circle me-2"
                    style={{ color: "#2ECCB6" }}
                  ></i>
                  Trang thiết bị chuẩn quốc tế
                </li>
                <li className="mb-2">
                  <i
                    className="fas fa-check-circle me-2"
                    style={{ color: "#2ECCB6" }}
                  ></i>
                  Bác sĩ nhiều năm kinh nghiệm
                </li>
                <li>
                  <i
                    className="fas fa-check-circle me-2"
                    style={{ color: "#2ECCB6" }}
                  ></i>
                  Dịch vụ tận tâm – chuyên nghiệp
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <Feedback />

      {/* CTA Section */}
      <section
        className="py-5 text-white text-center"
        style={{ backgroundColor: "#2ECCB6" }}
      >
        <div className="container-lg">
          <h2 className="display-6 fw-bold mb-3">
            Sẵn sàng cho nụ cười tươi sáng?
          </h2>
          <p className="lead mb-4">
            Liên hệ với chúng tôi ngay hôm nay để đặt lịch khám miễn phí.
          </p>
          <button className="btn btn-light btn-lg fw-bold px-4">
            Đặt lịch ngay
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-5"
        style={{ backgroundColor: "#f0fffa", borderTop: "1px solid #e5e5e5" }}
      >
        <div className="container-lg">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
              Liên hệ với chúng tôi
            </h2>
            <p className="text-muted lead">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.
            </p>
          </div>

          <div className="row g-4">
            {[
              {
                icon: "fa-phone",
                title: "Điện thoại",
                text: "(+84) 123 456 789",
              },
              {
                icon: "fa-map-marker-alt",
                title: "Địa chỉ",
                text: "123 Hoà Lạc, TP.HN",
              },
              {
                icon: "fa-envelope",
                title: "Email",
                text: "sdcms@gmail.com",
              },
            ].map((item, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div
                  className="card h-100 border-0 shadow-sm text-center p-4"
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
                      className={`fas ${item.icon}`}
                      style={{ color: "#2ECCB6", fontSize: "2rem" }}
                    ></i>
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
