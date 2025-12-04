import React, { useEffect, useState } from "react";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API_URL = "http://localhost:5000/api/auth/doctors";

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(API_URL);
      if (Array.isArray(res.data)) setDoctors(res.data);
      else if (res.data.doctors) setDoctors(res.data.doctors);
      else throw new Error("Dữ liệu không hợp lệ từ server");
    } catch (err) {
      console.error("❌ Lỗi khi tải bác sĩ:", err);
      setError("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const removeAccent = (str) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();

  const smartMatch = (search, text) => {
    const rawSearch = search.trim().toLowerCase();
    const rawText = text.toLowerCase();

    if (!rawSearch) return true;

    const hasAccent =
      /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/i.test(
        rawSearch
      );

    if (hasAccent) return rawText.includes(rawSearch);

    return removeAccent(rawText).includes(removeAccent(rawSearch));
  };

  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors = doctors.filter((d) =>
    smartMatch(searchTerm, d.fullName)
  );

  // PHÂN TRANG (Load More / Collapse)
  const handleLoadMore = () =>
    setVisibleCount((prev) => Math.min(prev + 9, filteredDoctors.length));

  const handleCollapse = () => setVisibleCount(9);

  return (
    <div>
      <Header />
      <section className="py-5" style={{ backgroundColor: "#fff" }}>
        <div className="container-lg">
          <div className="text-center mb-3">
            <h2 className="fw-bold mb-3" style={{ color: "#2ECCB6" }}>
              Danh sách bác sĩ
            </h2>
            <p className="text-muted lead">
              Chọn bác sĩ phù hợp để đặt lịch khám nha khoa.
            </p>
          </div>

          <div className="mb-3 d-flex justify-content-end">
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm bác sĩ..."
              style={{ maxWidth: "400px" }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(9); // reset phân trang khi search
              }}
            />
          </div>

          {loading && (
            <div className="text-center my-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-3 text-muted">Đang tải danh sách bác sĩ...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          {!loading && !error && (
            <>
              {filteredDoctors.length === 0 ? (
                <div className="text-center text-muted">
                  <p>Không có bác sĩ nào để hiển thị.</p>
                </div>
              ) : (
                <div className="row g-4">
                  {filteredDoctors.slice(0, visibleCount).map((d) => (
                    <div key={d.doctorId} className="col-md-6 col-lg-4">
                      <div
                        className="card border-0 shadow-sm h-100 text-center p-4"
                        style={{
                          borderRadius: "15px",
                          cursor: "pointer",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                        }}
                        onClick={() => navigate(`/doctor/${d.userId}`)}
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
                        <img
                          src={
                            d.avatar ||
                            "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          }
                          alt={d.fullName}
                          className="rounded-circle mb-3"
                          width="100"
                          height="100"
                        />
                        <h5 className="fw-bold mb-1">{d.fullName}</h5>
                        <p className="text-muted small">{d.specialty}</p>
                        <p className="text-success fw-semibold">
                          Kinh nghiệm: {d.experience} năm
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* PHẦN NÚT PHÂN TRANG */}
          {!loading && !error && filteredDoctors.length > 9 && (
            <div className="d-flex justify-content-center align-items-center mt-4 gap-2">
              {visibleCount < filteredDoctors.length && (
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
