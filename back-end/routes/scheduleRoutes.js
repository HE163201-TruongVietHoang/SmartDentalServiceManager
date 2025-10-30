const express = require("express");
const {
    createScheduleRequestController,
    getDoctorSchedulesController,
    checkAvailabilityController,
    listScheduleRequestsController,
    getScheduleRequestDetailsController,
    approveScheduleRequestController,
    rejectScheduleRequestController,
    getDoctorScheduleDetail
} = require("../controllers/scheduleController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/doctor", authMiddleware,authorizeRoles("Doctor"), getDoctorSchedulesController);
router.post("/doctor/create-request", authMiddleware, authorizeRoles("Doctor"), createScheduleRequestController);
router.post("/doctor/check-availability", checkAvailabilityController);
router.get("/doctor/:scheduleId", authMiddleware,authorizeRoles("Doctor"), getDoctorScheduleDetail);
// ManageClinic routes to manage requests
router.get('/requests', authMiddleware, authorizeRoles('ManageClinic'),listScheduleRequestsController);
router.get('/requests/:id', authMiddleware, authorizeRoles('ManageClinic'),getScheduleRequestDetailsController);
router.post('/requests/:id/approve', authMiddleware, authorizeRoles('ManageClinic'), approveScheduleRequestController);
router.post('/requests/:id/reject', authMiddleware, authorizeRoles('ManageClinic'), rejectScheduleRequestController);

module.exports = router;
