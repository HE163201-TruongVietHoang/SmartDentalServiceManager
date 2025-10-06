import React from "react";
import Header from "../components/home/Header/Header";
import Footer from "../components/home/Footer/Footer";
import Sale from "../components/home/Sale/Sale";
import Banner from "../components/Banner/Banner"; // Thêm banner

function Home() {
  return (
    <div>
      <Header />
      <Banner />  {/* Hiển thị banner ngay sau header */}

      <main style={{ padding: "20px" }}>
        <h2>Chào mừng bạn đến với phòng khám nha khoa</h2>
        <p>
          Chúng tôi mang đến dịch vụ chăm sóc răng miệng chất lượng cao, hiện đại và an toàn.
        </p>

        <Sale />
      </main>

      <Footer />
    </div>
  );
}

export default Home;
