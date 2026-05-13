import db from "../config/db.js";

async function update() {
  try {
    await db.query(`ALTER TABLE email_otps ADD COLUMN is_verified TINYINT(1) DEFAULT 0`);
    console.log("Column is_verified added.");
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column is_verified already exists.");
    } else {
      console.error("Error updating table:", error);
    }
  }
  process.exit(0);
}

update();
