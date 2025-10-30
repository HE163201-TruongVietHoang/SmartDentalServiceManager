import React from "react";
import { useParams } from "react-router-dom";
import DoctorRating from "../../components/doctor/DoctorRating";

export default function DoctorRatingTestPage() {
  const { doctorId } = useParams();
  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Test Đánh giá bác sĩ</h2>
      <DoctorRating doctorId={parseInt(doctorId)} />
    </div>
  );
}