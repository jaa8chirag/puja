import pool from "./config/db.js";

const migrate = async () => {
  try {
    console.log("Starting migration...");
    
    const [columns] = await pool.query("SHOW COLUMNS FROM users");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('password')) {
      await pool.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email");
      console.log("Added password column");
    }

    if (!columnNames.includes('google_id')) {
      await pool.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) AFTER password");
      console.log("Added google_id column");
    }

    if (!columnNames.includes('apple_id')) {
      await pool.query("ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) AFTER google_id");
      console.log("Added apple_id column");
    }

    if (!columnNames.includes('avatar_url')) {
      await pool.query("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) AFTER apple_id");
      console.log("Added avatar_url column");
    }

    console.log("Migration completed successfully ✅");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed ❌:", error.message);
    process.exit(1);
  }
};

migrate();
