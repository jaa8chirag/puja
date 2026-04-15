import db from "./config/db.js";

async function forceLink() {
  try {
    await db.query("UPDATE users SET referred_by = 27 WHERE id = 48");
    console.log("Amit linked to admin.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

forceLink();
