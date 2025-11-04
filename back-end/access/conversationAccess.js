const db = require('../config/db');

// Tạo hoặc lấy cuộc trò chuyện giữa 2 user
async function findOrCreateConversation(participant1Id, participant2Id) {
    // Đảm bảo participant1Id < participant2Id
    const [p1, p2] = participant1Id < participant2Id ? [participant1Id, participant2Id] : [participant2Id, participant1Id];
    let result = await db.query(
        'SELECT * FROM Conversations WHERE participant1Id = ? AND participant2Id = ?',
        [p1, p2]
    );
    if (result.recordset.length > 0) return result.recordset[0];
    // Nếu chưa có thì tạo mới
    let insert = await db.query(
        'INSERT INTO Conversations (participant1Id, participant2Id) OUTPUT INSERTED.* VALUES (?, ?)',
        [p1, p2]
    );
    return insert.recordset[0];
}


// Lấy danh sách cuộc trò chuyện của 1 user
async function getConversationsByUser(userId) {
    const result = await db.query(
        `SELECT * FROM Conversations WHERE participant1Id = ? OR participant2Id = ? ORDER BY lastMessageAt DESC, createdAt DESC`,
        [userId, userId]
    );
    return result.recordset;
}

// Lấy thông tin cuộc trò chuyện theo conversationId
async function getConversationById(conversationId) {
    const result = await db.query(
        'SELECT * FROM Conversations WHERE conversationId = ?',
        [conversationId]
    );
    return result.recordset[0];
}

module.exports = {
    findOrCreateConversation,
    getConversationsByUser,
    getConversationById
};
