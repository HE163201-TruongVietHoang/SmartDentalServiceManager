import React from "react";
import { useParams } from "react-router-dom";
import ServiceRating from "../../components/service/ServiceRating";

export default function ServiceRatingTestPage() {
  const { serviceId } = useParams();
  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Test Đánh giá dịch vụ</h2>
      <ServiceRating serviceId={parseInt(serviceId)} />
    </div>
  );
}