import db from "./config/db.js";
const tables = ['services', 'pages', 'contribution_types'];
for (const table of tables) {
    try {
        const [rows] = await db.query(`DESCRIBE ${table}`);
        console.log(`Table: ${table}`);
        console.table(rows);
    } catch (e) {
        console.log(`Error describing ${table}: ${e.message}`);
    }
}
process.exit(0);
