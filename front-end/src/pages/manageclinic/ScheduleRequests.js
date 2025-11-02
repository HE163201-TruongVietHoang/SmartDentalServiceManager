// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

// export default function ScheduleRequests() {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const navigate = useNavigate();

//   const fetchRequests = async (currentPage = 1) => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("token");

//       const res = await fetch(
//         `http://localhost:5000/api/schedules/requests?page=${currentPage}&limit=10`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       const data = await res.json();

//       if (data.success) {
//         setRequests(data.data || []);
//         setTotalPages(data.meta?.totalPages || 1);
//       }
//     } catch (err) {
//       console.error("Lỗi khi tải yêu cầu:", err);
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRequests(page);
//   }, [page]);

//   const filteredRequests = (requests || []).filter((r) => {
//     const matchesSearch =
//       (r.doctorName || "").toLowerCase().includes(search.toLowerCase()) ||
//       (r.note || "").toLowerCase().includes(search.toLowerCase());
//     const matchesStatus =
//       statusFilter === "All" ? true : r.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   return (
//     <div className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-md mt-8 border border-gray-100 transition-all duration-200">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
//         <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
//           🗓️ Quản lý yêu cầu lịch làm việc
//         </h2>
//         <div className="flex flex-wrap gap-3 items-center">
//           <div className="relative">
//             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
//             <input
//               type="text"
//               placeholder="Tìm bác sĩ hoặc ghi chú..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
//             />
//           </div>

