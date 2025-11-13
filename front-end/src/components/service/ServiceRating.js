import React, { useState } from "react";



export default function ServiceRating({ serviceId, appointmentId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [myRatingId, setMyRatingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy patientId từ localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const patientId = user?.userId;

  // Lấy đánh giá của dịch vụ này
  React.useEffect(() => {
    async function fetchMyRating() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/rating/service/${serviceId}`);
        if (res.ok) {
          const ratings = await res.json();
          const my = ratings.find(r => r.patientId === patientId);
          if (my) {
            setRating(my.rating);
            setComment(my.comment || "");
            setMyRatingId(my.ratingId);
            setSubmitted(true);
          }
        }
      } catch {}
      setLoading(false);
    }
    if (serviceId && patientId) fetchMyRating();
    // eslint-disable-next-line
  }, [serviceId, patientId]);

  const handleStarClick = (star) => {
    setRating(star);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem("jwtToken");
    if (!token) token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để đánh giá.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/rating/service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ serviceId, rating, comment, appointmentId }),
      });
      if (res.ok) {
        setSubmitted(true);
        // Lấy lại ratingId
        const getRes = await fetch(`http://localhost:5000/api/rating/service/${serviceId}`);
        if (getRes.ok) {
          const ratings = await getRes.json();
          const my = ratings.find(r => r.patientId === patientId);
          if (my) setMyRatingId(my.ratingId);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Lỗi gửi đánh giá");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    let token = localStorage.getItem("jwtToken");
    if (!token) token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để sửa đánh giá.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rating/service/${serviceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, appointmentId }),
      });
      if (res.ok) {
        setIsEditing(false);
        setSubmitted(true);
      } else {
        const data = await res.json();
        alert(data.error || "Lỗi cập nhật đánh giá");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    let token = localStorage.getItem("jwtToken");
    if (!token) token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để xóa đánh giá.");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/rating/service/${serviceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRating(0);
        setComment("");
        setSubmitted(false);
        setMyRatingId(null);
      } else {
        const data = await res.json();
        alert(data.error || "Lỗi xóa đánh giá");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    }
  };

  return (
    <div style={{ marginTop: 32, marginBottom: 32 }}>
      <h5 className="fw-bold mb-2">Đánh giá dịch vụ này</h5>
      {loading ? (
        <div>Đang tải...</div>
      ) : myRatingId && patientId ? (
        isEditing ? (
          <form onSubmit={handleUpdate}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    cursor: "pointer",
                    color: star <= rating ? "#FFD700" : "#ccc",
                    marginRight: 4,
                  }}
                  onClick={() => handleStarClick(star)}
                  data-testid={`star-${star}`}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              className="form-control mb-2"
              rows={3}
              placeholder="Nhận xét của bạn (tùy chọn)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={rating === 0}>Lưu</button>
            <button type="button" className="btn btn-secondary ms-2" onClick={() => setIsEditing(false)}>Hủy</button>
          </form>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  style={{
                    color: star <= rating ? "#FFD700" : "#ccc",
                    marginRight: 4,
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="mb-2">{comment}</div>
            <button className="btn btn-warning me-2" onClick={handleEdit}>Sửa</button>
            <button className="btn btn-danger" onClick={handleDelete}>Xóa</button>
          </div>
        )
      ) : submitted ? (
        <div className="alert alert-success">Cảm ơn bạn đã đánh giá!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  cursor: "pointer",
                  color: star <= rating ? "#FFD700" : "#ccc",
                  marginRight: 4,
                }}
                onClick={() => handleStarClick(star)}
                data-testid={`star-${star}`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Nhận xét của bạn (tùy chọn)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={rating === 0}
          >
            Gửi đánh giá
          </button>
        </form>
      )}
    </div>
  );
}
