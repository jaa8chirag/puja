import db from "./config/db.js";

async function fixReferralCodes() {
  try {
    const [users] = await db.query("SELECT id, name FROM users WHERE referral_code IS NULL OR referral_code = ''");
    console.log(`Found ${users.length} users without referral codes.`);

    for (const user of users) {
      const name = user.name || "USER";
      const code = 'PUJA' + name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') + Math.floor(1000 + Math.random() * 9000);
      
      await db.query("UPDATE users SET referral_code = ? WHERE id = ?", [code, user.id]);
      console.log(`Updated user ${user.id} (${user.name}) with code: ${code}`);
    }

    console.log("Finished fixing referral codes.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixReferralCodes();
