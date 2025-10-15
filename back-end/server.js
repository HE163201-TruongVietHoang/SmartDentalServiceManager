const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // mặc định trống trong XAMPP
  database: "smartdental_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Kết nối thất bại:", err);
  } else {
    console.log("✅ Đã kết nối MySQL");
  }
});

// =======================
// 📌 API ĐĂNG KÝ (SIGN UP)
// =======================
app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    // Kiểm tra email trùng
    const checkEmail = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmail, [email], async (err, result) => {
      if (err) return res.status(500).json({ message: "Lỗi máy chủ!" });
      if (result.length > 0)
        return res.status(400).json({ message: "Email đã tồn tại!" });

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      // Lưu vào DB
      const sql =
        "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";
      db.query(sql, [name, email, phone, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Đăng ký thất bại!" });
        }
        return res.json({ message: "Đăng ký thành công!" });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
});

// =======================
// 📌 API ĐĂNG NHẬP (SIGN IN)
// =======================
app.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu!" });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Lỗi máy chủ!" });
    if (results.length === 0)
      return res.status(401).json({ message: "Email không tồn tại!" });

    const user = results[0];

    // So sánh mật khẩu đã mã hóa
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Sai mật khẩu!" });

    res.json({ message: "Đăng nhập thành công!", user: { name: user.name, email: user.email } });
  });
});

// =======================
// 📌 KHỞI ĐỘNG SERVER
// =======================
app.listen(8081, () => {
  console.log("🚀 Server đang chạy tại http://localhost:8081");
});
