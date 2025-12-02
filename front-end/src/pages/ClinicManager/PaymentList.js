
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Badge, Button, Form, InputGroup, Pagination } from 'react-bootstrap';
import { getAllPayments } from '../../api/api';

const PaymentList = () => {

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;


  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [payments, statusFilter, methodFilter, dateFilter]);


  const loadPayments = async () => {
    try {
      const response = await getAllPayments();
      setPayments(response.data || response);
    } catch (err) {
      setError('Không thể tải danh sách thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (methodFilter) {
      filtered = filtered.filter(p => p.paymentMethod === methodFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(p => p.paymentDate && p.paymentDate.startsWith(dateFilter));
    }
    setFilteredPayments(filtered);
  };


  const getStatusBadge = (status) => {
    switch (status) {
      case 'Success':
        return <Badge bg="success">Thành công</Badge>;
      case 'Failed':
        return <Badge bg="danger">Thất bại</Badge>;
      case 'Pending':
        return <Badge bg="warning">Đang xử lý</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-success"></div>
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }


  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="text-center mb-4">Quản lý Thanh toán</h2>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={3} sm={6} className="mb-2">
              <Form.Group controlId="statusFilter">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="Success">Thành công</option>
                  <option value="Failed">Thất bại</option>
                  <option value="Pending">Đang xử lý</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} sm={6} className="mb-2">
              <Form.Group controlId="methodFilter">
                <Form.Label>Phương thức</Form.Label>
                <Form.Select value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
                  <option value="">Tất cả</option>
                  <option value="VNPay">VNPay</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản">Chuyển khoản</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} sm={6} className="mb-2">
              <Form.Group controlId="dateFilter">
                <Form.Label>Ngày thanh toán</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  placeholder="Chọn ngày"
                />
              </Form.Group>
            </Col>
            <Col md={3} sm={6} className="d-flex align-items-end mb-2">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setStatusFilter('');
                  setMethodFilter('');
                  setDateFilter('');
                }}
                className="w-100"
              >
                Đặt lại bộ lọc
              </Button>
            </Col>
          </Row>

          <div className="mb-3">
            <strong>Tổng số thanh toán: </strong>
            <Badge bg="info" className="ms-2">{filteredPayments.length}</Badge>
          </div>

          <Table responsive striped bordered hover className="align-middle text-center">
            <thead className="table-success">
              <tr>
                <th>Mã thanh toán</th>
                <th>Mã Hóa đơn</th>
                <th>Bệnh nhân</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Mã giao dịch</th>
                <th>Trạng thái</th>
                <th>Ngày thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">Không có dữ liệu thanh toán phù hợp.</td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td>#{payment.paymentId}</td>
                    <td>#{payment.invoiceId || 'N/A'}</td>
                    <td>{payment.patientName || 'N/A'}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{formatCurrency(payment.amount)}</td>
                    <td>{payment.transactionCode || 'N/A'}</td>
                    <td>{getStatusBadge(payment.status)}</td>
                    <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleString('vi-VN') : 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination>
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                  <Pagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentList;