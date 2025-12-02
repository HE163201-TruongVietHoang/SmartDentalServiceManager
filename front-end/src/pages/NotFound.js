import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Header from "../components/home/Header/Header";
import Footer from "../components/home/Footer/Footer";

const css = `
  .notfound-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #e3f0ff 0%, #f8fbff 100%);
    display: flex;
    flex-direction: column;
  }
  .notfound-content {
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    min-height: 60vh;
    padding: 32px 8px;
  }
  .notfound-card {
    background: #fff;
    border-radius: 1.5rem;
    box-shadow: 0 6px 32px 0 rgba(0, 60, 180, 0.08);
    padding: 3rem 2rem;
    max-width: 420px;
    margin: 0 auto;
  }
  .notfound-title {
    font-size: 2.5rem;
    font-weight: bold;
    color: #0d6efd;
    margin-bottom: 1rem;
  }
  .notfound-desc {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 2rem;
  }
  .notfound-btn {
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    border-radius: 2rem;
    font-weight: 500;
  }
`;

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="notfound-bg">
        <Header />
        <div className="notfound-content">
          <div className="notfound-card">
            <div className="notfound-title">404 - Không tìm thấy trang</div>
            <div className="notfound-desc">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.<br />
              Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
            </div>
            <Button className="notfound-btn" variant="primary" onClick={() => navigate("/")}>Về trang chủ</Button>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default NotFound;
