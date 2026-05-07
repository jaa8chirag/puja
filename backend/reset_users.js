import db from "./config/db.js";

const resetUsers = async () => {
  try {
    console.log("Starting Database Reset for Users...");

    // Disable foreign key checks to allow truncation
    await db.query("SET FOREIGN_KEY_CHECKS = 0");

    const tablesToReset = [
      "users",
      "addresses",
      "pandits",
      "partner_payment_details",
      "user_family_members",
      "user_referral_rewards",
      "notifications",
      "chats"
    ];

    for (const table of tablesToReset) {
      try {
        await db.query(`TRUNCATE TABLE ${table}`);
        console.log(`✅ Table truncated: ${table}`);
      } catch (err) {
        console.log(`⚠️  Could not truncate ${table} (maybe it doesn't exist): ${err.message}`);
      }
    }

    // Re-enable foreign key checks
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("\nDatabase reset completed successfully! ✅");
    console.log("All old users and their data have been removed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reset failed:", error.message);
    process.exit(1);
  }
};

resetUsers();
