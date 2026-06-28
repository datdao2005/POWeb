import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';

const router = express.Router();

// Validation middleware
const validatePhonePassword = [
  body('phoneNumber')
    .trim()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại phải có 10-11 chữ số'),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// Đăng ký
router.post('/register', validatePhonePassword, async (req, res) => {
  try {
    // Kiểm tra lỗi validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { phoneNumber, password } = req.body;

    // Kiểm tra số điện thoại đã tồn tại chưa
    const existingUser = await User.findByPhoneNumber(phoneNumber);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Số điện thoại này đã được đăng ký'
      });
    }

    // Tạo user mới
    const newUser = await User.create(phoneNumber, password);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        id: newUser.id,
        phoneNumber: newUser.phoneNumber
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký tài khoản'
    });
  }
});

// Đăng nhập
router.post('/login', validatePhonePassword, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: errors.array()
      });
    }

    const { phoneNumber, password } = req.body;

    // Tìm user
    const user = await User.findByPhoneNumber(phoneNumber);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không đúng'
      });
    }

    // Xác minh mật khẩu
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Số điện thoại hoặc mật khẩu không đúng'
      });
    }

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        id: user.id,
        phoneNumber: user.phone_number,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập'
    });
  }
});

// Lấy danh sách users (cho admin/debug)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Lỗi:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách'
    });
  }
});

export default router;
