import db from "./config/db.js";

async function migrate() {
    try {
        console.log("Adding is_active to services...");
        await db.query("ALTER TABLE services ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER is_deleted");
    } catch (e) {
        console.log(`Services: ${e.message}`);
    }

    try {
        console.log("Adding is_active to pages...");
        await db.query("ALTER TABLE pages ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER updated_by");
    } catch (e) {
        console.log(`Pages: ${e.message}`);
    }

    console.log("Migration complete!");
    process.exit(0);
}

migrate();
