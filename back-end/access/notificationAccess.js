// utils/notification.js

const { sql, getPool } = require("../config/db");
const { getIO } = require("../utils/socket");

async function sendNotification({ receiverId, senderId, title, message, type }) {
    const pool = await getPool();
    const io = getIO();

    await pool.request()
        .input("receiverId", receiverId)
        .input("senderId", senderId)
        .input("title", title)
        .input("message", message)
        .input("type", type)
        .query(`
      INSERT INTO Notifications (receiverId, senderId, title, message, type)
      VALUES (@receiverId, @senderId, @title, @message, @type)
    `);

    io.to(String(receiverId)).emit("notification", {
        receiverId,
        senderId,
        title,
        message,
        type,
        createdAt: new Date()
    });
}

async function sendNotificationToMany(notifyUsers) {
    const pool = await getPool();
    const io = getIO();

    for (const item of notifyUsers) {
        if (!item.receiverId) continue;
        await pool.request()
            .input("receiverId", item.receiverId)
            .input("senderId", item.senderId || null)
            .input("title", item.title)
            .input("message", item.message)
            .input("type", item.type)
            .query(`
        INSERT INTO Notifications (receiverId, senderId, title, message, type)
        VALUES (@receiverId, @senderId, @title, @message, @type)
      `);

        // Emit realtime
        io.to(String(item.receiverId)).emit("notification", {
            receiverId: item.receiverId,
            senderId: item.senderId || null,
            title: item.title,
            message: item.message,
            type: item.type,
            createdAt: new Date()
        });
    }
}
async function getNotificationsByUser(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input("userId", sql.Int, userId)
        .query(`
      SELECT id, senderId, title, message, type, isRead, createdAt
      FROM Notifications
      WHERE receiverId = @userId
      ORDER BY createdAt DESC
    `);
    return result.recordset;
}

async function markAsRead(notifId, userId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("notifId", sql.Int, notifId)
    .input("userId", sql.Int, userId)
    .query(`
      UPDATE Notifications
      SET isRead = 1
      WHERE id = @notifId AND receiverId = @userId
    `);
  return result;
}
module.exports = {
    sendNotification,
    sendNotificationToMany,
    getNotificationsByUser,
    markAsRead
};
