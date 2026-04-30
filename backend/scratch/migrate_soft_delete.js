import db from '../config/db.js';

async function migrate() {
  try {
    console.log('Adding is_deleted to users...');
    await db.query('ALTER TABLE users ADD COLUMN is_deleted TINYINT(1) DEFAULT 0 AFTER is_blocked');
    
    console.log('Adding is_deleted to services...');
    await db.query('ALTER TABLE services ADD COLUMN is_deleted TINYINT(1) DEFAULT 0');

    console.log('Adding is_deleted to pandits...');
    await db.query('ALTER TABLE pandits ADD COLUMN is_deleted TINYINT(1) DEFAULT 0');
    
    console.log('Success!');
  } catch (err) {
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
