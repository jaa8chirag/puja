import db from "./backend/config/db.js";
const [rows] = await db.query("SHOW TABLES");
console.log(JSON.stringify(rows, null, 2));
process.exit(0);
