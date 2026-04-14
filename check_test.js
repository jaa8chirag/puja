import db from './backend/config/db.js';

async function check() {
  try {
    const [rows] = await db.query('SELECT id, puja_name, total_price, paid_amount, payment_status, payment_type FROM puja_requests ORDER BY id DESC LIMIT 5');
    console.log(JSON.stringify(rows, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
