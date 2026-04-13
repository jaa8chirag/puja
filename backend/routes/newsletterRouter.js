import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

router.get("/all", verifyToken, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC");
    res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error("Fetch Newsletter Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  try {
    // Check if already subscribed
    const [existing] = await pool.query("SELECT id FROM newsletter_subscribers WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: "You are already subscribed!" });
    }

    await pool.query("INSERT INTO newsletter_subscribers (email) VALUES (?)", [email]);
    res.status(201).json({ success: true, message: "Successfully subscribed to the newsletter!" });
  } catch (err) {
    console.error("Newsletter Subscription Error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
