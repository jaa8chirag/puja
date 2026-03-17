// controllers/verifypanditcontroller.js
import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ POST — Naya verify pandit add karo
export const addVerifyPandit = async (req, res) => {
  const { name, rating } = req.body;

  if (!name || rating === undefined) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "name aur rating required hain" });
  }

  if (isNaN(rating) || rating < 0 || rating > 5) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json({ message: "Rating 0 se 5 ke beech honi chahiye" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image required hai" });
  }

  const imagePath = `uploads/verifyPanditImg/${req.file.filename}`;

  try {
    const [result] = await pool.query(
      "INSERT INTO verify_pandit (name, image, rating) VALUES (?, ?, ?)",
      [name, imagePath, parseFloat(rating)],
    );

    return res.status(201).json({
      message: "Verify Pandit successfully added",
      id: result.insertId,
      image: imagePath,
    });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: err.message });
  }
};

// ✅ GET — Sabhi verify pandits lao
export const getAllVerifyPandits = async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM verify_pandit ORDER BY created_at DESC",
    );
    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE — Verify pandit delete karo (DB + image file dono)
export const deleteVerifyPandit = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT image FROM verify_pandit WHERE id = ?",
      [req.params.id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    await pool.query("DELETE FROM verify_pandit WHERE id = ?", [req.params.id]);

    // File system se image delete karo
    const filePath = path.join(__dirname, "../", rows[0].image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return res
      .status(200)
      .json({ message: "Verify Pandit deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
