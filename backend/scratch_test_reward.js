import db from "./config/db.js";
import { processReferralReward } from "./utils/referralUtil.js";

async function testReward() {
  try {
    // 1. Find a user with a referred_by and is_referral_rewarded = 0
    const [users] = await db.query("SELECT id, referred_by FROM users WHERE referred_by IS NOT NULL AND is_referral_rewarded = 0 LIMIT 1");
    
    if (users.length === 0) {
       console.log("No referred users found to test reward.");
       process.exit(0);
    }

    const userId = users[0].id;
    const referrerId = users[0].referred_by;
    console.log(`Found referred user ${userId} with referrer ${referrerId}`);

    // 2. Find a puja request for this user
    const [pujas] = await db.query("SELECT id FROM puja_requests WHERE user_id = ? LIMIT 1", [userId]);
    
    if (pujas.length === 0) {
      console.log(`No puja request found for user ${userId}. Creating a dummy one.`);
      const [insert] = await db.query("INSERT INTO puja_requests (user_id, service_id, status, bookingId) VALUES (?, ?, ?, ?)", [userId, 1, 'pending', 'TEST-123']);
      const pujaId = insert.insertId;
      console.log(`Created dummy puja ${pujaId}`);
      await processReferralReward(pujaId);
    } else {
      console.log(`Using existing puja ${pujas[0].id}`);
      await processReferralReward(pujas[0].id);
    }

    // 3. Check if referrer got reward
    const [referrer] = await db.query("SELECT pending_referral_discounts FROM users WHERE id = ?", [referrerId]);
    console.log(`Referrer ${referrerId} now has ${referrer[0].pending_referral_discounts} rewards.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testReward();
