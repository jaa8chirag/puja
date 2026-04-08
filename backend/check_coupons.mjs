import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

async function check() {
  try {
    const [rows] = await pool.query("SELECT * FROM coupons");
    console.table(rows);
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();
