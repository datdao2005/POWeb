# 🚀 Hướng Dẫn Thiết Lập & Chạy

## 📋 Yêu Cầu Trước Tiên
- **Node.js 16+** - [Tải tại nodejs.org](https://nodejs.org/)
- **MySQL 5.7+** - [Tải tại mysql.com](https://www.mysql.com/downloads/)

---

## ⚙️ Bước 1: Cài Đặt Backend

### 1.1 Cài đặt dependencies
```bash
cd backend
npm install
```

### 1.2 Tạo file .env
```bash
cp .env.example .env
```

### 1.3 Chỉnh sửa .env với thông tin MySQL của bạn
Mở file `backend/.env` và thay đổi:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=poweb_db
DB_PORT=3306
PORT=5000
```

### 1.4 Thiết lập Database
```bash
npm run setup
```

Lệnh này sẽ:
✅ Tạo database `poweb_db`
✅ Tạo bảng `users` với các cột: id, phone_number, password_hash, created_at, updated_at

---

## 🎨 Bước 2: Cài Đặt Frontend

### 2.1 Cài đặt dependencies
```bash
# Về thư mục gốc nếu bạn còn ở backend
cd ..

# Cài dependencies frontend
npm install
```

---

## 🏃 Bước 3: Chạy Ứng Dụng

Mở **2 terminal** - một cho backend, một cho frontend

### Terminal 1: Chạy Backend
```bash
cd backend
npm run dev
```

Bạn sẽ thấy:
```
✅ Kết nối MySQL thành công
🚀 Server is running on port 5000
📍 API URL: http://localhost:5000
```

### Terminal 2: Chạy Frontend
```bash
npm run dev
```

Vite sẽ chạy trên `http://localhost:5173`

---

## 🧪 Bước 4: Test Ứng Dụng

1. Mở browser: **http://localhost:5173**
2. Bạn sẽ thấy giao diện login/register đẹp
3. **Đăng ký** tài khoản với:
   - Số điện thoại: `0912345678` (10-11 chữ số)
   - Mật khẩu: `password123` (tối thiểu 6 ký tự)
4. **Đăng nhập** bằng thông tin vừa đăng ký
5. Bạn sẽ thấy thông tin user đã lưu

---

## 📱 Cấu Trúc Project

```
POweb/
├── backend/                    # Backend API
│   ├── config/
│   │   └── database.js        # Kết nối MySQL
│   ├── models/
│   │   └── User.js            # Model User
│   ├── routes/
│   │   └── auth.js            # Routes login/register
│   ├── server.js              # Server Express chính
│   ├── setup.js               # Script tạo database
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── src/
│   ├── Auth.jsx               # Component login/register (NEW)
│   ├── Auth.css               # CSS cho Auth (NEW)
│   ├── App.jsx                # App chính
│   ├── App.css
│   └── main.jsx
│
├── vite.config.js             # Config proxy API
├── package.json               # Frontend dependencies
└── README.md
```

---

## 🔐 Tính Năng Bảo Mật

✅ **Mật khẩu hash**: Sử dụng bcrypt (10 rounds)
✅ **Không lưu plaintext**: Mật khẩu không bao giờ lưu dạng thô
✅ **Xác thực input**: Kiểm tra số điện thoại & mật khẩu
✅ **CORS**: Frontend có thể gọi API an toàn
✅ **Validation**: Express-validator kiểm tra dữ liệu

---

## 📡 API Endpoints

### Đăng Ký
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "id": 1,
    "phoneNumber": "0912345678"
  }
}
```

### Đăng Nhập
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "id": 1,
    "phoneNumber": "0912345678",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Health Check
```bash
GET http://localhost:5000/api/health
```

---

## 🐛 Troubleshooting

### ❌ "Lỗi kết nối MySQL"
**Giải pháp:**
1. Kiểm tra MySQL đang chạy
   ```bash
   mysql -u root -p
   ```
2. Kiểm tra `.env` có đúng thông tin không
3. Nếu mất password MySQL, reset lại

### ❌ "Port 5000 đã được sử dụng"
**Giải pháp:**
Sửa `PORT=5001` trong file `backend/.env`

### ❌ "Frontend không thể gọi API"
**Giải pháp:**
1. Kiểm tra backend đang chạy: http://localhost:5000/api/health
2. Kiểm tra proxy trong `vite.config.js` có config đúng không
3. Restart frontend server

### ❌ "Mất connection sau khi đăng nhập"
**Giải pháp:**
- Mở browser DevTools (F12) → Console → xem lỗi
- Kiểm tra Network tab có error không

---

## 📚 Tài Liệu Thêm

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Express Validator](https://express-validator.github.io/docs/)

---

## ✨ Tiếp Theo (Tương Lai)

Bạn có thể thêm:
- 🔑 JWT Token Authentication
- 📊 User Profile Management
- 🔄 Refresh Token
- 📧 Email Verification
- 🔒 2FA (Two-Factor Authentication)

---

**Chúc bạn cài đặt thành công! 🎉**

Nếu có câu hỏi, hãy kiểm tra lại các bước trên hoặc xem file README trong folder backend.
