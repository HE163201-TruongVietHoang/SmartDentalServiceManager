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

import ProfilePage from "./pages/profile/ProfileView";
import ServicesPage from "./pages/Service/Service";

import ClinicManagerScheduleRequests from "./pages/ClinicManager/DoctorScheduleManager";

import SignIn from "./pages/Account/SignIn";
import SignUp from "./pages/Account/SignUp";
import VerifyOtp from "./pages/Account/VerifyOTP";
import ResetPassword from "./pages/Account/ResetPassword";
import ChangePassword from "./pages/Account/ChangePassword";
import UserManagement from "./pages/Admin/UserManagement";

import DoctorRatingTestPage from "./pages/Test/DoctorRatingTestPage";
import ServiceRatingTestPage from "./pages/Test/ServiceRatingTestPage";
import NurseMaterialPage from "./pages/Nurse/NurseMaterialPage";
import AppointmentPage from "./pages/AppointmentPage";
import MyAppointmentsPage from "./pages/Patient/MyAppointment";
import AppointmentReview from "./pages/Patient/AppointmentReview";

import MaterialClinicPage from "./pages/ClinicManager/MaterialClinicPage";
import Service from "./pages/ClinicManager/Services";
import ServiceDetail from "./pages/Service/ServiceDeatil";
import ClinicManagerProfile from "./pages/ClinicManager/ClinicManagerProfile";
import ClinicManagerLayout from "./pages/ClinicManager/ClinicManagerLayout";

import DoctorLayout from "./pages/Doctor/DoctorLayout";
import DoctorScheduleCalendar from "./pages/Doctor/DoctorSchedule";
import DoctorCreateSchedule from "./pages/Doctor/DotorCreateSchedule";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorDiagnosis from "./pages/Doctor/DoctorDiagnosis";
import DoctorDiagnosisHistory from "./pages/Doctor/DoctorDiagnosisHistory";
import DoctorMedicinePage from "./pages/Doctor/DoctorMedicinePage";

import PatientAppointmentsPage from "./pages/Receptionist/PatientAppointmentsPage";
import ReceptionistLayout from "./pages/Receptionist/ReceptionistLayout";
import ReceptionistProfile from "./pages/Receptionist/ReceptionistProfile";
import PatientListPage from "./pages/Receptionist/PatientListPage";
import PatientDetailPage from "./pages/Receptionist/PatientDetailPage";
import CreateAppointmentReceptionist from "./pages/Receptionist/CreateAppointmentReceptionist";

import NurseLayout from "./pages/Nurse/NurseLayout";
import NurseProfile from "./pages/Nurse/NurseProfile";
import Promotion from "./pages/ClinicManager/Promotion";
import Invoice from "./pages/ClinicManager/Invoice";
import VnpayReturn from "./pages/VnpayReturn";
import DoctorPrescription from "./components/doctor/DoctorPrescription";
import ReceptionistInvoiceListPage from "./pages/Receptionist/InvoiceListPage";
import ReceptionistInvoiceDetailPage from "./pages/Receptionist/InvoiceDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/service" element={<ServicesPage />} />
        <Route path="/service/:id" element={<ServiceDetail />} />

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

        <Route
          path="/test/service-rating/:serviceId"
          element={<ServiceRatingTestPage />}
        />

        {/* <Route path="/schedule-requests" element={<ScheduleRequests />} />
        <Route
          path="/schedule-requests/:id"
          element={<ScheduleRequestDetail />}
        /> */}

        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path="/appointment/me" element={<MyAppointmentsPage />} />
        <Route
          path="/appointment/:appointmentId/review"
          element={<AppointmentReview />}
        />
        {/*clinic Manager*/}

        <Route
          path="/test/doctor-rating/:doctorId"
          element={<DoctorRatingTestPage />}
        />
        <Route
          path="/test/service-rating/:serviceId"
          element={<ServiceRatingTestPage />}
        />

        {/* Trang cho Clinic Manager */}
        <Route
          path="/clinicmanager/services"
          element={
            <ClinicManagerLayout>
              <Service />
            </ClinicManagerLayout>
          }
        />
        <Route
          path="/clinicmanager/material"
          element={
            <ClinicManagerLayout>
              <MaterialClinicPage />
            </ClinicManagerLayout>
          }
        />
        <Route
          path="/clinicmanager/doctorschedule"
          element={
            <ClinicManagerLayout>
              <ClinicManagerScheduleRequests />
            </ClinicManagerLayout>
          }
        />
        <Route
          path="/clinicmanager/profile"
          element={
            <ClinicManagerLayout>
              <ClinicManagerProfile />
            </ClinicManagerLayout>
          }
        />
        <Route
          path="/clinicmanager/promotion"
          element={
            <ClinicManagerLayout>
              <Promotion />
            </ClinicManagerLayout>
          }
        />
        <Route
          path="/clinicmanager/invoice"
          element={
            <ClinicManagerLayout>
              <Invoice />
            </ClinicManagerLayout>
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
          path="/doctor/profile"
          element={
            <DoctorLayout>
              <DoctorProfile />
            </DoctorLayout>
          }
        />
        <Route
          path="/doctor/diagnosis"
          element={
            <DoctorLayout>
              <DoctorDiagnosis />
            </DoctorLayout>
          }
        />
        <Route
          path="/doctor/diagnosis/history"
          element={
            <DoctorLayout>
              <DoctorDiagnosisHistory />
            </DoctorLayout>
          }
        />

        <Route
          path="/doctor/prescription"
          element={
            <DoctorLayout>
              <DoctorPrescription />
            </DoctorLayout>
          }
        />
        <Route
          path="/doctor/medicines"
          element={
            <DoctorLayout>
              <DoctorMedicinePage />
            </DoctorLayout>
          }
        />

        {/* Trang cho Nurse */}
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
        <Route path="/nurse/materials" element={<NurseMaterialPage />} />

        {/* Receptionist */}
        <Route
          path="/receptionist/patient/appointment"
          element={
            <ReceptionistLayout>
              <PatientAppointmentsPage />
            </ReceptionistLayout>
          }
        />
        <Route
          path="/receptionist/profile"
          element={
            <ReceptionistLayout>
              <ReceptionistProfile />
            </ReceptionistLayout>
          }
        />
        <Route
          path="/receptionist/patients"
          element={
            <ReceptionistLayout>
              <PatientListPage />
            </ReceptionistLayout>
          }
        />
        <Route
          path="/receptionist/patients/:userId"
          element={
            <ReceptionistLayout>
              <PatientDetailPage />
            </ReceptionistLayout>
          }
        />
        <Route
          path="/receptionist/appointment/create"
          element={
            <ReceptionistLayout>
              <CreateAppointmentReceptionist />
            </ReceptionistLayout>
          }
        />
        <Route path="/vnpay_return_url" element={<VnpayReturn />} />

        <Route
          path="/receptionist/invoices"
          element={
            <ReceptionistLayout>
              <ReceptionistInvoiceListPage />
            </ReceptionistLayout>
          }
        />

        <Route
          path="/receptionist/invoices/:invoiceId"
          element={
            <ReceptionistLayout>
              <ReceptionistInvoiceDetailPage />
            </ReceptionistLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
