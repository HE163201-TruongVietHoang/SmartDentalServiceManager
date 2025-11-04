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
import ScheduleRequest from "./components/doctor/ScheduleRequest";
import ServicesPage from "./pages/Service/Service";
import ResetPassword from "./pages/Account/ResetPassword";

import ScheduleRequests from "./pages/Manageclinic/ScheduleRequests";
import ScheduleRequestDetail from "./pages/Manageclinic/ScheduleRequestDetail";
import ClinicManagerScheduleRequests from "./pages/ClinicManager/DoctorScheduleManager";

// 🔐 Trang đăng nhập / đăng ký
import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import VerifyOtp from "./pages/Account/VerifyOTP";
import UserManagement from "./pages/Admin/UserManagement";
import PatientProfile from "./components/patient/PatientProfile";
import DoctorProfile from "./components/doctor/DoctorProfile";
import AdminProfile from "./components/admin/AdminProfile";
import ChangePassword from "./pages/Account/ChangePassword";
import DoctorRatingTestPage from "./pages/Test/DoctorRatingTestPage";
import ServiceRatingTestPage from "./pages/Test/ServiceRatingTestPage";
import StaffLayout from "./pages/ClinicManager/ClinicManagerLayout";
import Service from "./pages/ClinicManager/Services";
import NurseMaterialPage from "./pages/Nurse/NurseMaterialPage";

import MaterialClinicPage from "./pages/ClinicManager/MaterialClinicPage";
import ChatPage from "./pages/ChatPage";
function App() {
  return (
    <Router>
      <Routes>
        {/* 🌍 Trang người dùng */}
        <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatPage />} />
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
        <Route path="/doctor/create-schedule" element={<ScheduleRequest />} />
        <Route
          path="/test/doctor-rating/:doctorId"
          element={<DoctorRatingTestPage />}
        />
        <Route
          path="/test/service-rating/:serviceId"
          element={<ServiceRatingTestPage />}
        />

        <Route path="/schedule-requests" element={<ScheduleRequests />} />
        <Route
          path="/schedule-requests/:id"
          element={<ScheduleRequestDetail />}
        />
        {/* Trang Home */}
        <Route path="/service" element={<ServicesPage />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/profile" element={<DoctorProfile />} />
        <Route path="/profile" element={<AdminProfile />} />
        {/* 🔑 Trang tài khoản */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/users" element={<UserManagement />} />

        {/*clinic Manager*/}
        <Route path="/nurse/materials" element={<NurseMaterialPage />} />

        {/* Clinic Manager */}
        <Route
          path="/clinicmanager/services"
          element={
            <StaffLayout>
              <Service />
            </StaffLayout>
          }
        />
        <Route
          path="/clinicmanager/material"
          element={
            <StaffLayout>
              <MaterialClinicPage />
            </StaffLayout>
          }
        />
        <Route
          path="/clinicmanager/doctorschedule"
          element={
            <StaffLayout>
              <ClinicManagerScheduleRequests />
            </StaffLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
