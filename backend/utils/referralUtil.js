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
      // Fetch current reward percentage from settings
      const [settingRows] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = 'referral_reward_referrer'");
      const rewardPercentage = settingRows.length > 0 ? Number(settingRows[0].setting_value) : 10;

      // Reward the referrer by inserting a record with the CURRENT percentage
      await db.query(`
        INSERT INTO user_referral_rewards (user_id, discount_percentage, earned_from_user_id)
        VALUES (?, ?, ?)
      `, [user.referred_by, rewardPercentage, userId]);
      
      // Mark as rewarded
      await db.query("UPDATE users SET is_referral_rewarded = TRUE WHERE id = ?", [userId]);
      
      console.log(`[Referral Reward] SUCCESS: Referral reward (${rewardPercentage}%) given to referrer ${user.referred_by} for referred user ${userId}`);
    } else {
      console.log(`[Referral Reward] SKIPPED: User ${userId} does not meet reward criteria (either not referred or already rewarded).`);
    }
  } catch (error) {
    console.error("[Referral Reward] ERROR processing referral reward: ", error);
  }
};
