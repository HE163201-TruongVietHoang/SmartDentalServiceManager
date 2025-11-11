import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ChatPage from "./pages/ChatPage";

import HomeDoctor from "./pages/HomeDoctor";
import Appointments from "./components/doctor/Appointments";
import PatientRecords from "./components/doctor/PatientRecords";
import Schedule from "./components/doctor/Schedule";
import Examination from "./components/doctor/Examination";
import Prescription from "./components/doctor/PrescribeMedication";
import DiagnosisPlan from "./components/doctor/DiagnosisPlan";
import TreatmentProgress from "./components/doctor/TreatmentProgress";
import ScheduleRequest from "./components/doctor/ScheduleRequest";

import ProfilePage from "./pages/Profile/ProfileView";
import ServicesPage from "./pages/Service/Service";

import ScheduleRequests from "./pages/Manageclinic/ScheduleRequests";
import ScheduleRequestDetail from "./pages/Manageclinic/ScheduleRequestDetail";

import ClinicManagerScheduleRequests from "./pages/ClinicManager/DoctorScheduleManager";

import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import VerifyOtp from "./pages/Account/VerifyOTP";
import ResetPassword from "./pages/Account/ResetPassword";
import ChangePassword from "./pages/Account/ChangePassword";
import UserManagement from "./pages/Admin/UserManagement";

import DoctorRatingTestPage from "./pages/Test/DoctorRatingTestPage";
import ServiceRatingTestPage from "./pages/Test/ServiceRatingTestPage";
import StaffLayout from "./pages/ClinicManager/ClinicManagerLayout";
import Service from "./pages/ClinicManager/Services";
import NurseMaterialPage from "./pages/Nurse/NurseMaterialPage";
import AppointmentPage from "./pages/AppointmentPage";
import MyAppointmentsPage from "./pages/Patient/MyAppointment";
import MaterialClinicPage from "./pages/ClinicManager/MaterialClinicPage";
import DoctorLayout from "./pages/Doctor/DoctorLayout";
import DoctorScheduleCalendar from "./pages/Doctor/DoctorSchedule";
import DoctorCreateSchedule from "./pages/Doctor/DotorCreateSchedule";

import DoctorDiagnosis from "./components/doctor/DoctorDiagnosis";


import NurseLayout from "./pages/Nurse/NurseLayout";
import NurseProfile from "./pages/Nurse/NurseProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/service" element={<ServicesPage />} />

        <Route path="/doctor/home" element={<HomeDoctor />} />
        {/* <Route path="/doctor/profile" element={<DoctorProfile />} /> */}
        {/* <Route path="/doctor/appointments" element={<Appointments />} />
        <Route path="/doctor/patients" element={<PatientRecords />} />
        <Route path="/doctor/schedule" element={<Schedule />} />
        <Route path="/doctor/examination" element={<Examination />} />
        <Route path="/doctor/prescription" element={<Prescription />} />
        <Route path="/doctor/diagnosis" element={<DiagnosisPlan />} />
        <Route path="/doctor/progress" element={<TreatmentProgress />} />
        <Route path="/doctor/create-schedule" element={<ScheduleRequest />} /> */}
        <Route
          path="/test/doctor-rating/:doctorId"
          element={<DoctorRatingTestPage />}
        />

        <Route path="/doctor/diagnosis" element={<DoctorDiagnosis />} />

        <Route
          path="/test/service-rating/:serviceId"
          element={<ServiceRatingTestPage />}
        />

        <Route path="/schedule-requests" element={<ScheduleRequests />} />
        <Route
          path="/schedule-requests/:id"
          element={<ScheduleRequestDetail />}
        />

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/appointment/me" element={<MyAppointmentsPage />} />
        {/*clinic Manager*/}
        <Route path="/nurse/materials" element={<NurseMaterialPage />} />

        <Route
          path="/test/doctor-rating/:doctorId"
          element={<DoctorRatingTestPage />}
        />
        <Route
          path="/test/service-rating/:serviceId"
          element={<ServiceRatingTestPage />}
        />

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

        {/* Trang cho Doctor */}
        <Route
          path="/doctor/schedule"
          element={
            <DoctorLayout>
              <DoctorScheduleCalendar />
            </DoctorLayout>
          }
        />
        <Route
          path="/doctor/create/schedule"
          element={
            <DoctorLayout>
              <DoctorCreateSchedule />
            </DoctorLayout>
          }
        />

        <Route
          path="/nurse/profile"
          element={
            <NurseLayout>
              <NurseProfile />
            </NurseLayout>
          }
        />
        <Route
          path="/nurse/materials"
          element={
            <NurseLayout>
              <NurseMaterialPage />
            </NurseLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
