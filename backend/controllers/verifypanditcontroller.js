import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ POST — Naya verify pandit add karo
export const addVerifyPandit = async (req, res) => {
  const { name, rating, location, experience } = req.body;

  if (!name || rating === undefined || !location) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Name, Rating aur Location required hain" });
  }

  const imagePath = req.file ? `uploads/verifyPanditImg/${req.file.filename}` : null;
  if (!imagePath) return res.status(400).json({ message: "Image required hai" });

  try {
    const [result] = await pool.query(
      "INSERT INTO verify_pandit (name, image, rating, location, experience) VALUES (?, ?, ?, ?, ?)",
      [name, imagePath, parseFloat(rating), location, parseInt(experience) || 0]
    );
    return res.status(201).json({ message: "Pandit added", id: result.insertId });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ PUT — Existing record update karo (Yeh missing tha)
export const updateVerifyPandit = async (req, res) => {
  const { id } = req.params;
  const { name, rating, location, experience } = req.body;

  try {
    // 1. Pehle purana data check karo image delete karne ke liye
    const [rows] = await pool.query("SELECT image FROM verify_pandit WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Record not found" });

    let imagePath = rows[0].image;

    // 2. Agar nayi image aayi hai
    if (req.file) {
      // Purani file delete karo
      const oldPath = path.join(__dirname, "../", rows[0].image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      
      // Naya path set karo
      imagePath = `uploads/verifyPanditImg/${req.file.filename}`;
    }

    // 3. Update query chalao
    await pool.query(
      "UPDATE verify_pandit SET name=?, image=?, rating=?, location=?, experience=? WHERE id=?",
      [name, imagePath, parseFloat(rating), location, parseInt(experience) || 0, id]
    );

    return res.status(200).json({ message: "Update successful", image: imagePath });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ GET — Sab records lao
export const getAllVerifyPandits = async (req, res) => {
  try {
    const [results] = await pool.query("SELECT * FROM verify_pandit ORDER BY created_at DESC");
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE — Record aur file delete karo
export const deleteVerifyPandit = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT image FROM verify_pandit WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });

    const filePath = path.join(__dirname, "../", rows[0].image);
    await pool.query("DELETE FROM verify_pandit WHERE id = ?", [req.params.id]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};