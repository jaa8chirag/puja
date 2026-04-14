import db from "./config/db.js";
async function run() {
  try {
    const [tables] = await db.query("SHOW TABLES");
    console.log("Tables List:", tables.map(t => Object.values(t)[0]));
    
    // Check for puja_requests specifically
    const [pujaRequestsDesc] = await db.query("DESCRIBE puja_requests");
    console.log("Table: puja_requests", pujaRequestsDesc);

    // Check if there is a site_settings or similar
    const tablesList = tables.map(t => Object.values(t)[0]);
    if (tablesList.includes('site_settings')) {
       const [settingsDesc] = await db.query("DESCRIBE site_settings");
       console.log("Table: site_settings", settingsDesc);
    } else {
       console.log("site_settings table not found.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
run();
