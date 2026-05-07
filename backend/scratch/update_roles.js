import db from '../config/db.js';
async function run() {
  try {
    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('user','pandit','admin','customerCare','superAdmin') NOT NULL");
    console.log('Role enum updated successfully');
  } catch(e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
run();
