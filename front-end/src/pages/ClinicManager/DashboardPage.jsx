import React, { useState, useEffect } from 'react';
import axios from 'axios';


const DashboardPage = () => {
  const [overview, setOverview] = useState({});
  const [revenue, setRevenue] = useState({});
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [ovRes, revRes, payRes] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard/overview', config),
          axios.get('http://localhost:5000/api/dashboard/revenue', config),
          axios.get('http://localhost:5000/api/dashboard/payments', config),
        ]);

        setOverview(ovRes.data);
        setRevenue(revRes.data);
        setPayments(payRes.data);
      } catch (err) {
        setError('Failed to load dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard Quản Lý Doanh Thu</h1>

      {/* Overview */}
      <section>
        <h2>Tổng Quan</h2>
        <div className="overview-cards">
          <div className="card">
            <h3>Tổng Appointments</h3>
            <p>{overview.totalAppointments}</p>
          </div>
          <div className="card">
            <h3>Tổng Hóa Đơn Đã Thanh Toán</h3>
            <p>{overview.totalInvoices}</p>
          </div>
          <div className="card">
            <h3>Tổng Doanh Thu</h3>
            <p>{overview.totalRevenue} VND</p>
          </div>
          <div className="card">
            <h3>Tổng Bệnh Nhân</h3>
            <p>{overview.totalPatients}</p>
          </div>
          <div className="card">
            <h3>Tổng Bác Sĩ</h3>
            <p>{overview.totalDoctors}</p>
          </div>
        </div>
      </section>

      {/* Revenue Stats */}
      <section>
        <h2>Thống Kê Doanh Thu</h2>
        <h3>Theo Tháng</h3>
        <table>
          <thead>
            <tr>
              <th>Năm</th>
              <th>Tháng</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {revenue.monthlyRevenue?.map((stat) => (
              <tr key={`${stat.year}-${stat.month}`}>
                <td>{stat.year}</td>
                <td>{stat.month}</td>
                <td>{stat.revenue} VND</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Theo Năm</h3>
        <table>
          <thead>
            <tr>
              <th>Năm</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {revenue.yearlyRevenue?.map((stat) => (
              <tr key={stat.year}>
                <td>{stat.year}</td>
                <td>{stat.revenue} VND</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Doanh Thu Từ Dịch Vụ</h3>
        <table>
          <thead>
            <tr>
              <th>Tên Dịch Vụ</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {revenue.serviceRevenue?.map((stat) => (
              <tr key={stat.serviceName}>
                <td>{stat.serviceName}</td>
                <td>{stat.revenue} VND</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Doanh Thu Theo Trạng Thái Hóa Đơn</h3>
        <table>
          <thead>
            <tr>
              <th>Trạng Thái</th>
              <th>Doanh Thu</th>
            </tr>
          </thead>
          <tbody>
            {revenue.invoiceStatusRevenue?.map((stat) => (
              <tr key={stat.status}>
                <td>{stat.status}</td>
                <td>{stat.revenue} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Payment Stats */}
      <section>
        <h2>Thống Kê Thanh Toán</h2>
        <h3>Theo Phương Thức</h3>
        <table>
          <thead>
            <tr>
              <th>Phương Thức</th>
              <th>Số Lần</th>
              <th>Tổng Số Tiền</th>
            </tr>
          </thead>
          <tbody>
            {payments.paymentMethodStats?.map((stat) => (
              <tr key={stat.paymentMethod}>
                <td>{stat.paymentMethod}</td>
                <td>{stat.count}</td>
                <td>{stat.totalAmount} VND</td>
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
              <th>Số Lần</th>
              <th>Tổng Số Tiền</th>
            </tr>
          </thead>
          <tbody>
            {payments.monthlyPaymentStats?.map((stat) => (
              <tr key={`${stat.year}-${stat.month}`}>
                <td>{stat.year}</td>
                <td>{stat.month}</td>
                <td>{stat.count}</td>
                <td>{stat.totalAmount} VND</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default DashboardPage;