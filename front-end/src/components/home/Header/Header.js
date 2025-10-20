// import React from "react";
// import { Link } from "react-router-dom";

// function Header() {
//   return (
//     <header
//       style={{
//         background: "#007bff",
//         color: "white",
//         padding: "15px 30px",
//         display: "flex",
//         justifyContent: "space-between",
//         alignItems: "center",
//       }}
//     >
//       {/* Logo / Tên hệ thống */}
//       <div>
//         <h1 style={{ margin: 0, fontSize: "20px" }}>
//           Smart Dental Service Manager
//         </h1>
//       </div>

//       {/* Menu chính */}
//       <nav style={{ flexGrow: 1, marginLeft: "50px" }}>
//         <Link
//           to="/"
//           style={{
//             color: "white",
//             marginRight: "20px",
//             textDecoration: "none",
//           }}
//         >
//           Trang chủ
//         </Link>
//         <Link
//           to="/services"
//           style={{
//             color: "white",
//             marginRight: "20px",
//             textDecoration: "none",
//           }}
//         >
//           Dịch vụ
//         </Link>
//         <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
//           Liên hệ
//         </Link>
//       </nav>

//       {/* Nút Sign In / Sign Up */}
//       <div>
//         <Link to="/signin">
//           <button
//             style={{
//               marginRight: "10px",
//               padding: "8px 16px",
//               backgroundColor: "#0056b3",
//               border: "none",
//               borderRadius: "5px",
//               color: "white",
//               cursor: "pointer",
//             }}
//           >
//             Sign In
//           </button>
//         </Link>

//         <Link to="/signup">
//           <button
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#28a745",
//               border: "none",
//               borderRadius: "5px",
//               color: "white",
//               cursor: "pointer",
//             }}
//           >
//             Sign Up
//           </button>
//         </Link>
//       </div>
//     </header>
//   );
// }

// export default Header;

import React from "react";

export default function Header() {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm"
      style={{ padding: "12px 0" }}
    >
      <div className="container-lg">
        <a
          className="navbar-brand fw-bold fs-4 d-flex align-items-center"
          href="#home"
          style={{ color: "#2ECCB6", textDecoration: "none" }}
        >
          <i
            className="fas fa-tooth me-2"
            style={{ color: "#2ECCB6", fontSize: "1.4rem" }}
          ></i>
          Smart Dental Clinic
        </a>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {["Dịch vụ", "Về chúng tôi", "Liên hệ"].map((item, i) => (
              <li key={i} className="nav-item">
                <a
                  className="nav-link"
                  href="#"
                  style={{
                    color: "#333",
                    fontWeight: 500,
                    transition: "color 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#2ECCB6")}
                  onMouseLeave={(e) => (e.target.style.color = "#333")}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>

          <button
            className="btn ms-3 px-4"
            style={{
              borderRadius: "25px",
              backgroundColor: "#2ECCB6",
              borderColor: "#2ECCB6",
              color: "#fff",
              fontWeight: "500",
            }}
          >
            Đặt lịch
          </button>
        </div>
      </div>
    </nav>
  );
}
