import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 🌐 Trang chính cho người dùng
import Home from "./pages/Home";

// 👨‍⚕️ Trang cho Doctor
import HomeDoctor from "./pages/HomeDoctor";
// import Profile from "./components/doctor/Profile";
import Appointments from "./components/doctor/Appointments";
import PatientRecords from "./components/doctor/PatientRecords";
import Schedule from "./components/doctor/Schedule";
import Examination from "./components/doctor/Examination";
import Prescription from "./components/doctor/PrescribeMedication";
import DiagnosisPlan from "./components/doctor/DiagnosisPlan";
import TreatmentProgress from "./components/doctor/TreatmentProgress";
import ServicesPage from "./pages/Service/Service";

// 🔐 Trang đăng nhập / đăng ký
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import UserManagement from "./pages/Admin/UserManagement";
import PatientProfile from "./pages/profile/PatientProfile";
import DoctorProfile from "./pages/profile/DoctorProfile";
import AdminProfile from "./pages/profile/AdminProfile";
function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Trang người dùng */}
        <Route path="/" element={<Home />} />

        {/* 👨‍⚕️ Trang dành riêng cho Doctor */}
        <Route path="/doctor/home" element={<HomeDoctor />} />
        {/* <Route path="/doctor/profile" element={<DoctorProfile />} /> */}
        <Route path="/doctor/appointments" element={<Appointments />} />
        <Route path="/doctor/patients" element={<PatientRecords />} />
        <Route path="/doctor/schedule" element={<Schedule />} />
        <Route path="/doctor/examination" element={<Examination />} />
        <Route path="/doctor/prescription" element={<Prescription />} />
        <Route path="/doctor/diagnosis" element={<DiagnosisPlan />} />
        <Route path="/doctor/progress" element={<TreatmentProgress />} />

        {/* Trang Home */}
        <Route path="/service" element={<ServicesPage />} />

        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/doctor/profile" element={<DoctorProfile />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        {/* 🔑 Trang tài khoản */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
