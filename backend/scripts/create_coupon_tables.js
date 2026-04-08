import pool from '../config/db.js';

async function createTables() {
  try {
    console.log('🚀 Creating coupon tables...');

    // 1. Coupons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percentage INT NOT NULL,
        usage_limit INT NOT NULL DEFAULT 100,
        used_count INT DEFAULT 0,
        expiry_date DATETIME,
        is_active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Coupons table created');

    // 2. Coupon usage table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        coupon_id INT NOT NULL,
        order_id VARCHAR(100),
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Coupon usage table created');

    console.log('🎉 Database migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

createTables();
