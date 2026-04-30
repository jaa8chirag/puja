import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function init() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  try {
    console.log("Creating user_referral_rewards table...");
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_referral_rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        discount_percentage INT NOT NULL,
        status ENUM('pending', 'used', 'expired') DEFAULT 'pending',
        earned_from_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("Table created successfully.");

    // Also add the settings if they don't exist
    const settings = [
      { key: 'referral_reward_referrer', value: '10' },
      { key: 'referral_discount_friend', value: '5' }
    ];

    for (const s of settings) {
      await conn.query(`
        INSERT INTO site_settings (setting_key, setting_value) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [s.key, s.value]);
    }
    console.log("Settings initialized.");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    conn.end();
  }
}

init();
