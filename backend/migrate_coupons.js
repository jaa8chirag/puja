import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import db from './config/db.js';

async function migrate() {
  try {
    await db.query(`ALTER TABLE coupons ADD COLUMN is_public TINYINT(1) DEFAULT 0;`);
    console.log("Migration successful: Added is_public column to coupons table.");
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log("Column is_public already exists.");
      process.exit(0);
    }
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
