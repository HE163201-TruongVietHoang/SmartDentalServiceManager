const express = require("express");
const { getAllSchedulesController, getScheduleDetailController } = require("../controllers/nurseController");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get("/schedules", authMiddleware, getAllSchedulesController);
router.get("/schedules/:id", authMiddleware, getScheduleDetailController);

module.exports = router;
