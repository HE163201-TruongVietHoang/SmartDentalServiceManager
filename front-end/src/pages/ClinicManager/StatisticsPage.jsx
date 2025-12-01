import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Container, Row, Col, Card, Table, Alert, Spinner, Form, Button } from 'react-bootstrap';

const StatisticsPage = () => {
  const [appointmentStats, setAppointmentStats] = useState({});
  const [serviceStats, setServiceStats] = useState({});
  const [doctorStats, setDoctorStats] = useState({});
  const [medicineStats, setMedicineStats] = useState({});
  const [ratingStats, setRatingStats] = useState({});
  const [overallStats, setOverallStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [apptRes, svcRes, docRes, medRes, ratRes, ovrRes] = await Promise.all([
          axios.get('http://localhost:5000/api/statistics/appointments', config),
          axios.get('http://localhost:5000/api/statistics/services', config),
          axios.get('http://localhost:5000/api/statistics/doctors', config),
          axios.get('http://localhost:5000/api/statistics/medicines', config),
          axios.get('http://localhost:5000/api/statistics/ratings', config),
          axios.get('http://localhost:5000/api/statistics/overall', config),
        ]);

        setAppointmentStats(apptRes.data);
        setServiceStats(svcRes.data);
        setDoctorStats(docRes.data);
        setMedicineStats(medRes.data);
        setRatingStats(ratRes.data);
        setOverallStats(ovrRes.data);
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Filter data based on selected year
  const filteredMonthlyStats = (appointmentStats.monthlyStats || []).filter(stat => stat.year === selectedYear);
  const filteredMonthlyServiceStats = (serviceStats.monthlyServiceStats || []).filter(stat => stat.year === selectedYear);
  const filteredMonthlyMedicineStats = (medicineStats.monthlyMedicineStats || []).filter(stat => stat.year === selectedYear);

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
      <h1 className="text-center mb-4" style={{ color: '#2ecc71', fontWeight: 'bold' }}>Thống Kê Hệ Thống</h1>

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
          <Button variant="success" onClick={() => exportToCSV(appointmentStats.statusStats || [], 'appointment_status.csv')} className="me-2">Export Appointments Status</Button>
          <Button variant="success" onClick={() => exportToCSV(appointmentStats.doctorStats || [], 'appointment_doctors.csv')} className="me-2">Export Appointments Doctors</Button>
          <Button variant="success" onClick={() => exportToCSV(filteredMonthlyStats, 'appointment_monthly.csv')} className="me-2">Export Appointments Monthly</Button>
          <Button variant="success" onClick={() => exportToCSV(serviceStats.serviceStats || [], 'services.csv')} className="me-2">Export Services</Button>
          <Button variant="success" onClick={() => exportToCSV(doctorStats.doctorStats || [], 'doctors.csv')} className="me-2">Export Doctors</Button>
          <Button variant="success" onClick={() => exportToCSV(medicineStats.medicineStats || [], 'medicines.csv')} className="me-2">Export Medicines</Button>
          <Button variant="success" onClick={() => exportToCSV(ratingStats.doctorRatings || [], 'doctor_ratings.csv')} className="me-2">Export Doctor Ratings</Button>
          <Button variant="success" onClick={() => exportToCSV(ratingStats.serviceRatings || [], 'service_ratings.csv')}>Export Service Ratings</Button>
        </Col>
      </Row>

      {/* Overall Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#2ecc71', color: 'white' }}>
              <h2 className="mb-0">Tổng Quan</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <h3 style={{ color: '#2ecc71' }}>{overallStats.totalAppointments || 0}</h3>
                  <p>Tổng Appointments</p>
                </Col>
                <Col md={3} className="text-center">
                  <h3 style={{ color: '#3498db' }}>{overallStats.totalRevenue || 0} VND</h3>
                  <p>Tổng Doanh Thu</p>
                </Col>
                <Col md={3} className="text-center">
                  <h3 style={{ color: '#9b59b6' }}>{overallStats.totalDoctors || 0}</h3>
                  <p>Tổng Bác Sĩ</p>
                </Col>
                <Col md={3} className="text-center">
                  <h3 style={{ color: '#e74c3c' }}>{overallStats.totalPatients || 0}</h3>
                  <p>Tổng Bệnh Nhân</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Appointments Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#2ecc71', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Appointments</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Theo Trạng Thái</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={appointmentStats.statusStats || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {(appointmentStats.statusStats || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Theo Bác Sĩ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={appointmentStats.doctorStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="doctorName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#2ecc71" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
              <Row className="mt-4">
                <Col>
                  <h3>Theo Tháng</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#2ecc71" />
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Services Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#3498db', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Dịch Vụ</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Sử Dụng Dịch Vụ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceStats.serviceStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="serviceName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="usageCount" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Doanh Thu Dịch Vụ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={serviceStats.serviceStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="serviceName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#e74c3c" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Doctors Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#9b59b6', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Bác Sĩ</h2>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={doctorStats.doctorStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="doctorName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointmentCount" fill="#9b59b6" />
                  <Bar dataKey="revenue" fill="#f39c12" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Medicines Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#e67e22', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Thuốc</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Sử Dụng Thuốc</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={medicineStats.medicineStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="medicineName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="totalQuantity" fill="#e67e22" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Theo Tháng</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={filteredMonthlyMedicineStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="totalQuantity" stroke="#e67e22" />
                    </LineChart>
                  </ResponsiveContainer>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Ratings Stats */}
      <Row className="mb-5">
        <Col>
          <Card className="shadow-sm">
            <Card.Header style={{ backgroundColor: '#1abc9c', color: 'white' }}>
              <h2 className="mb-0">Thống Kê Đánh Giá</h2>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h3>Bác Sĩ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingStats.doctorRatings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="doctorName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgRating" fill="#1abc9c" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col md={6}>
                  <h3>Dịch Vụ</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingStats.serviceRatings || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="serviceName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgRating" fill="#34495e" />
                    </BarChart>
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

export default StatisticsPage;