import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";

function PatientLayout() {
  const [showPendingPopup, setShowPendingPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (user && token) {
      fetch(`http://localhost:5000/api/invoices/check-pending/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.hasPending) setShowPendingPopup(true);
        });
    }
  }, []);

  return (
    <>
      {showPendingPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            padding: '32px 28px 24px 28px',
            minWidth: 320,
            maxWidth: '90vw',
            textAlign: 'center',
            position: 'relative',
            animation: 'popup-fade-in 0.2s',
          }}>
            <h3 style={{margin: 0, color: '#1976d2', fontWeight: 600, fontSize: 20}}>Thông báo thanh toán</h3>
            <p style={{margin: '18px 0 28px 0', color: '#333', fontSize: 16}}>
              Bạn có hóa đơn chưa thanh toán.<br/>Chuyển đến trang thanh toán?
            </p>
            <div style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
              <button
                style={{
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.08)'
                }}
                onClick={() => navigate("/invoice-pending/me")}
              >
                Thanh toán ngay
              </button>
              <button
                style={{
                  background: '#f5f5f5',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
                onClick={() => setShowPendingPopup(false)}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
      <Outlet />
    </>
  );
}

export default PatientLayout;