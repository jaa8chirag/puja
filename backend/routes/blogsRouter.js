import express from 'express';
import pool from '../config/db.js'; // aapka existing MySQL pool

const router = express.Router();

// ── GET /api/blogs — Saari published blogs ───────────────────
// Query params: ?category=Jyotish&search=mangal&limit=10&page=1
router.get('/', async (req, res) => {
  try {
    const { category, search, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT id, title, slug, excerpt, category, tag, author, image_url, read_time, views, created_at
                 FROM blogs WHERE status = 'published'`;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (title LIKE ? OR excerpt LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const [blogs] = await pool.query(query, params);

    // Total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM blogs WHERE status = 'published'`;
    const countParams = [];
    if (category && category !== 'All') { countQuery += ` AND category = ?`; countParams.push(category); }
    if (search) { countQuery += ` AND (title LIKE ? OR excerpt LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`); }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ success: true, blogs, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Blogs fetch error:', err);
    res.status(500).json({ success: false, error: 'Blogs load karne mein error' });
  }
});

// ── GET /api/blogs/:id — Single blog by ID ───────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ID ya slug dono se fetch karo
    const query = isNaN(id)
      ? `SELECT * FROM blogs WHERE slug = ? AND status = 'published'`
      : `SELECT * FROM blogs WHERE id = ? AND status = 'published'`;

    const [[blog]] = await pool.query(query, [id]);

    if (!blog) return res.status(404).json({ success: false, error: 'Blog nahi mila' });

    // Views increment karo
    await pool.query(`UPDATE blogs SET views = views + 1 WHERE id = ?`, [blog.id]);

    res.json({ success: true, blog });
  } catch (err) {
    console.error('Blog detail error:', err);
    res.status(500).json({ success: false, error: 'Blog load karne mein error' });
  }
});

// ── GET /api/blogs/categories — Saari categories ────────────
router.get('/meta/categories', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT category, COUNT(*) as count FROM blogs WHERE status = 'published' GROUP BY category ORDER BY count DESC`
    );
    res.json({ success: true, categories: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/blogs — Naya blog create (admin only) ─────────
router.post('/', async (req, res) => {
  try {
    const { title, excerpt, content, category, tag, author, image_url, read_time, status = 'draft' } = req.body;

    if (!title || !content) return res.status(400).json({ success: false, error: 'Title aur content zaroori hai' });

    // Slug auto-generate
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    const [result] = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, category, tag, author, image_url, read_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt, content, category, tag, author, image_url, read_time, status]
    );

    res.status(201).json({ success: true, id: result.insertId, slug });
  } catch (err) {
    console.error('Blog create error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── PUT /api/blogs/:id — Blog update (admin only) ────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = ['title', 'excerpt', 'content', 'category', 'tag', 'author', 'image_url', 'read_time', 'status'];
    const updates = [], params = [];

    fields.forEach(f => {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    });

    if (updates.length === 0) return res.status(400).json({ success: false, error: 'Kuch update karne ke liye nahi hai' });

    params.push(id);
    await pool.query(`UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'Blog update ho gaya' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── DELETE /api/blogs/:id — Blog delete (admin only) ─────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM blogs WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Blog delete ho gaya' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;