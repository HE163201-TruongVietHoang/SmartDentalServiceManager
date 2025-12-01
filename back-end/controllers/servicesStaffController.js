const { getPool } = require("../config/db");
const sql = require("mssql");
const cloudinary = require("../config/cloudinary");
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
    const { serviceName, description, price, duration } = req.body;
    const pool = await getPool();
    let imageUrl = null;

    // Nếu có file ảnh
    if (req.file) {
      const streamifier = require("streamifier");

      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "services" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      try {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Error uploading to Cloudinary:", err);
        return res.status(400).json({ error: "Failed to upload image" });
      }
    }

    // Kiểm tra dữ liệu trước khi insert
    if (!serviceName || !price) {
      return res.status(400).json({ error: "serviceName and price are required" });
    }

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
    const { serviceName, description, price, duration } = req.body;
    const pool = await getPool();
    let imageUrl = null;

    // Nếu có file ảnh
    if (req.file) {
      const streamifier = require("streamifier");

      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "services" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      try {
        const result = await streamUpload(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Error uploading to Cloudinary:", err);
        return res.status(400).json({ error: "Failed to upload image" });
      }
    }

    // Kiểm tra dữ liệu trước khi insert
    if (!serviceName || !price) {
      return res.status(400).json({ error: "serviceName and price are required" });
    }
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
