import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ScheduleRequestDetail() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/schedules/requests/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setDetails(data.details);
        } else {
          alert("Không tìm thấy yêu cầu này!");
          navigate("/schedule-requests");
        }
      } catch (err) {
        console.error("Lỗi khi tải chi tiết yêu cầu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu này không?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/schedules/requests/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã duyệt yêu cầu thành công");
        navigate("/schedule-requests");
      } else {
        alert(data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi duyệt:", err);
      alert("Không thể duyệt yêu cầu.");
    }
  };

  const handleReject = async () => {
    const reason = prompt("Nhập lý do từ chối yêu cầu:"); // popup nhập lý do
    if (!reason) return;

    if (!window.confirm("Bạn có chắc muốn từ chối yêu cầu này không?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/schedules/requests/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }), // 🔑 gửi body theo backend
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã từ chối yêu cầu thành công");
        navigate("/schedule-requests");
      } else {
        alert(data.message || "Thao tác thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi từ chối:", err);
      alert("Không thể từ chối yêu cầu.");
    }
  };

  if (loading) return <div className="text-center mt-8 text-gray-500">⏳ Đang tải chi tiết...</div>;
  if (!details) return <div className="text-center mt-8 text-red-500">Không tìm thấy yêu cầu.</div>;

  const { request, schedules } = details;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-700 text-center">
        🗓️ Chi tiết yêu cầu lịch làm việc
      </h2>

      {/* Thông tin yêu cầu */}
      <div className="space-y-2 text-gray-700 mb-6">
        <p><b>Bác sĩ:</b> {request.doctorName}</p>
        <p><b>Ngày tạo yêu cầu:</b> {new Date(request.createdAt).toLocaleString("vi-VN")}</p>
        <p><b>Ghi chú:</b> {request.note || "Không có"}</p>
        <p>
          <b>Trạng thái:</b>{" "}
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              request.status === "Approved"
                ? "bg-green-100 text-green-700"
                : request.status === "Rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {request.status}
          </span>
        </p>
      </div>

      {/* Danh sách ca làm việc */}
      <h3 className="text-lg font-semibold mb-3 text-gray-800">📋 Các ca làm việc</h3>
      {schedules.length > 0 ? (
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-2 px-3 border-b">#</th>
              <th className="py-2 px-3 border-b">Ngày</th>
              <th className="py-2 px-3 border-b">Thời gian</th>
              <th className="py-2 px-3 border-b">Phòng</th>
              <th className="py-2 px-3 border-b">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s, index) => (
              <tr key={s.scheduleId} className="text-center hover:bg-gray-50">
                <td className="py-2 border-b">{index + 1}</td>
                <td className="py-2 border-b">
                  {new Date(s.workDate).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-2 border-b">
                  {new Date(s.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} -{" "}
                  {new Date(s.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="py-2 border-b">{s.roomId ? `Phòng ${s.roomId}` : "Chưa có"}</td>
                <td className="py-2 border-b">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      s.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : s.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-gray-500 italic text-center">Không có ca làm việc nào.</div>
      )}

      {/* Nút hành động */}
      {request.status === "Pending" && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleApprove}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            ✅ Duyệt
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            ❌ Từ chối
          </button>
        </div>
      )}

      {/* Nút quay lại */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/schedule-requests")}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Quay lại danh sách
        </button>
      </div>
    </div>
  );
}
