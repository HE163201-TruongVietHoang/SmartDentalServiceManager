const { sql, getPool } = require("../config/db");

async function findByIdAndUpdate(orderId, updateData, options = {}) {
  const pool = await getPool();
  const setClause = Object.keys(updateData).map(key => {
    if (key === 'paymentDetails') {
      return `paymentDetails = @paymentDetails`;
    }
    return `${key} = @${key}`;
  }).join(', ');
  const request = pool.request()
    .input("orderId", sql.Int, orderId);

  Object.keys(updateData).forEach(key => {
    if (key === 'paymentDetails') {
      request.input(key, sql.NVarChar, JSON.stringify(updateData[key]));
    } else {
      request.input(key, sql.NVarChar, updateData[key]);
    }
  });

  const result = await request.query(`
    UPDATE Orders
    SET ${setClause}, updatedAt = GETDATE()
    WHERE orderId = @orderId;
    SELECT * FROM Orders WHERE orderId = @orderId;
  `);
  const updatedOrder = result.recordset[0];
  if (updatedOrder && updatedOrder.paymentDetails) {
    updatedOrder.paymentDetails = JSON.parse(updatedOrder.paymentDetails);
  }
  return updatedOrder;
}

async function findById(orderId) {
  const pool = await getPool();
  const result = await pool.request()
    .input("orderId", sql.Int, orderId)
    .query(`SELECT * FROM Orders WHERE orderId = @orderId`);
  const order = result.recordset[0];
  if (order && order.paymentDetails) {
    order.paymentDetails = JSON.parse(order.paymentDetails);
  }
  if (order && order.items) {
    order.items = JSON.parse(order.items);
  }
  return order;
}

async function create(orderData) {
  const pool = await getPool();
  const result = await pool.request()
    .input("totalPrice", sql.Decimal(18, 2), orderData.totalPrice)
    .input("items", sql.NVarChar, JSON.stringify(orderData.items || []))
    .input("paymentStatus", sql.NVarChar, orderData.paymentStatus || 'Pending')
    .input("orderStatus", sql.NVarChar, orderData.orderStatus || 'Pending')
    .input("paymentDetails", sql.NVarChar, JSON.stringify(orderData.paymentDetails || {}))
    .query(`
      INSERT INTO Orders (totalPrice, items, paymentStatus, orderStatus, paymentDetails, createdAt, updatedAt)
      VALUES (@totalPrice, @items, @paymentStatus, @orderStatus, @paymentDetails, GETDATE(), GETDATE());
      SELECT SCOPE_IDENTITY() AS orderId;
    `);
  return { _id: result.recordset[0].orderId, ...orderData };
}

module.exports = { findByIdAndUpdate, findById, create };