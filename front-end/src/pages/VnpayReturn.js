import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VnpayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleVnpayReturn = async () => {
      try {
        // Lấy tất cả query params từ URL
        const params = {};
        for (let [key, value] of searchParams.entries()) {
          params[key] = value;
        }

        // Gọi API backend để verify và update payment
        const response = await axios.get('http://localhost:5000/api/payments/vnpay_return_url', {
          params
        });

        if (response.data.success) {
          setResult({
            success: true,
            message: response.data.message || 'Thanh toán thành công!',
            paymentId: params.vnp_TxnRef,
            amount: params.vnp_Amount / 100, // VNPay trả về *100
            transactionNo: params.vnp_TransactionNo
          });
        } else {
          setResult({
            success: false,
            message: response.data.message || 'Thanh toán thất bại!'
          });
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Có lỗi xảy ra khi kiểm tra thanh toán. Vui lòng liên hệ hỗ trợ.');
      } finally {
        setLoading(false);
      }
    };

    handleVnpayReturn();
  }, [searchParams]);

  const handleBackToInvoices = () => {
    navigate('/invoice/me');
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang kiểm tra thanh toán...</span>
          </Spinner>
          <p className="mt-3">Đang kiểm tra kết quả thanh toán...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="mt-5">
            <Card.Body className="text-center">
              <h2>Kết quả thanh toán</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              {result && (
                <div>
                  {result.success ? (
                    <div>
                      <Alert variant="success">
                        <h4>✅ {result.message}</h4>
                      </Alert>
                      <p><strong>ID Thanh toán:</strong> {result.paymentId}</p>
                      <p><strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(result.amount)}</p>
                      <p><strong>Mã giao dịch:</strong> {result.transactionNo}</p>
                    </div>
                  ) : (
                    <Alert variant="danger">
                      <h4>❌ {result.message}</h4>
                    </Alert>
                  )}
                  <Button variant="primary" onClick={handleBackToInvoices}>
                    Quay lại danh sách hóa đơn
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VnpayReturn;