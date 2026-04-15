import db from "./config/db.js";

async function checkReferrers() {
  try {
    const [rows] = await db.query("SELECT id, name, referral_code FROM users WHERE referral_code IS NOT NULL");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkReferrers();
