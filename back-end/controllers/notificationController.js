// controllers/notificationController.js
const notificationService = require("../access/notificationAccess");

async function getNotifications(req, res) {
  try {
    const notifications = await notificationService.getNotificationsByUser(req.user.userId);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    const notifId = req.params.id;
    const userId = req.user.userId; // từ auth middleware

    const result  = await notificationService.markAsRead(notifId, userId);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }


    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  getNotifications,
  markAllRead
};
