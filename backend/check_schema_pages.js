import db from "./config/db.js";

async function checkSchema() {
  try {
    const [rows] = await db.query("DESCRIBE pages_content");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
