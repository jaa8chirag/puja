import db from "./config/db.js";

async function checkNames() {
    try {
        const [rows] = await db.execute("SELECT name FROM contribution_types");
        console.log(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNames();
