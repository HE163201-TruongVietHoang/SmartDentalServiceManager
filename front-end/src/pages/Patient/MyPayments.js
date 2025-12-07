import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Alert,
  Badge,
  Form,
  Pagination,
} from "react-bootstrap";
import { getPaymentsByUserId } from "../../api/api";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";

const MyPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
    // eslint-disable-next-line
  }, [payments, statusFilter, methodFilter, dateFilter]);

  const loadPayments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("Vui lòng đăng nhập");
        setLoading(false);
        return;
      }
      const response = await getPaymentsByUserId(user.userId);
      setPayments(response.data || response);
    } catch (err) {
      setError("Không thể tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];
    if (statusFilter) {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }
    if (methodFilter) {
      filtered = filtered.filter((p) => p.paymentMethod === methodFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(
        (p) => p.paymentDate && p.paymentDate.startsWith(dateFilter)
      );
    }
    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return (
          <Badge
            bg="success"
            style={{ fontSize: 14, padding: "6px 14px", borderRadius: 12 }}
          >
            Thành công
          </Badge>
        );
      case "Failed":
        return (
          <Badge
            bg="danger"
            style={{ fontSize: 14, padding: "6px 14px", borderRadius: 12 }}
          >
            Thất bại
          </Badge>
        );
      case "Pending":
        return (
          <Badge
            bg="warning"
            text="dark"
            style={{ fontSize: 14, padding: "6px 14px", borderRadius: 12 }}
          >
            Đang xử lý
          </Badge>
        );
      default:
        return (
          <Badge
            bg="secondary"
            style={{ fontSize: 14, padding: "6px 14px", borderRadius: 12 }}
          >
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <div className="text-center">
            <div className="spinner-border text-success"></div>
            <p className="mt-3">Đang tải dữ liệu...</p>
          </div>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <div>
      <Header />
      <Container className="pt-3 pb-4" style={{ maxWidth: 1000 }}>
        <Row className="justify-content-center mb-4">
          <Col md={8} className="text-center">
            <h2
              className="fw-bold mb-2"
              style={{ color: "#2ECCB6", letterSpacing: 1 }}
            >
              Lịch sử Thanh toán
            </h2>
            <div className="mb-3" style={{ color: "#888" }}>
              Xem lại các giao dịch thanh toán của bạn tại Smart Dental Clinic
            </div>
          </Col>
        </Row>

        {/* Filter UI */}
        <Row className="mb-3">
          <Col md={3} sm={6} className="mb-2">
            <Form.Group controlId="statusFilter">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
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
              <Form.Select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
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
                onChange={(e) => setDateFilter(e.target.value)}
                placeholder="Chọn ngày"
              />
            </Form.Group>
          </Col>
          <Col md={3} sm={6} className="d-flex align-items-end mb-2">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => {
                setStatusFilter("");
                setMethodFilter("");
                setDateFilter("");
              }}
            >
              Đặt lại bộ lọc
            </button>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}

        <Card
          className="shadow-sm"
          style={{ borderRadius: 18, border: "1px solid #e0f7f2" }}
        >
          <Card.Body style={{ padding: 0 }}>
            <Table
              responsive
              hover
              borderless
              className="mb-0 align-middle"
              style={{ borderRadius: 18, overflow: "hidden" }}
            >
              <thead style={{ background: "#f7fdfa" }}>
                <tr style={{ color: "#2ECCB6", fontWeight: 600, fontSize: 16 }}>
                  <th style={{ minWidth: 120 }}>Mã thanh toán</th>
                  <th style={{ minWidth: 120 }}>Mã hóa đơn</th>
                  <th style={{ minWidth: 120 }}>Phương thức</th>
                  <th style={{ minWidth: 120 }}>Số tiền</th>
                  <th style={{ minWidth: 120 }}>Mã giao dịch</th>
                  <th style={{ minWidth: 120 }}>Trạng thái</th>
                  <th style={{ minWidth: 160 }}>Ngày thanh toán</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      Chưa có giao dịch nào.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      style={{ transition: "background 0.2s" }}
                    >
                      <td className="fw-bold">#{payment.paymentId}</td>
                      <td>#{payment.invoiceId || "N/A"}</td>
                      <td>{payment.paymentMethod}</td>
                      <td className="fw-bold" style={{ color: "#2ECCB6" }}>
                        {formatCurrency(payment.amount)}
                      </td>
                      <td>{payment.transactionCode || "N/A"}</td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    )
                  )}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
      <Footer />
    </div>
  );
};

export default MyPayments;
