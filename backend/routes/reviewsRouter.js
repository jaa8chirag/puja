import express from "express";
import pool from "../config/db.js";
import { adminOnly } from "../middleware/admin.js";
import { upload } from "../middleware/multerMiddleware.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC: Get all published reviews
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews WHERE status = 'published' ORDER BY created_at DESC");
    res.json({ success: true, reviews: rows });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    res.status(500).json({ success: false, error: "Reviews fetch failed" });
  }
});

// ADMIN: Get all reviews
router.get("/admin", verifyToken, adminOnly, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reviews ORDER BY created_at DESC");
    res.json({ success: true, reviews: rows });
  } catch (error) {
    console.error("Admin fetch reviews error:", error);
    res.status(500).json({ success: false, error: "Reviews fetch failed" });
  }
});

// ADMIN: Create review
router.post("/admin", verifyToken, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { name, date, rating, comment, status } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : null;
    await pool.query(
      "INSERT INTO reviews (name, date, rating, comment, avatar, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, date, rating, comment, avatar, status || 'published']
    );
    res.json({ success: true, message: "Review added" });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, error: "Failed to create review" });
  }
});

// ADMIN: Update review
router.put("/admin/:id", verifyToken, adminOnly, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, rating, comment, status } = req.body;
    let updateQuery = "UPDATE reviews SET name=?, date=?, rating=?, comment=?, status=? WHERE id=?";
    let queryParams = [name, date, rating, comment, status, id];

    if (req.file) {
      updateQuery = "UPDATE reviews SET name=?, date=?, rating=?, comment=?, status=?, avatar=? WHERE id=?";
      queryParams = [name, date, rating, comment, status, `/uploads/${req.file.filename}`, id];
    }

    await pool.query(updateQuery, queryParams);
    res.json({ success: true, message: "Review updated" });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ success: false, error: "Failed to update review" });
  }
});

// ADMIN: Delete review
router.delete("/admin/:id", verifyToken, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id=?", [req.params.id]);
    res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete review" });
  }
});

// ADMIN: Toggle Status
router.patch("/admin/:id/status", verifyToken, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT status FROM reviews WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: "Not found" });
    const newStatus = rows[0].status === "published" ? "draft" : "published";
    await pool.query("UPDATE reviews SET status=? WHERE id=?", [newStatus, id]);
    res.json({ success: true, message: `Review status toggled` });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update review status" });
  }
});

export default router;
