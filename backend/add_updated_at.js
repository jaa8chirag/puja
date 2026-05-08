import db from "./config/db.js";

async function addUpdatedAt() {
  try {
    await db.query("ALTER TABLE services ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    console.log("Column updated_at added successfully to services table.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addUpdatedAt();
