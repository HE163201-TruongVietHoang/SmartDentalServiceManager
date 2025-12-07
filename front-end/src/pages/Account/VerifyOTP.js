import React, { useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const storedUser = JSON.parse(localStorage.getItem("signupUser") || "{}");
    console.log("Stored signupUser:", storedUser);

    if (!storedUser?.email && !storedUser?.userId) {
      toast.error(
        "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!"
      );
      setLoading(false);
      return;
    }

    // chuẩn bị payload: gửi cả email + userId; và cả key 'code' lẫn 'otp' nếu muốn
    const payloads = [
      { email: storedUser.email, userId: storedUser.userId, code: otp },
      { email: storedUser.email, userId: storedUser.userId, otp: otp },
    ];

    try {
      // thử từng payload đến cùng endpoint; backend có thể chấp nhận 1 trong 2
      let res;
      for (const p of payloads) {
        console.log("Thử verify với payload:", p);
        try {
          res = await axios.post(
            "http://localhost:5000/api/auth/verify-otp",
            p
          );
          if (res?.data) break; // thành công
        } catch (innerErr) {
          // nếu lỗi 400/404 thì tiếp tục thử payload khác
          console.warn(
            "verify attempt failed:",
            innerErr?.response?.data ?? innerErr.message
          );
          // nếu lỗi server khác, tiếp tục thử khác
        }
      }

      if (!res) {
        // tất cả payload thử thất bại => lấy thông tin lỗi cuối cùng (nếu có)
        setMessage(
          "Xác minh thất bại. Vui lòng kiểm tra mã hoặc yêu cầu gửi lại OTP."
        );
        toast.error("Xác minh thất bại. Vui lòng thử lại.");
        setLoading(false);
        return;
      }

      console.log("Verify success response:", res.data);
      localStorage.setItem("token", res.data.token || res.data.jwtToken);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("sessionId", res.data.sessionId);
      localStorage.removeItem("signupUser");

      toast.success("Xác minh thành công!Đang đăng nhập...");

      const roleName = res.data.user?.roleName;
      setTimeout(() => {
        switch (roleName) {
          case "Patient":
            navigate("/");
            break;
          case "Doctor":
            navigate("/doctor/schedule");
            break;
          case "Nurse":
            navigate("/nurse/materials");
            break;
          case "ClinicManager":
            navigate("/clinicmanager/dashboard");
            break;
          case "Receptionist":
            navigate("/receptionist/patient/appointment");
            break;
          case "Admin":
            navigate("/admin/accounts");
            break;
          default:
            navigate("/");
        }
      }, 1000);
    } catch (err) {
      console.error("Verify OTP error final:", err);
      const serverMsg =
        err.response?.data?.error || err.response?.data?.message;
      toast.error(serverMsg || "Lỗi xác minh OTP, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const storedUser = JSON.parse(localStorage.getItem("signupUser") || "{}");
    if (!storedUser?.email && !storedUser?.userId) {
      toast.error("Không tìm thấy email. Vui lòng đăng nhập lại!");
      return;
    }

    setLoading(true);
    setMessage("");

    // Thử endpoint 'resend-otp' trước, nếu không tồn tại thì fallback 'request-reset-password'
    try {
      console.log("Gửi yêu cầu resend OTP cho:", storedUser);
      // thử endpoint chuyên dụng (nếu backend có)
      let res;
      try {
        res = await axios.post("http://localhost:5000/api/auth/resend-otp", {
          email: storedUser.email,
          userId: storedUser.userId,
        });
      } catch (errResend) {
        console.warn(
          "resend-otp failed:",
          errResend?.response?.status,
          errResend?.response?.data
        );
        // fallback
        res = await axios.post(
          "http://localhost:5000/api/auth/request-reset-password",
          {
            email: storedUser.email,
            userId: storedUser.userId,
          }
        );
      }

      console.log("Resend response:", res.data);
      if (res.data?.success || res.status === 200) {
        toast.success("OTP mới đã được gửi tới email!");
      } else {
        toast.error(res.data?.error || "Không thể gửi lại OTP!");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      const serverMsg = err.response?.data?.error || err.message;
      toast.error(serverMsg || "Lỗi kết nối, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <section
        className="d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#f0fffa", minHeight: "100vh" }}
      >
        <div
          className="card shadow-sm p-4 text-center"
          style={{
            borderRadius: "15px",
            border: "none",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h3 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
            Xác minh OTP
          </h3>
          <p className="text-muted mb-4">
            Nhập mã OTP đã gửi đến email của bạn
          </p>

          <form onSubmit={handleVerify}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control text-center fs-5"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                required
                style={{
                  borderRadius: "10px",
                  letterSpacing: "3px",
                  fontWeight: "600",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn w-100 fw-bold"
              style={{
                backgroundColor: "#2ECCB6",
                color: "#fff",
                borderRadius: "10px",
              }}
              disabled={loading}
            >
              {loading ? "Đang xác minh..." : "Xác minh"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-3 mb-0 fw-medium ${
                message.includes("") ? "text-success" : "text-danger"
              }`}
              style={{ fontSize: "0.9rem" }}
            >
              {message}
            </p>
          )}

          <p className="mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
            Không nhận được mã?{" "}
            <span
              style={{ color: "#2ECCB6", cursor: "pointer", fontWeight: "600" }}
              onClick={handleResendOtp}
            >
              Gửi lại OTP
            </span>
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
