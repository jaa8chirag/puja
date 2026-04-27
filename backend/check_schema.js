import dotenv from "dotenv";
import mysql from "mysql2/promise";
dotenv.config();

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
  
  const tables = ['partner_payment_details', 'users', 'pandits'];
  for (const table of tables) {
    try {
        const [cols] = await conn.query(`DESCRIBE ${table}`);
        console.log(`${table} columns:`, cols.map(c => c.Field));
    } catch (e) {
        console.log(`${table} not found or error:`, e.message);
    }
  }

  conn.end();
}
run();
