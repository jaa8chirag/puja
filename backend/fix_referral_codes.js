import db from "./config/db.js";

async function fixReferralCodes() {
    try {
        console.log("Fetching users without referral codes...");
        const [users] = await db.query("SELECT id, name FROM users WHERE referral_code IS NULL OR referral_code = ''");
        
        console.log(`Found ${users.length} users to update.`);
        
        for (const user of users) {
            const namePart = (user.name ? user.name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') : 'USR') || 'USR';
            const uniqueReferralCode = 'PUJA' + namePart + Math.floor(1000 + Math.random() * 9000);
            
            await db.query("UPDATE users SET referral_code = ? WHERE id = ?", [uniqueReferralCode, user.id]);
            console.log(`Updated user ${user.id} (${user.name}) with code ${uniqueReferralCode}`);
        }
        
        console.log("All referral codes fixed successfully! ✅");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error fixing referral codes:", error);
        process.exit(1);
    }
}

fixReferralCodes();
