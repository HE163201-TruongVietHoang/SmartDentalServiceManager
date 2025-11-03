const db = require('../config/db');

// Thêm tin nhắn mới
async function addMessage(conversationId, senderId, content, messageType = 'text') {
    const result = await db.query(
        `INSERT INTO Messages (conversationId, senderId, content, messageType) OUTPUT INSERTED.* VALUES (?, ?, ?, ?)`,
        [conversationId, senderId, content, messageType]
    );
    return result.recordset[0];
}

// Lấy tin nhắn theo conversationId
async function getMessagesByConversation(conversationId, limit = 50, offset = 0) {
    const result = await db.query(
        `SELECT * FROM Messages WHERE conversationId = ? ORDER BY sentAt DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
        [conversationId, offset, limit]
    );
    return result.recordset;
}

// Đánh dấu tin nhắn đã đọc
async function markMessagesAsRead(conversationId, userId) {
    await db.query(
        `UPDATE Messages SET isRead = 1 WHERE conversationId = ? AND senderId <> ? AND isRead = 0`,
        [conversationId, userId]
    );
}

module.exports = {
    addMessage,
    getMessagesByConversation,
    markMessagesAsRead
};
