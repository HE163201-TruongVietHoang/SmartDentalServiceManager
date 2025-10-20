import React from "react";

export default function Feedback() {
  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Bệnh nhân",
      content: "Dịch vụ tuyệt vời, đội ngũ chuyên nghiệp và thân thiện.",
      rating: 5,
    },
    {
      name: "Trần Thị B",
      role: "Bệnh nhân",
      content: "Phòng khám sạch sẽ, hiện đại. Bác sĩ rất tận tâm.",
      rating: 5,
    },
    {
      name: "Lê Văn C",
      role: "Bệnh nhân",
      content: "Điều trị nhẹ nhàng, không đau. Rất đáng tin cậy!",
      rating: 5,
    },
  ];

  return (
    <section
      id="feedback"
      className="py-5"
      style={{ backgroundColor: "#f0fffa" }}
    >
      <div className="container-lg">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
            Đánh giá từ bệnh nhân
          </h2>
          <p className="lead text-muted">
            Hàng nghìn bệnh nhân đã hài lòng với dịch vụ của SmileCare
          </p>
        </div>

        <div className="row g-4">
          {testimonials.map((t, i) => (
            <div key={i} className="col-md-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm text-center"
                style={{
                  borderRadius: "15px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(46, 204, 182, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.05)";
                }}
              >
                <div className="card-body">
                  <div className="mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <i
                        key={j}
                        className="fas fa-star"
                        style={{ color: "#FFD700" }}
                      ></i>
                    ))}
                  </div>
                  <p className="card-text text-muted fst-italic mb-3">
                    “{t.content}”
                  </p>
                  <h6 className="card-title fw-bold mb-1">{t.name}</h6>
                  <small className="text-muted">{t.role}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
