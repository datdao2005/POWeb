import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupDatabase() {
  try {
    console.log('🚀 Bắt đầu thiết lập database...\n');

    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const dbName = process.env.DB_NAME || 'poweb_db';

    // Kết nối MySQL mà không chỉ định database
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      multipleStatements: true
    });

    console.log('✅ Kết nối MySQL thành công\n');

    // Tạo database
    console.log(`📦 Tạo database: ${dbName}`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log('✅ Database được tạo\n');

    // Chọn database
    await connection.execute(`USE ${dbName}`);

    // Tạo bảng users
    console.log('📋 Tạo bảng users...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ Bảng users được tạo\n');

    // Hiển thị thông tin
    console.log('════════════════════════════════════════');
    console.log('✨ Thiết lập database hoàn thành!');
    console.log('════════════════════════════════════════');
    console.log('\n📍 Thông tin kết nối:');
    console.log(`   Host: ${host}`);
    console.log(`   User: ${user}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log('\n📝 Bảng được tạo: users');
    console.log('   - id (PK)')
    console.log('   - phone_number (UNIQUE)');
    console.log('   - password_hash (đã hash với bcrypt)');
    console.log('   - created_at');
    console.log('   - updated_at');
    console.log('\n🔐 Bảo mật: Mật khẩu được lưu dưới dạng hash (bcrypt), không lưu plaintext\n');

    await connection.end();
    rl.close();
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    rl.close();
    process.exit(1);
  }
}

setupDatabase();
