import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatisticsPage.css'; // Tạo CSS nếu cần

const StatisticsPage = () => {
  const [appointmentStats, setAppointmentStats] = useState({});
  const [serviceStats, setServiceStats] = useState({});
  const [doctorStats, setDoctorStats] = useState({});
  const [medicineStats, setMedicineStats] = useState({});
  const [ratingStats, setRatingStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [apptRes, svcRes, docRes, medRes, ratRes] = await Promise.all([
          axios.get('http://localhost:5000/api/statistics/appointments', config),
          axios.get('http://localhost:5000/api/statistics/services', config),
          axios.get('http://localhost:5000/api/statistics/doctors', config),
          axios.get('http://localhost:5000/api/statistics/medicines', config),
          axios.get('http://localhost:5000/api/statistics/ratings', config),
        ]);

        setAppointmentStats(apptRes.data);
        setServiceStats(svcRes.data);
        setDoctorStats(docRes.data);
        setMedicineStats(medRes.data);
        setRatingStats(ratRes.data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="statistics-page">
      <h1>Thống Kê Hệ Thống</h1>

      {/* Appointments Stats */}
      <section>
        <h2>Thống Kê Appointments</h2>
        <h3>Theo Trạng Thái</h3>
        <table>
          <thead>
            <tr>
              <th>Trạng Thái</th>
              <th>Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            {appointmentStats.statusStats?.map((stat) => (
              <tr key={stat.status}>
                <td>{stat.status}</td>
                <td>{stat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Theo Bác Sĩ</h3>
        <table>
          <thead>
            <tr>
              <th>Bác Sĩ</th>
              <th>Số Appointments</th>
            </tr>
          </thead>
          <tbody>
            {appointmentStats.doctorStats?.map((stat) => (
              <tr key={stat.doctorName}>
                <td>{stat.doctorName}</td>
                <td>{stat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Theo Tháng</h3>
        <table>
          <thead>
            <tr>
              <th>Năm</th>
              <th>Tháng</th>
              <th>Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            {appointmentStats.monthlyStats?.map((stat) => (
              <tr key={`${stat.year}-${stat.month}`}>
                <td>{stat.year}</td>
                <td>{stat.month}</td>
                <td>{stat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Services Stats */}
      <section>
        <h2>Thống Kê Dịch Vụ</h2>
        <h3>Tổng Quan</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Dịch Vụ</th>
              <th>Số Lần Sử Dụng</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {serviceStats.serviceStats?.map((stat) => (
              <tr key={stat.serviceName}>
                <td>{stat.serviceName}</td>
                <td>{stat.usageCount}</td>
                <td>{stat.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Theo Tháng</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Dịch Vụ</th>
              <th>Năm</th>
              <th>Tháng</th>
              <th>Số Lần</th>
            </tr>
          </thead>
          <tbody>
            {serviceStats.monthlyServiceStats?.map((stat) => (
              <tr key={`${stat.serviceName}-${stat.year}-${stat.month}`}>
                <td>{stat.serviceName}</td>
                <td>{stat.year}</td>
                <td>{stat.month}</td>
                <td>{stat.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Doctors Stats */}
      <section>
        <h2>Thống Kê Bác Sĩ</h2>
        <table>
          <thead>
            <tr>
              <th>Bác Sĩ</th>
              <th>Số Appointments</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {doctorStats.doctorStats?.map((stat) => (
              <tr key={stat.doctorName}>
                <td>{stat.doctorName}</td>
                <td>{stat.appointmentCount}</td>
                <td>{stat.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Medicines Stats */}
      <section>
        <h2>Thống Kê Thuốc</h2>
        <h3>Tổng Quan</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Thuốc</th>
              <th>Tổng Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            {medicineStats.medicineStats?.map((stat) => (
              <tr key={stat.medicineName}>
                <td>{stat.medicineName}</td>
                <td>{stat.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Theo Tháng</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Thuốc</th>
              <th>Năm</th>
              <th>Tháng</th>
              <th>Tổng Số Lượng</th>
            </tr>
          </thead>
          <tbody>
            {medicineStats.monthlyMedicineStats?.map((stat) => (
              <tr key={`${stat.medicineName}-${stat.year}-${stat.month}`}>
                <td>{stat.medicineName}</td>
                <td>{stat.year}</td>
                <td>{stat.month}</td>
                <td>{stat.totalQuantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Ratings Stats */}
      <section>
        <h2>Thống Kê Đánh Giá</h2>
        <h3>Bác Sĩ</h3>
        <table>
          <thead>
            <tr>
              <th>Bác Sĩ</th>
              <th>Đánh Giá Trung Bình</th>
              <th>Số Đánh Giá</th>
            </tr>
          </thead>
          <tbody>
            {ratingStats.doctorRatings?.map((stat) => (
              <tr key={stat.doctorName}>
                <td>{stat.doctorName}</td>
                <td>{stat.avgRating?.toFixed(2)}</td>
                <td>{stat.ratingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Dịch Vụ</h3>
        <table>
          <thead>
            <tr>
              <th>Dịch Vụ</th>
              <th>Đánh Giá Trung Bình</th>
              <th>Số Đánh Giá</th>
            </tr>
          </thead>
          <tbody>
            {ratingStats.serviceRatings?.map((stat) => (
              <tr key={stat.serviceName}>
                <td>{stat.serviceName}</td>
                <td>{stat.avgRating?.toFixed(2)}</td>
                <td>{stat.ratingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default StatisticsPage;