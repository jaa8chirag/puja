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
  
  const [tables] = await conn.query('SHOW TABLES');
  console.log(tables.map(t => Object.values(t)[0]));

  // Check if pandit_payouts exists
  const hasPayouts = tables.some(t => Object.values(t)[0] === 'pandit_payouts');
  if (!hasPayouts) {
    console.log("Creating pandit_payouts table...");
    await conn.query(`
      CREATE TABLE pandit_payouts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pandit_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_mode VARCHAR(50),
        transaction_id VARCHAR(100),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pandit_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Table created!");
  } else {
    console.log("pandit_payouts already exists.");
  }

  conn.end();
}
run();
