import db from "./config/db.js";
async function run() {
  try {
    // 1. Create site_settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default advance percentage if not exists
    await db.query(`
      INSERT IGNORE INTO site_settings (setting_key, setting_value) 
      VALUES ('advance_payment_percentage', '25')
    `);

    // 2. Add payment columns to puja_requests if they don't exist
    // Actually, I'll create a payments table for better tracking
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        razorpay_order_id VARCHAR(255),
        razorpay_payment_id VARCHAR(255),
        razorpay_signature VARCHAR(255),
        payment_type ENUM('advance', 'full', 'remaining') NOT NULL,
        status ENUM('pending', 'success', 'failed') DEFAULT 'success',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES puja_requests(id) ON DELETE CASCADE
      )
    `);

    // 3. Add paid_amount and payment_status to puja_requests
    const [cols] = await db.query("SHOW COLUMNS FROM puja_requests");
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('paid_amount')) {
      await db.query("ALTER TABLE puja_requests ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0");
    }
    if (!colNames.includes('payment_status')) {
      await db.query("ALTER TABLE puja_requests ADD COLUMN payment_status ENUM('pending', 'partially_paid', 'fully_paid') DEFAULT 'pending'");
    }

    console.log("Database schema updated successfully.");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    process.exit();
  }
}
run();
