import pool from '../config/db.js';
import fs from 'fs';
import db from '../config/db.js';
// 1. Fetch Events
export const getAllEvents = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY id DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Fetch Aartis
export const getAllAartis = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM aartis ORDER BY id DESC');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. Add Content (Aarti/Event)
export const addContent = async (req, res) => {
  try {
    const { type, title, timeDate, location, description } = req.body;
    const imagePath = req.file ? `/${req.file.filename}` : null;

    // Table aur Column selection logic
    const table = type === 'event' ? 'events' : 'aartis';
    const dateField = type === 'event' ? 'date' : 'time';

    const query = `INSERT INTO ${table} (title, ${dateField}, location, description, image) VALUES (?, ?, ?, ?, ?)`;
    await pool.query(query, [title, timeDate, location, description, imagePath]);

    res.status(201).json({ success: true, message: `${type} added successfully!` });
  } catch (error) {
    res.status(500).json({ success: false, message: "Add failed", error: error.message });
  }
};

// 4. Delete Content
export const deleteContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    const table = type === 'event' ? 'events' : 'aartis';

    // Delete image from folder first
    const [rows] = await pool.query(`SELECT image FROM ${table} WHERE id = ?`, [id]);
    if (rows.length > 0 && rows[0].image) {
      const fullPath = `.${rows[0].image}`; 
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }

    await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
    res.status(200).json({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// 1. Saare Mandir ki list (Frontend Cards ke liye)
export const getMandirList = async (req, res) => {
    try {
        // EXACT COLUMNS jo aapne bataye: id, name, location, about, image_url_1
        const [rows] = await db.execute('SELECT id, name, location, about, image_url_1 FROM mandir');
        
        res.status(200).json({ 
            success: true, 
            data: rows 
        });
    } catch (err) {
        // Terminal mein check karna error kya aa raha hai
        console.error("Database Error:", err.message); 
        res.status(500).json({ 
            success: false, 
            message: "Database query failed", 
            error: err.message 
        });
    }
};

// 2. Ek specific Mandir ki detail (Details Page ke liye)
export const getMandirDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT * FROM mandir WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Mandir nahi mila" });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        console.error("SQL Error (Detail):", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 3. Naya Mandir add karna (Admin Panel)
export const addMandir = async (req, res) => {
    const { name, location, about, description, timings, map_url } = req.body;
    const image = req.file ? req.file.filename : null;
    try {
        const sql = `INSERT INTO mandir (name, location, about, description, timings, map_url, image_url_1) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [name, location, about, description, timings, map_url, image]);
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        console.error("SQL Error (Add):", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

// 4. Mandir delete karna
export const deleteMandir = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM mandir WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: "Mandir deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};