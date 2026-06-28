import bcrypt from 'bcrypt';
import { query } from '../config/database.js';

const SALT_ROUNDS = 10;

export const User = {
  // Tạo user mới
  async create(phoneNumber, password) {
    try {
      // Hash password an toàn
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const sql = 'INSERT INTO users (phone_number, password_hash, created_at) VALUES (?, ?, NOW())';
      const result = await query(sql, [phoneNumber, hashedPassword]);
      
      return {
        id: result.insertId,
        phoneNumber,
        message: 'Đăng ký thành công'
      };
    } catch (error) {
      throw error;
    }
  },

  // Tìm user theo số điện thoại
  async findByPhoneNumber(phoneNumber) {
    try {
      const sql = 'SELECT id, phone_number, password_hash, created_at FROM users WHERE phone_number = ?';
      const results = await query(sql, [phoneNumber]);
      return results[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // Xác minh mật khẩu
  async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  },

  // Lấy tất cả users (chỉ thông tin cơ bản)
  async findAll() {
    try {
      const sql = 'SELECT id, phone_number, created_at FROM users ORDER BY created_at DESC';
      return await query(sql);
    } catch (error) {
      throw error;
    }
  },

  // Xóa user
  async delete(id) {
    try {
      const sql = 'DELETE FROM users WHERE id = ?';
      const result = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};
