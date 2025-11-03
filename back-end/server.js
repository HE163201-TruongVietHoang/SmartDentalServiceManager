require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const roleRoutes = require("./routes/roleRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const serviceStaffRoutes = require("./routes/serviceStaffRoutes");
const materialRoutes = require("./routes/materialRoutes");


const { getPool } = require("./config/db");
const app = express();
const http = require('http');
const { initSocket } = require('./utils/socket');

app.use(cors());
app.use(express.json());

// Routes


app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/materials", materialRoutes);

app.use("/api/rating", ratingRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/services", serviceStaffRoutes);

getPool();

// Start server with Socket.IO
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
