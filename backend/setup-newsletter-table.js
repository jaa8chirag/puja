import pool from "./config/db.js";

const setupNewsletterTable = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log("✅ newsletter_subscribers table created or already exists.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating newsletter_subscribers table:", err.message);
    process.exit(1);
  }
};

setupNewsletterTable();
