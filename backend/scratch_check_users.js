import db from "./config/db.js";

async function checkUsers() {
  try {
    const [rows] = await db.query("SELECT id, name, phone, referral_code, referred_by, is_referral_rewarded, pending_referral_discounts FROM users ORDER BY id DESC LIMIT 5");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
