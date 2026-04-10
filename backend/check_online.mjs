import pool from './config/db.js';

async function check() {
  try {
    await pool.query('UPDATE services SET status = "active" WHERE status = "" OR status IS NULL');
    const [rows] = await pool.query('SELECT id, puja_name, puja_type, status FROM services WHERE puja_type = "online_pind_dan"');
    console.log('--- Online Pind Dan Services (Updated) ---');
    console.table(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
