import db from "./config/db.js";

async function verifyAmit() {
  try {
    const [rows] = await db.query("SELECT id, name, referred_by, is_referral_rewarded FROM users WHERE id = 48");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyAmit();
