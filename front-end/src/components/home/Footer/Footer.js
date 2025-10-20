// import React from "react";

// function Footer() {
//   return (
//     <footer
//       style={{
//         background: "#f8f9fa",
//         padding: "15px",
//         marginTop: "20px",
//         textAlign: "center",
//       }}
//     >
//       <p>© 2025 Smart Dental Service Manager. All rights reserved.</p>
//     </footer>
//   );
// }

// export default Footer;

import React from "react";

export default function Footer() {
  return (
    <footer
      className="py-5 mt-5"
      style={{
        backgroundColor: "#f0fffa",
        borderTop: "1px solid #e5e5e5",
      }}
    >
      <div className="container-lg">
        <div className="row g-4 mb-4">
          <div className="col-md-6 col-lg-3">
            <h5
              className="fw-bold mb-3 d-flex align-items-center"
              style={{ color: "#2ECCB6" }}
            >
              <i
                className="fas fa-tooth me-2"
                style={{ color: "#2ECCB6", fontSize: "1.2rem" }}
              ></i>
              Smart Dental Clinic
            </h5>
            <p className="small text-muted">
              Chăm sóc nụ cười của bạn là ưu tiên của chúng tôi.
            </p>
          </div>

          {[
            {
              title: "Dịch vụ",
              items: ["Vệ sinh răng", "Trám răng", "Niềng răng"],
            },
            {
              title: "Công ty",
              items: ["Về chúng tôi", "Liên hệ", "Chính sách"],
            },
            { title: "Theo dõi", items: ["Facebook", "Instagram", "Twitter"] },
          ].map((col, i) => (
            <div key={i} className="col-md-6 col-lg-3">
              <h6 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
                {col.title}
              </h6>
              <ul className="list-unstyled small">
                {col.items.map((item, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-muted text-decoration-none"
                      style={{ transition: "0.3s" }}
                      onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                      onMouseLeave={(e) => (e.target.style.color = "#6c757d")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr style={{ borderTop: "1px solid #e5e5e5" }} />
        <div className="text-center small text-muted mt-3">
          <p className="mb-0">&copy; 2025 Smart Dental Clinic.</p>
        </div>
      </div>
    </footer>
  );
}
