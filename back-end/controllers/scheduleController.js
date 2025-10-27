const {
  createMultipleSchedules,
  checkAvailability,
  listScheduleRequests,
  getScheduleRequestDetails,
  adminApproveRequest,
  adminRejectRequest,
  getSchedulesByDoctor,
  getDoctorScheduleDetailService
} = require("../services/scheduleService");

async function createScheduleRequestController(req, res) {
  try {
    const doctorId = req.user?.userId;
    const { note, schedules } = req.body;

    if (!doctorId) {
      return res.status(401).json({ message: "Vui lòng đăng nhập." });
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: "Danh sách lịch không hợp lệ." });
    }

    const result = await createMultipleSchedules(doctorId, note, schedules);

    if (result.duplicates?.length > 0) {
      return res.status(409).json({
        message: "Bạn đã có lịch trùng với lịch trước đó hoặc đã được duyệt.",
        success: false,
        duplicates: result.duplicates,
      });
    }

    if (result.unavailable?.length > 0) {
      return res.status(207).json({
        message: "Một số khung giờ không còn phòng trống, vui lòng chọn lại.",
        success: false,
        unavailable: result.unavailable,
      });
    }

    res.status(201).json({
      success: true,
      message: "Đã gửi yêu cầu tạo lịch cho admin.",
      requestId: result.requestId,
      details: result.results,
    });
  } catch (err) {
    console.error(" Lỗi tạo lịch:", err);
    res.status(500).json({ message: "Lỗi server khi tạo lịch làm việc.", error: err.message });
  }
}


async function getDoctorSchedulesController(req, res) {
  try {
    const doctorId = req.user?.userId;
    if (!doctorId) return res.status(401).json({ message: "Vui lòng đăng nhập." });

    const schedules = await getDoctorSchedules(doctorId);
    res.status(200).json({ success: true, schedules });
  } catch (err) {
    console.error(" Error getDoctorSchedules:", err);
    res.status(500).json({ message: "Lỗi khi lấy lịch làm việc.", error: err.message });
  }
}

async function checkAvailabilityController(req, res) {
  try {
    const { schedules } = req.body;
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ message: "Danh sách lịch không hợp lệ." });
    }

    const result = await checkAvailability(schedules);
    res.status(200).json({ message: "Kết quả kiểm tra phòng trống", result });
  } catch (err) {
    console.error(" Lỗi kiểm tra availability:", err);
    res.status(500).json({ message: "Lỗi server khi kiểm tra phòng trống.", error: err.message });
  }
}

async function listScheduleRequestsController(req, res)  {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await listScheduleRequests(page, limit);

    res.json({
      success: true,
      ...result, // { meta, data }
    });
  } catch (error) {
    console.error("Error listing schedule requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách yêu cầu.",
    });
  }
};

async function getScheduleRequestDetailsController(req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (!requestId) return res.status(400).json({ message: "requestId không hợp lệ" });

    const details = await getScheduleRequestDetails(requestId);
    res.status(200).json({ success: true, details });
  } catch (err) {
    console.error(" Lỗi lấy chi tiết request:", err);
    res.status(500).json({ message: "Lỗi server khi lấy chi tiết request.", error: err.message });
  }
}

async function approveScheduleRequestController(req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const adminId = req.user?.userId;

    if (!requestId) return res.status(400).json({ message: "requestId không hợp lệ" });

    const result = await adminApproveRequest(requestId, adminId);
    res.status(200).json(result);
  } catch (err) {
    console.error(" Lỗi khi duyệt request:", err);
    res.status(500).json({ message: "Lỗi server khi duyệt request.", error: err.message });
  }
}

async function rejectScheduleRequestController(req, res) {
  try {
    const requestId = parseInt(req.params.id, 10);
    const adminId = req.user?.userId;
    const { reason } = req.body;

    if (!requestId) return res.status(400).json({ message: "requestId không hợp lệ" });

    await adminRejectRequest(requestId, adminId, reason);
    res.status(200).json({ success: true, message: "Đã từ chối request." });
  } catch (err) {
    console.error(" Lỗi khi từ chối request:", err);
    res.status(500).json({ message: "Lỗi server khi từ chối request.", error: err.message });
  }
}

async function getDoctorSchedulesController(req, res) {
  try {
    const doctorId = req.user.userId; 
    const schedules = await getSchedulesByDoctor(doctorId);
    res.status(200).json(schedules);
  } catch (err) {
    console.error("Error fetching doctor schedules:", err);
    res.status(500).json({ message: "Lỗi khi lấy lịch làm việc của bác sĩ" });
  }
}
async function getDoctorScheduleDetail(req, res) {
  try {
    const doctorId = req.user.userId; 
    const { scheduleId } = req.params;

    const schedule = await getDoctorScheduleDetailService(scheduleId, doctorId);

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error(" Lỗi khi lấy chi tiết lịch bác sĩ:", error.message);
    res.status(404).json({
      success: false,
      message: "Không tìm thấy lịch hoặc bạn không có quyền truy cập.",
    });
  }
}
module.exports = {
  createScheduleRequestController,
  getDoctorSchedulesController,
  checkAvailabilityController,
  listScheduleRequestsController,
  getScheduleRequestDetailsController,
  approveScheduleRequestController,
  rejectScheduleRequestController,
  getDoctorSchedulesController,
  getDoctorScheduleDetail
};
