import React from "react";

import ClinicMaterial from "../../components/clinicManager/ClinicMaterial";
import Header from "../../components/home/Header/Header";
import Footer from "../../components/home/Footer/Footer";
function AdminDashboardPage() {
  return (
    <div>
      <Header />
      <ClinicMaterial />
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
