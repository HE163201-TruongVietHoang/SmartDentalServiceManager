import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Container, Row, Col, Card, Table, Alert, Spinner, Form, Button } from 'react-bootstrap';

const DashboardPage = () => {
  const [overview, setOverview] = useState({});
  const [revenue, setRevenue] = useState({});
  const [payments, setPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Filter data based on selected year
  const filteredMonthlyRevenue = (revenue.monthlyRevenue || []).filter(stat => stat.year === selectedYear);
  const filteredMonthlyPayments = (payments.monthlyPaymentStats || []).filter(stat => stat.year === selectedYear);

  // Export to CSV
  const exportToCSV = (data, filename, headers = []) => {
    if (data.length === 0) return;
    const csvRows = [];
    if (headers.length > 0) {
      csvRows.push(headers.join(','));
    } else {
      csvRows.push(Object.keys(data[0]).join(','));
    }
    data.forEach(row => {
      csvRows.push(Object.values(row).join(','));
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" variant="primary" />
      <span className="ms-2">Loading...</span>
    </Container>
  );

  if (error) return (
    <Container className="mt-5">
      <Alert variant="danger" className="text-center">{error}</Alert>
    </Container>
  );

  return (
    <Container fluid className="mt-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 className="text-center mb-4" style={{ color: '#2ecc71', fontWeight: 'bold' }}>Dashboard Quản Lý Doanh Thu</h1>

      {/* Filter */}
      <Row className="mb-4">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Chọn Năm</Form.Label>
            <Form.Control as="select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex align-items-end">
          <Button variant="success" onClick={() => exportToCSV(revenue.monthlyRevenue || [], 'monthly_revenue.csv')} className="me-2">Export Monthly Revenue</Button>
          <Button variant="success" onClick={() => exportToCSV(revenue.yearlyRevenue || [], 'yearly_revenue.csv')} className="me-2">Export Yearly Revenue</Button>
          <Button variant="success" onClick={() => exportToCSV(revenue.serviceRevenue || [], 'service_revenue.csv')} className="me-2">Export Service Revenue</Button>
          <Button variant="success" onClick={() => exportToCSV(revenue.invoiceStatusRevenue || [], 'invoice_status_revenue.csv')} className="me-2">Export Invoice Status Revenue</Button>
          <Button variant="success" onClick={() => exportToCSV(payments.paymentMethodStats || [], 'payment_methods.csv')} className="me-2">Export Payment Methods</Button>
          <Button variant="success" onClick={() => exportToCSV(filteredMonthlyPayments, 'monthly_payments.csv')}>Export Monthly Payments</Button>
        </Col>
      </Row>

      {/* Overview */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#2ecc71', color: 'white' }}>
              <h2 className="mb-0">Tổng Quan</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2} className="text-center">
                  <h3 style={{ color: '#2ecc71' }}>{overview.totalAppointments || 0}</h3>
                  <p>Tổng Appointments</p>
                </Col>
                <Col md={2} className="text-center">
                  <h3 style={{ color: '#3498db' }}>{overview.totalInvoices || 0}</h3>
                  <p>Tổng Hóa Đơn Đã Thanh Toán</p>
                </Col>
                <Col md={2} className="text-center">
                  <h3 style={{ color: '#e74c3c' }}>{overview.totalRevenue || 0} VND</h3>
                  <p>Tổng Doanh Thu</p>
                </Col>
                <Col md={2} className="text-center">
                  <h3 style={{ color: '#9b59b6' }}>{overview.totalPatients || 0}</h3>
                  <p>Tổng Bệnh Nhân</p>
                </Col>
                <Col md={4} className="text-center">
                  <h3 style={{ color: '#f39c12' }}>{overview.totalDoctors || 0}</h3>
                  <p>Tổng Bác Sĩ</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#3498db', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Doanh Thu</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Doanh Thu Theo Tháng</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3498db" />
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Doanh Thu Theo Năm</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenue.yearlyRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col md={6}>
                  <h3>Doanh Thu Từ Dịch Vụ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenue.serviceRevenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="serviceName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#e74c3c" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Doanh Thu Theo Trạng Thái Hóa Đơn</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenue.invoiceStatusRevenue || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, revenue }) => `${status}: ${revenue} VND`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {(revenue.invoiceStatusRevenue || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#9b59b6', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Thanh Toán</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Theo Phương Thức</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={payments.paymentMethodStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="paymentMethod" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#9b59b6" />
                      <Bar dataKey="totalAmount" fill="#f39c12" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Theo Tháng</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlyPayments}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#9b59b6" />
                      <Line type="monotone" dataKey="totalAmount" stroke="#f39c12" />
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;