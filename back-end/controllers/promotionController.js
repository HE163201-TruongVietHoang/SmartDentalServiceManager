const { sql, getPool } = require('../config/db');

// Lấy tất cả promotion
exports.getAllPromotions = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Promotions ORDER BY createdAt DESC');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Tạo mới promotion
exports.createPromotion = async (req, res) => {
  const { code, description, discountType, discountValue, startDate, endDate, isActive } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('code', sql.NVarChar, code)
      .input('description', sql.NVarChar, description)
      .input('discountType', sql.NVarChar, discountType)
      .input('discountValue', sql.Decimal(18, 2), discountValue)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('isActive', sql.Bit, isActive ?? 1)
      .query(`
        INSERT INTO Promotions (code, description, discountType, discountValue, startDate, endDate, isActive)
        VALUES (@code, @description, @discountType, @discountValue, @startDate, @endDate, @isActive)
      `);
    res.status(201).send('Promotion created successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Cập nhật promotion
exports.updatePromotion = async (req, res) => {
  const { id } = req.params;
  const { code, description, discountType, discountValue, startDate, endDate, isActive } = req.body;

  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .input('code', sql.NVarChar, code)
      .input('description', sql.NVarChar, description)
      .input('discountType', sql.NVarChar, discountType)
      .input('discountValue', sql.Decimal(18, 2), discountValue)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .input('isActive', sql.Bit, isActive)
      .query(`
        UPDATE Promotions
        SET code=@code, description=@description, discountType=@discountType,
            discountValue=@discountValue, startDate=@startDate, endDate=@endDate,
            isActive=@isActive
        WHERE promotionId=@id
      `);
    res.send('Promotion updated successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Xóa promotion
exports.deletePromotion = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getPool();
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Promotions WHERE promotionId=@id');
    res.send('Promotion deleted successfully');
  } catch (err) {
    res.status(500).send(err.message);
  }
};
