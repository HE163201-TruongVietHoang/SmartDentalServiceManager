require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const roleRoutes = require("./routes/roleRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const serviceStaffRoutes = require("./routes/serviceStaffRoutes");
const materialRoutes = require("./routes/materialRoutes");

const { getPool } = require("./config/db");
const app = express();

app.use(cors());
app.use(express.json());

// Routes

app.use("/api/auth", authRoutes);

app.use("/api/materials", materialRoutes);

app.use("/api/rating", ratingRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/services", serviceStaffRoutes);

getPool();
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
