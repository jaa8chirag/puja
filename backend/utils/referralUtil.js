import db from "../config/db.js";

export const processReferralReward = async (pujaRequestId) => {
  try {
    console.log(`[Referral Reward] Starting process for pujaRequestId: ${pujaRequestId}`);
    
    // Get the user who booked the puja
    const [pujaRows] = await db.query("SELECT user_id FROM puja_requests WHERE id = ?", [pujaRequestId]);
    if (pujaRows.length === 0) {
      console.log(`[Referral Reward] No puja request found with ID: ${pujaRequestId}`);
      return;
    }
    const userId = pujaRows[0].user_id;
    if (!userId) {
      console.log(`[Referral Reward] No user_id associated with pujaRequestId: ${pujaRequestId}`);
      return;
    }

    // Check if the user was referred and hasn't been rewarded yet
    const [userRows] = await db.query("SELECT referred_by, is_referral_rewarded FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) {
      console.log(`[Referral Reward] No user found with ID: ${userId}`);
      return;
    }
    const user = userRows[0];
    console.log(`[Referral Reward] User ${userId} status - referred_by: ${user.referred_by}, is_referral_rewarded: ${user.is_referral_rewarded}`);

    if (user.referred_by && !user.is_referral_rewarded) {
      // Reward the referrer
      const [updateReferrer] = await db.query("UPDATE users SET pending_referral_discounts = pending_referral_discounts + 1 WHERE id = ?", [user.referred_by]);
      
      // Mark as rewarded
      const [updateUser] = await db.query("UPDATE users SET is_referral_rewarded = TRUE WHERE id = ?", [userId]);
      
      console.log(`[Referral Reward] SUCCESS: Referral reward (+1) given to referrer ${user.referred_by} for referred user ${userId}`);
    } else {
      console.log(`[Referral Reward] SKIPPED: User ${userId} does not meet reward criteria (either not referred or already rewarded).`);
    }
  } catch (error) {
    console.error("[Referral Reward] ERROR processing referral reward: ", error);
  }
};
