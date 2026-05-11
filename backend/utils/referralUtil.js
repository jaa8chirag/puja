import db from "../config/db.js";

export const processReferralReward = async (pujaRequestId) => {
  let connection;
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

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Atomic update check: Set is_referral_rewarded = TRUE ONLY IF it's currently FALSE
    // and the user was actually referred by someone.
    const [updateResult] = await connection.query(`
      UPDATE users 
      SET is_referral_rewarded = TRUE 
      WHERE id = ? AND referred_by IS NOT NULL AND is_referral_rewarded = FALSE
    `, [userId]);

    if (updateResult.affectedRows > 0) {
      // 2. Fetch the referred_by ID to give them the reward
      const [userRows] = await connection.query("SELECT referred_by FROM users WHERE id = ?", [userId]);
      const referrerId = userRows[0].referred_by;

      // 3. Fetch current reward percentage from settings
      const [settingRows] = await connection.query("SELECT setting_value FROM site_settings WHERE setting_key = 'referral_reward_referrer'");
      const rewardPercentage = settingRows.length > 0 ? Number(settingRows[0].setting_value) : 10;

      // 4. Reward the referrer
      await connection.query(`
        INSERT INTO user_referral_rewards (user_id, discount_percentage, earned_from_user_id)
        VALUES (?, ?, ?)
      `, [referrerId, rewardPercentage, userId]);
      
      await connection.commit();
      console.log(`[Referral Reward] SUCCESS: Referral reward (${rewardPercentage}%) given to referrer ${referrerId} for referred user ${userId}`);
    } else {
      await connection.rollback();
      console.log(`[Referral Reward] SKIPPED: User ${userId} already rewarded or not eligible.`);
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("[Referral Reward] ERROR processing referral reward: ", error);
  } finally {
    if (connection) connection.release();
  }
};
