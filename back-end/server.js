require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const cron = require("node-cron");
const { appointmentService } = require("./services/appointmentService");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const roleRoutes = require("./routes/roleRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const serviceStaffRoutes = require("./routes/serviceStaffRoutes");
const materialRoutes = require("./routes/materialRoutes");
const slotRoutes = require("./routes/slotRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorDiagnosisRoutes = require("./routes/doctorDiagnosisRoutes");
const { getPool } = require("./config/db");
const promotionRoutes = require('./routes/promotionRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const http = require("http");
const { initSocket } = require("./utils/socket");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/materials", materialRoutes);
app.use("/api/auth/doctors", doctorRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/services", serviceStaffRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/diagnoses", doctorDiagnosisRoutes);

cron.schedule("*/30 * * * *", async () => {
  console.log("Running auto-cancel job...");
  await appointmentService.autoCancelNoShow(initSocket);
});
getPool();

// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
