import db from "../config/db.js";

async function checkAndAddColumns() {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM users");
    const hasCountryCode = columns.some(c => c.Field === 'country_code');
    
    if (!hasCountryCode) {
      console.log("Adding country_code column to users table...");
      await db.query("ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+91' AFTER id");
      console.log("Added country_code column.");
    } else {
      console.log("country_code column already exists.");
    }

    // Also check for pandits or other tables if needed
    // But usually users table is the main one for phone numbers.
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkAndAddColumns();
