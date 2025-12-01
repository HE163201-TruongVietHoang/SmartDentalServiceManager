// nurseShiftsController.js
const { fetchAllNurseSchedules, fetchNurseScheduleDetail } = require("./../services/nurseService");

async function getAllSchedulesController(req, res) {
  try {
    const nurseId = req.user?.userId;
    if (!nurseId) return res.status(401).json({ message: "Vui lòng đăng nhập." });

    const schedules = await fetchAllNurseSchedules(nurseId);
    res.status(200).json({ success: true, schedules });
  } catch (err) {
    console.error("Lỗi lấy lịch y tá:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

async function getScheduleDetailController(req, res) {
  try {
    const shiftId = parseInt(req.params.id, 10);
    if (!shiftId) return res.status(400).json({ message: "shiftId không hợp lệ." });

    const detail = await fetchNurseScheduleDetail(shiftId);
    res.status(200).json({ success: true, detail });
  } catch (err) {
    console.error("Lỗi lấy chi tiết lịch y tá:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
}

module.exports = { getAllSchedulesController, getScheduleDetailController };
