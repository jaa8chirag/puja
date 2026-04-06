import pool from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to delete files safely
const deleteFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// ✅ POST — Add Verify Pandit
export const addVerifyPandit = async (req, res) => {
  const { name, rating, location, experience } = req.body;

  // 1. Check if file is missing (Multer might reject it based on size/filter)
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Image is required and must be under 5MB (JPG/PNG/WEBP only).",
    });
  }

  const imagePath = `uploads/verifyPanditImg/${req.file.filename}`;

  if (!name || rating === undefined || !location) {
    deleteFile(req.file.path);
    return res.status(400).json({
      success: false,
      message: "Name, Rating, and Location are required.",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO verify_pandit (name, image, rating, location, experience) VALUES (?, ?, ?, ?, ?)",
      [
        name,
        imagePath,
        parseFloat(rating),
        location,
        parseInt(experience) || 0,
      ],
    );
    return res.status(201).json({
      success: true,
      message: "Pandit added successfully",
      id: result.insertId,
    });
  } catch (err) {
    deleteFile(req.file.path);
    return res
      .status(500)
      .json({ success: false, error: "Database error: " + err.message });
  }
};

// ✅ PUT — Update Verify Pandit
export const updateVerifyPandit = async (req, res) => {
  const { id } = req.params;
  const { name, rating, location, experience } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT image FROM verify_pandit WHERE id = ?",
      [id],
    );
    if (rows.length === 0) {
      if (req.file) deleteFile(req.file.path);
      return res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }

    let imagePath = rows[0].image;

    if (req.file) {
      // Purani file delete karo aur nayi set karo
      const oldPath = path.join(__dirname, "../", rows[0].image);
      deleteFile(oldPath);
      imagePath = `uploads/verifyPanditImg/${req.file.filename}`;
    }

    await pool.query(
      "UPDATE verify_pandit SET name=?, image=?, rating=?, location=?, experience=? WHERE id=?",
      [
        name,
        imagePath,
        parseFloat(rating),
        location,
        parseInt(experience) || 0,
        id,
      ],
    );

    return res
      .status(200)
      .json({ success: true, message: "Update successful", image: imagePath });
  } catch (err) {
    if (req.file) deleteFile(req.file.path);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET and DELETE functions remain the same...
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

export const deleteVerifyPandit = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT image FROM verify_pandit WHERE id = ?",
      [req.params.id],
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "Not found" });

    const filePath = path.join(__dirname, "../", rows[0].image);
    await pool.query("DELETE FROM verify_pandit WHERE id = ?", [req.params.id]);
    deleteFile(filePath);
    return res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
