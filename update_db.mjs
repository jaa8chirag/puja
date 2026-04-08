import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const newDonations = [
  { name: "Vidya Dan", price: 501, description: "Support the education of underprivileged children and Vedic students." },
  { name: "Aushadhi Dan", price: 501, description: "Contribute towards medical aid and medicines for the needy." },
  { name: "Jal Dan", price: 101, description: "Provide clean drinking water at temples and public places." },
  { name: "Vriksh Dan", price: 251, description: "Plant a tree to protect nature and balance the environment." },
  { name: "Aashray Dan", price: 1101, description: "Help in providing shelter and basic amenities to the homeless." },
  { name: "Jeev Daya", price: 251, description: "Contribute to animal welfare, bird feeding, and rescuing strays." }
];

async function updateDB() {
  try {
    for (const item of newDonations) {
      const [existing] = await pool.query("SELECT id FROM contribution_types WHERE name = ?", [item.name]);
      if (existing.length === 0) {
        await pool.query(
          "INSERT INTO contribution_types (name, price, description, is_active) VALUES (?, ?, ?, 1)",
          [item.name, item.price, item.description]
        );
        console.log(`Inserted: ${item.name}`);
      } else {
        console.log(`Skipped (Exists): ${item.name}`);
      }
    }
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error updating DB:", error);
    process.exit(1);
  }
}

updateDB();
