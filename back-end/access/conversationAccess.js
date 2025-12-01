const { getPool, sql } = require('../config/db');

// Tạo hoặc lấy cuộc trò chuyện giữa 2 user
async function findOrCreateConversation(participant1Id, participant2Id) {
    const pool = await getPool();
    let result = await pool.request()
        .input('participant1Id', sql.Int, participant1Id)
        .input('participant2Id', sql.Int, participant2Id)
        .query('SELECT * FROM Conversations WHERE participant1Id = @participant1Id AND participant2Id = @participant2Id');
    if (result.recordset.length > 0) return result.recordset[0];
    let insert = await pool.request()
        .input('participant1Id', sql.Int, participant1Id)
        .input('participant2Id', sql.Int, participant2Id)
        .query('INSERT INTO Conversations (participant1Id, participant2Id) OUTPUT INSERTED.* VALUES (@participant1Id, @participant2Id)');
    return insert.recordset[0];
}


// Lấy danh sách cuộc trò chuyện của 1 user
async function getConversationsByUser(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT c.*, u1.fullName as participant1Name, u2.fullName as participant2Name
            FROM Conversations c
            LEFT JOIN Users u1 ON c.participant1Id = u1.userId
            LEFT JOIN Users u2 ON c.participant2Id = u2.userId
            WHERE c.participant1Id = @userId OR c.participant2Id = @userId
            ORDER BY c.lastMessageAt DESC, c.createdAt DESC
        `);
    return result.recordset;
}

// Lấy thông tin cuộc trò chuyện theo conversationId
async function getConversationById(conversationId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('conversationId', sql.Int, conversationId)
        .query('SELECT * FROM Conversations WHERE conversationId = @conversationId');
    return result.recordset[0];
}

// Kiểm tra xem userId đã có cuộc trò chuyện chưa (userId là participant2Id - bệnh nhân)
async function checkConversationForUser(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT participant1Id FROM Conversations WHERE participant2Id = @userId');
    return result.recordset.length > 0 ? result.recordset[0].participant1Id : null; // Trả về participant1Id nếu có, ngược lại null
}

// Chuyển cuộc trò chuyện sang lễ tân khác(participant1Id là lễ tân)
async function transferConversation(conversationId, newReceptionistId) {
    const pool = await getPool();
    await pool.request()
        .input('conversationId', sql.Int, conversationId)
        .input('newReceptionistId', sql.Int, newReceptionistId)
        .query('UPDATE Conversations SET participant1Id = @newReceptionistId WHERE conversationId = @conversationId');
}

module.exports = {
    findOrCreateConversation,
    getConversationsByUser,
    getConversationById,
    checkConversationForUser,
    transferConversation
};
