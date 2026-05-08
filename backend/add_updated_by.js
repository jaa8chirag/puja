import db from "./config/db.js";

async function addUpdatedBy() {
  try {
    await db.query("ALTER TABLE services ADD COLUMN updated_by VARCHAR(255) DEFAULT 'admin'");
    console.log("Column updated_by added successfully to services table.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addUpdatedBy();
