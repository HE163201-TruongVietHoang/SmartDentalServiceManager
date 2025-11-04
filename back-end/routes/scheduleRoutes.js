const express = require("express");
const {
    createScheduleRequestController,
    getDoctorSchedulesController,
    checkAvailabilityController,
    listScheduleRequestsController,
    getScheduleRequestDetailsController,
    approveScheduleRequestController,
    rejectScheduleRequestController,
    getDoctorScheduleDetail,
    cancelScheduleRequest
} = require("../controllers/scheduleController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");
const router = express.Router();
router.post("/doctor/check-availability", checkAvailabilityController);
router.get("/doctor", authMiddleware,authorizeRoles("Doctor"), getDoctorSchedulesController);
router.post("/doctor/create-request", authMiddleware, authorizeRoles("Doctor"), createScheduleRequestController);

router.get("/doctor/:scheduleId", authMiddleware,authorizeRoles("Doctor"), getDoctorScheduleDetail);
router.delete("/doctor/cancel-request/:id", authMiddleware,authorizeRoles("Doctor"), cancelScheduleRequest);
// ManageClinic routes to manage requests
router.get('/requests', authMiddleware, authorizeRoles('ManageClinic'),listScheduleRequestsController);
router.get('/requests/:id', authMiddleware, authorizeRoles('ManageClinic'),getScheduleRequestDetailsController);
router.post('/requests/:id/approve', authMiddleware, authorizeRoles('ManageClinic'), approveScheduleRequestController);
router.post('/requests/:id/reject', authMiddleware, authorizeRoles('ManageClinic'), rejectScheduleRequestController);

module.exports = router;
