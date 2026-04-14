import db from "../config/db.js";

// Get setting by key
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const [rows] = await db.query("SELECT setting_value FROM site_settings WHERE setting_key = ?", [key]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Setting not found" });
    }
    res.json({ success: true, value: rows[0].setting_value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Update setting
export const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    await db.query(
      "INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [key, value, value]
    );
    res.json({ success: true, message: "Setting updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