//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
//           >
//             <option value="All">Tất cả</option>
//             <option value="Pending">Đang chờ</option>
//             <option value="Approved">Đã duyệt</option>
//             <option value="Rejected">Từ chối</option>
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Loader2 className="animate-spin text-blue-500" size={40} />
//         </div>
//       ) : filteredRequests.length === 0 ? (
//         <div className="text-center text-gray-500 py-16 text-lg italic">
//           Không có yêu cầu nào phù hợp.
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
//             <table className="w-full border-collapse text-sm md:text-base">
//               <thead className="bg-gray-50 text-gray-700">
//                 <tr className="text-left">
//                   <th className="p-4 font-semibold">#</th>
//                   <th className="p-4 font-semibold">👨‍⚕️ Bác sĩ</th>
//                   <th className="p-4 font-semibold">📝 Ghi chú</th>
//                   <th className="p-4 font-semibold">📅 Ngày gửi</th>
//                   <th className="p-4 font-semibold">📊 Trạng thái</th>
//                   <th className="p-4 text-center font-semibold">🔍 Thao tác</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredRequests.map((r, i) => (
//                   <tr
//                     key={r.requestId || i}
//                     className="border-t hover:bg-gray-50 transition-all duration-150"
//                   >
//                     <td className="p-4 text-gray-600">{(page - 1) * 10 + i + 1}</td>
//                     <td className="p-4 font-medium text-gray-800">{r.doctorName}</td>
//                     <td className="p-4 text-gray-600">{r.note || "-"}</td>
//                     <td className="p-4 text-gray-600 whitespace-nowrap">
//                       {r.createdAt
//                         ? new Date(r.createdAt).toLocaleString("vi-VN")
//                         : "-"}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center gap-1.5">
//                         {r.status === "Pending" && (
//                           <Clock size={18} className="text-yellow-500" />
//                         )}
//                         {r.status === "Approved" && (
//                           <CheckCircle size={18} className="text-green-600" />
//                         )}
//                         {r.status === "Rejected" && (
//                           <XCircle size={18} className="text-red-500" />
//                         )}
//                         <span
//                           className={`text-sm font-medium ${
//                             r.status === "Pending"
//                               ? "text-yellow-600"
//                               : r.status === "Approved"
//                               ? "text-green-700"
//                               : "text-red-600"
//                           }`}
//                         >
//                           {r.status === "Pending"
//                             ? "Đang chờ"
//                             : r.status === "Approved"
//                             ? "Đã duyệt"
//                             : "Từ chối"}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="p-4 text-center">
//                       <button
//                         onClick={() => navigate(`/schedule-requests/${r.requestId}`)}
//                         className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
//                       >
//                         Xem chi tiết →
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col md:flex-row justify-center items-center gap-3 mt-8">
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(p - 1, 1))}
//                 disabled={page === 1}
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//               >
//                 ← Trước
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//                 disabled={page === totalPages}
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//               >
//                 Sau →
//               </button>
//             </div>
//             <span className="text-gray-600 text-sm">
//               Trang <strong>{page}</strong> / {totalPages}
//             </span>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function ScheduleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  const fetchRequests = async (currentPage = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `http://localhost:5000/api/schedules/requests?page=${currentPage}&limit=10`;

      console.log("📡 Fetching data from:", url);
      console.log("🪪 Using token:", token ? "✅ Found" : "❌ Missing");

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📥 Response status:", res.status);
      const data = await res.json();
      console.log("📦 Response data:", data);

      if (res.ok && data.success) {
        setRequests(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        console.log("✅ Loaded requests:", data.data?.length || 0);
      } else {
        console.warn("⚠️ API returned an error:", data.message || data);
        setRequests([]);
      }
    } catch (err) {
      console.error("💥 Lỗi khi tải yêu cầu:", err);
      setRequests([]);
    } finally {
      setLoading(false);
      console.log("🕓 Fetch done for page:", currentPage);
    }
  };

  useEffect(() => {
    fetchRequests(page);
  }, [page]);

  const filteredRequests = (requests || []).filter((r) => {
    const matchesSearch =
      (r.doctorName || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.note || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-3xl shadow-md mt-8 border border-gray-100 transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
          🗓️ Quản lý yêu cầu lịch làm việc
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm bác sĩ hoặc ghi chú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          >
            <option value="All">Tất cả</option>
            <option value="Pending">Đang chờ</option>
            <option value="Approved">Đã duyệt</option>
            <option value="Rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-16 text-lg italic">
          Không có yêu cầu nào phù hợp.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100">
            <table className="w-full border-collapse text-sm md:text-base">
              <thead className="bg-gray-50 text-gray-700">
                <tr className="text-left">
                  <th className="p-4 font-semibold">#</th>
                  <th className="p-4 font-semibold">👨‍⚕️ Bác sĩ</th>
                  <th className="p-4 font-semibold">📝 Ghi chú</th>
                  <th className="p-4 font-semibold">📅 Ngày gửi</th>
                  <th className="p-4 font-semibold">📊 Trạng thái</th>
                  <th className="p-4 text-center font-semibold">🔍 Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r, i) => (
                  <tr
                    key={r.requestId || i}
                    className="border-t hover:bg-gray-50 transition-all duration-150"
                  >
                    <td className="p-4 text-gray-600">
                      {(page - 1) * 10 + i + 1}
                    </td>
                    <td className="p-4 font-medium text-gray-800">
                      {r.doctorName}
                    </td>
                    <td className="p-4 text-gray-600">{r.note || "-"}</td>
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {r.status === "Pending" && (
                          <Clock size={18} className="text-yellow-500" />
                        )}
                        {r.status === "Approved" && (
                          <CheckCircle size={18} className="text-green-600" />
                        )}
                        {r.status === "Rejected" && (
                          <XCircle size={18} className="text-red-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            r.status === "Pending"
                              ? "text-yellow-600"
                              : r.status === "Approved"
                              ? "text-green-700"
                              : "text-red-600"
                          }`}
                        >
                          {r.status === "Pending"
                            ? "Đang chờ"
                            : r.status === "Approved"
                            ? "Đã duyệt"
                            : "Từ chối"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/schedule-requests/${r.requestId}`)
                        }
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition"
                      >
                        Xem chi tiết →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-3 mt-8">
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau →
              </button>
            </div>
            <span className="text-gray-600 text-sm">
              Trang <strong>{page}</strong> / {totalPages}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
