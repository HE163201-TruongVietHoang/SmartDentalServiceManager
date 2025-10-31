// src/pages/SignUp.jsx
import React, { useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isConfirmed) {
      alert("❌ Vui lòng xác nhận thông tin đầy đủ và chính xác!");
      return;
    }
    if (!formData.gender) {
      alert("❌ Vui lòng chọn giới tính!");
      return;
    }
    if (!formData.address.trim()) {
      alert("❌ Vui lòng nhập địa chỉ!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("❌ Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob,
        password: formData.password,
        roleId: 3, // default Patient
        isActive: true,
      });

      // Backend không trả về user, nên lưu email vào localStorage để Verify OTP dùng
      localStorage.setItem(
        "signupUser",
        JSON.stringify({ email: formData.email })
      );

      alert("✅ Đăng ký thành công! Vui lòng xác nhận OTP.");
      navigate("/verify-otp");
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        alert("❌ Lỗi đăng ký: " + err.response.data.error);
      } else {
        alert("❌ Có lỗi xảy ra khi đăng ký!");
      }
    }
  };

  return (
    <div>
      <Header />
      <section
        className="py-5"
        style={{ backgroundColor: "#f0fffa", minHeight: "80vh" }}
      >
        <div className="container-lg">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div
                className="card shadow-sm p-4"
                style={{ borderRadius: "15px", border: "none" }}
              >
                <h2
                  className="fw-bold mb-4 text-center"
                  style={{ color: "#2ECCB6" }}
                >
                  Đăng ký tài khoản
                </h2>
                <form onSubmit={handleSubmit}>
                  {/* Các input giống code cũ */}
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@gmail.com"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Phone */}
                  <div className="mb-3">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="0987654321"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Address */}
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Số nhà, đường, quận/huyện, thành phố"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Gender */}
                  <div className="mb-3">
                    <label className="form-label">Giới tính</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Male">Nam</option>
                      <option value="Female">Nữ</option>
                      <option value="Other">Khác</option>
                    </select>
                  </div>
                  {/* DOB */}
                  <div className="mb-3">
                    <label className="form-label">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label">Mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="********"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="********"
                      required
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  {/* Checkbox xác nhận */}
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={isConfirmed}
                      onChange={(e) => setIsConfirmed(e.target.checked)}
                      id="confirmCheck"
                    />
                    <label className="form-check-label" htmlFor="confirmCheck">
                      Tôi đã điền đầy đủ và chính xác thông tin
                    </label>
                  </div>
                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-bold"
                    style={{
                      backgroundColor: isConfirmed ? "#2ECCB6" : "#94d3b4",
                      borderColor: "#2ECCB6",
                      color: "#fff",
                      borderRadius: "10px",
                      cursor: isConfirmed ? "pointer" : "not-allowed",
                    }}
                    disabled={!isConfirmed}
                  >
                    Đăng ký
                  </button>
                </form>
                <p className="mt-3 text-center text-muted">
                  Đã có tài khoản?{" "}
                  <span
                    style={{ color: "#2ECCB6", cursor: "pointer" }}
                    onClick={() => navigate("/signin")}
                  >
                    Đăng nhập
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
