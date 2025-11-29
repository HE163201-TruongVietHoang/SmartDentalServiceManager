const { getPool } = require("../config/db");
const sql = require("mssql");

// ==========================
// 📦 CRUD cho bảng Services
// ==========================

// Lấy tất cả dịch vụ
exports.getAllServices = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM [Services]");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Lấy dịch vụ theo ID
exports.getServiceById = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("serviceId", sql.Int, req.params.id)
      .query("SELECT * FROM [Services] WHERE serviceId = @serviceId");

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Service not found" });

    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error getting service:", err);
    res.status(500).json({ error: "Failed to get service" });
  }
};

// Thêm mới dịch vụ
exports.createService = async (req, res) => {
  try {
    const { serviceName, description, price, duration, imageUrl } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input("serviceName", sql.NVarChar, serviceName)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("duration", sql.Int, duration)
      .input("imageUrl", sql.NVarChar, imageUrl).query(`
        INSERT INTO [Services] (serviceName, description, price, duration, imageUrl, createdAt, updatedAt)
        VALUES (@serviceName, @description, @price, @duration, @imageUrl, GETDATE(), GETDATE())
      `);

    res.status(201).json({ message: "Service created successfully" });
  } catch (err) {
    console.error("Error creating service:", err);
    res.status(500).json({ error: "Failed to create service" });
  }
};

// Cập nhật dịch vụ
exports.updateService = async (req, res) => {
  try {
    const { serviceName, description, price, duration, imageUrl } = req.body;
    const pool = await getPool();

    await pool
      .request()
      .input("serviceId", sql.Int, req.params.id)
      .input("serviceName", sql.NVarChar, serviceName)
      .input("description", sql.NVarChar, description)
      .input("price", sql.Decimal(18, 2), price)
      .input("duration", sql.Int, duration)
      .input("imageUrl", sql.NVarChar, imageUrl).query(`
        UPDATE [Services]
        SET serviceName = @serviceName,
            description = @description,
            price = @price,
            duration = @duration,
            imageUrl = @imageUrl,
            updatedAt = GETDATE()
        WHERE serviceId = @serviceId
      `);

    res.json({ message: "Service updated successfully" });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Failed to update service" });
  }
};

// Xóa dịch vụ
exports.deleteService = async (req, res) => {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input("serviceId", sql.Int, req.params.id)
      .query("DELETE FROM [Services] WHERE serviceId = @serviceId");

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Failed to delete service" });
  }
};
