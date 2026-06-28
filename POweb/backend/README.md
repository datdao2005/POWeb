# POweb Backend

Backend cho ứng dụng quản lý số điện thoại và mật khẩu.

## 📋 Yêu cầu

- Node.js 16+
- MySQL 5.7+

## 🚀 Cài đặt

### 1. Cài đặt dependencies
```bash
cd backend
npm install
```

### 2. Tạo file .env
```bash
cp .env.example .env
```

Chỉnh sửa `.env` với thông tin MySQL của bạn:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=poweb_db
DB_PORT=3306
PORT=5000
```

### 3. Thiết lập Database
```bash
npm run setup
```

Lệnh này sẽ:
- Tạo database `poweb_db`
- Tạo bảng `users` với cấu trúc thích hợp

## 🏃 Chạy Server

### Development (với auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### 1. Đăng ký
**POST** `/api/auth/register`

Request:
```json
{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

Response (201):
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

### 2. Đăng nhập
**POST** `/api/auth/login`

Request:
```json
{
  "phoneNumber": "0912345678",
  "password": "password123"
}
```

Response (200):
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

### 3. Lấy danh sách users
**GET** `/api/auth/users`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "phone_number": "0912345678",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 4. Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## 🔐 Bảo mật

- **Mật khẩu**: Được hash sử dụng bcrypt (10 rounds), không bao giờ lưu plaintext
- **Số điện thoại**: Được xác thực định dạng (10-11 chữ số)
- **Mật khẩu tối thiểu**: 6 ký tự

## 📚 Cấu trúc Project

```
backend/
├── config/
│   └── database.js       # Kết nối MySQL
├── models/
│   └── User.js          # Model User
├── routes/
│   └── auth.js          # API routes
├── server.js            # Express server
├── setup.js             # Script thiết lập DB
├── .env.example         # Template biến môi trường
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Lỗi kết nối MySQL
- Kiểm tra MySQL đang chạy: `mysql -u root -p`
- Kiểm tra thông tin trong `.env`

### Port 5000 đã được sử dụng
```bash
# Thay đổi PORT trong .env
PORT=5001
```

### Lỗi quyền truy cập database
```bash
# Cấp quyền cho user MySQL
mysql -u root -p
GRANT ALL PRIVILEGES ON poweb_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 📝 Ghi chú

- Hãy đặt JWT_SECRET an toàn khi triển khai production
- Sẽ thêm authentication middleware trong phiên bản tới
- Rate limiting được khuyến nghị cho login endpoint
