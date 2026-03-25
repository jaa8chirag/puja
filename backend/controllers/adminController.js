import db from "../config/db.js";
import jwt from "jsonwebtoken";
const otpStore = {}; // In-memory OTP store (phone: { otp, type, expires })
import pool from "../config/db.js";

// 1. Get All Contributions
export const getAllContributions = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM contribution_types ORDER BY id DESC",
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Add New
export const addContribution = async (req, res) => {
  const { name, price, is_active } = req.body;
  try {
    const sql =
      "INSERT INTO contribution_types (name, price, is_active) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [name, price, is_active ?? 1]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update
export const updateContribution = async (req, res) => {
  const { id } = req.params;
  const { name, price, is_active } = req.body;
  try {
    const sql =
      "UPDATE contribution_types SET name=?, price=?, is_active=? WHERE id=?";
    await db.query(sql, [name, price, is_active, id]);
    res.status(200).json({ success: true, message: "Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Delete
export const deleteContribution = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM contribution_types WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin sign-in with OTP
export const AdminLoginRequest = async (req, res) => {
  try {
    const { phone, role } = req.body;

    // Database mein check karein ki user hai aur uska role 'admin' hai
    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE phone = ? AND role = ?",
      [phone, role],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin account not found." });
    }

    // Role Strict Check: Agar role 'admin' nahi hai toh block karein
    if (rows[0].role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Only administrators can login here.",
      });
    }

    // Generate 6 Digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Store in memory (expires in 5 mins)
    otpStore[phone] = {
      otp,
      type: "ADMIN_LOGIN",
      expires: Date.now() + 5 * 60 * 1000,
    };

    // Logging for development (Sms gateway yaha integrate hoga)
    console.log(`\n--- ADMIN LOGIN OTP FOR ${phone}: ${otp} ---\n`);

    res.status(200).json({ message: "Admin OTP sent successfully" });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const AdminVerifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const session = otpStore[phone];

    // BYPASS LOGIC (Sirf testing ke liye)
    const isBypass = otp.toString() === "123456";

    // Validation: OTP match hona chahiye, type ADMIN_LOGIN hona chahiye aur expire nahi hona chahiye
    const isValidOtp =
      session &&
      session.type === "ADMIN_LOGIN" &&
      session.otp.toString() === otp.toString() &&
      Date.now() < session.expires;

    if (isBypass || isValidOtp) {
      // Fetch fresh admin details
      const [rows] = await db.query(
        "SELECT id, name, phone, email, role FROM users WHERE phone = ? AND role = 'admin'",
        [phone],
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "Admin authentication failed." });
      }

      // Session delete karein
      if (session) delete otpStore[phone];

      // Generate Admin JWT Token
      const token = jwt.sign(
        {
          id: rows[0].id,
          name: rows[0].name,
          phone: rows[0].phone,
          role: rows[0].role, // isme 'admin' value hogi
        },
        process.env.JWT_SECRET || "admin_secret_key", // Admin ke liye alag secret bhi use kar sakte hain
        { expiresIn: "1d" }, // Admin session security ke liye chota rakhein (e.g. 1 day)
      );

      res.status(200).json({
        message: isBypass
          ? "Admin Login success (Bypass)"
          : "Admin Login success",
        token,
        role: rows[0].role,
      });
    } else {
      res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("Admin Verify Error:", error);
    res.status(500).json({ message: "Admin verification failed" });
  }
};

// Admin Dashboard Stats show all activities

export const getDashboardStats = async (req, res) => {
  try {
    const [[stats]] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM puja_requests) as totalBookings,

        (SELECT COUNT(*) FROM puja_requests 
         WHERE DATE(created_at) = CURDATE()) as todayBookings,

        (SELECT COUNT(*) FROM puja_requests 
         WHERE status = 'pending') as totalPendingBookings,

        (SELECT COUNT(*) FROM puja_requests 
         WHERE status = 'accepted') as totalAcceptedBookings,

        (SELECT COUNT(*) FROM puja_requests 
         WHERE status = 'declined') as totalCancelledBookings,

        (SELECT COUNT(*) FROM puja_requests 
         WHERE status = 'completed') as totalCompletedBookings,

        (SELECT COUNT(*) FROM users 
         WHERE role='user') as totalUsers,

        (SELECT COUNT(*) FROM users 
         WHERE role='pandit') as totalPandits,

        -- Total Revenue (FROM total_price)
        (
          SELECT COALESCE(SUM(total_price),0)
          FROM puja_requests
          WHERE status='completed'
        ) as totalRevenue,

        -- Today Revenue
        (
          SELECT COALESCE(SUM(total_price),0)
          FROM puja_requests
          WHERE status='completed'
          AND DATE(completed_at) = CURDATE()
        ) as todayRevenue
    `);

    // Recent Bookings
    const [recentBookings] = await db.execute(`
    SELECT 
    pr.id,
    pr.bookingId,
    pr.status,
    pr.created_at,
    pr.total_price AS price,

    u.name AS user_name,
    u.phone,

    s.puja_name,

    p.name AS pandit_name,
    p.phone AS pandit_phone

  FROM puja_requests pr

  JOIN users u ON pr.user_id = u.id
  LEFT JOIN services s ON pr.service_id = s.id

  LEFT JOIN users p ON pr.pandit_id = p.id

  ORDER BY pr.created_at DESC
  LIMIT 10
`);

    res.json({
      success: true,
      ...stats,
      totalRevenue: stats.totalRevenue || 0,
      todayRevenue: stats.todayRevenue || 0,
      recentBookings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// Admin Dashboard show monthly growth chart
export const getMonthlyGrowthChart = async (req, res) => {
  try {
    const [rows] = await db.execute(`
  SELECT 
    DATE_FORMAT(CONCAT(year, '-', monthNumber, '-01'), '%b %Y') as month,
    totalBookings,
    totalRevenue
  FROM (
    SELECT 
      YEAR(pr.created_at) as year,
      MONTH(pr.created_at) as monthNumber,
      COUNT(pr.id) as totalBookings,
      SUM(
        CASE 
          WHEN pr.status = 'completed' 
          THEN sp.price 
          ELSE 0 
        END
      ) as totalRevenue
    FROM puja_requests pr
    LEFT JOIN service_prices sp 
      ON pr.service_id = sp.service_id
    WHERE pr.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY YEAR(pr.created_at), MONTH(pr.created_at)
  ) as monthlyData
  ORDER BY year, monthNumber
`);

    const months = [];
    const bookings = [];
    const revenue = [];

    rows.forEach((row) => {
      months.push(row.month);
      bookings.push(row.totalBookings);
      revenue.push(Number(row.totalRevenue || 0));
    });

    res.json({
      success: true,
      months,
      bookings,
      revenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// User Management, CRUD Operations of User
//========================================================================

// Get all users for admin dashboard

export const getAllUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.created_at,
        COUNT(pr.id) as total_bookings
      FROM users u
      LEFT JOIN puja_requests pr ON pr.user_id = u.id
      WHERE u.role='user'
      GROUP BY u.id
    `;

    const params = [];

    query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [users] = await db.execute(query, params);

    res.json({
      success: true,
      users,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
// create new user for admin dashboard (optional, since users can sign up themselves)
export const createUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    await db.execute(
      `INSERT INTO users (name, email, phone, role)
       VALUES (?, ?, ?, 'user')`,
      [name, email, phone],
    );

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};
// Get Single user details for admin dashboard
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await db.execute(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id=?",
      [id],
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// Update user details for admin dashboard
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    // Collect fields dynamically
    let fields = [];
    let values = [];

    if (name !== undefined) {
      fields.push("name=?");
      values.push(name);
    }

    if (email !== undefined) {
      fields.push("email=?");
      values.push(email);
    }

    if (phone !== undefined) {
      fields.push("phone=?");
      values.push(phone);
    }

    if (role !== undefined) {
      fields.push("role=?");
      values.push(role);
    }

    // If no field provided
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    // Add id at the end for WHERE clause
    values.push(id);

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id=?`;

    await db.execute(query, values);

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete user for admin dashboard
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot delete himself",
      });
    }

    await db.execute("DELETE FROM users WHERE id=?", [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// filter users by role for admin dashboard
export const filtarUsers = async (req, res) => {
  try {
    const { types } = req.params;

    const [users] = await db.execute(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE role=? ORDER BY created_at DESC",
      [types],
    );
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Users not found" });
    }
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

//===================================================================
// pandit management, CRUD operations of pandit
//========================================================================

// =====================================
// 1️⃣ Create Pandit
// =====================================

export const createPandit = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { name, email, phone, pandit_type, document_url } = req.body;

    if (!name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Name and phone are required" });
    }

    await connection.beginTransaction();

    // 1. Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (name, email, phone, role, is_blocked)
       VALUES (?, ?, ?, 'pandit', 0)`,
      [name, email || null, phone],
    );

    const newUserId = userResult.insertId;

    // 2. Insert into pandits table
    await connection.query(
      `INSERT INTO pandits (user_id, pandit_type, document_url)
       VALUES (?, ?, ?)`,
      [newUserId, pandit_type || null, document_url || null],
    );

    await connection.commit();
    res.json({ success: true, message: "Pandit registered successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// =====================================
// 2️⃣ Get All Pandits (Pagination + Search)
// =====================================

export const getAllPandits = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = `WHERE u.role='pandit'`;
    const params = [];

    if (search) {
      whereClause += ` AND (u.name LIKE ? OR u.phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params,
    );

    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.is_blocked, u.created_at,
        p.pandit_type, p.document_url
       FROM users u
       LEFT JOIN pandits p ON u.id = p.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    res.json({
      success: true,
      pandits: rows,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
// =====================================
// 3️⃣ Get Single Pandit
// =====================================

export const getSinglePandit = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pandit]] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.is_blocked, u.created_at,
        p.pandit_type, p.document_url
       FROM users u
       LEFT JOIN pandits p ON u.id = p.user_id
       WHERE u.id=? AND u.role='pandit'`,
      [id],
    );

    if (!pandit)
      return res
        .status(404)
        .json({ success: false, message: "Pandit not found" });

    res.json({ success: true, pandit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// =====================================
// 4️⃣ Update Pandit
// =====================================

export const updatePandit = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { name, email, phone, pandit_type, document_url } = req.body;

    await connection.beginTransaction();

    // 1. Update basic info in users
    await connection.query(
      `UPDATE users SET name=?, email=?, phone=? WHERE id=? AND role='pandit'`,
      [name, email, phone, id],
    );

    // 2. Update or Insert extended info in pandits
    await connection.query(
      `INSERT INTO pandits (user_id, pandit_type, document_url)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       pandit_type = VALUES(pandit_type), 
       document_url = VALUES(document_url)`,
      [id, pandit_type, document_url],
    );

    await connection.commit();
    res.json({ success: true, message: "Pandit updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false });
  } finally {
    connection.release();
  }
};

// panditController.js mein ye function add karein

export const getPanditBookingHistory = async (req, res) => {
  const { id } = req.params; // Pandit ki ID (User ID)

  try {
    const [rows] = await db.query(
      `SELECT 
        pr.id, 
        pr.preferred_date as booking_date, 
        pr.status,
        pr.total_price,
        s.puja_name, 
        u.name as customer_name
       FROM puja_requests pr
       LEFT JOIN services s ON pr.service_id = s.id
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.pandit_id = ? 
       ORDER BY pr.preferred_date DESC`,
      [id],
    );

    // Agar koi history nahi milti toh empty array jayega
    res.status(200).json(rows);
  } catch (error) {
    console.error("SQL ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

// =====================================
// 5️⃣ Block / Unblock Pandit
// =====================================

export const togglePanditBlock = async (req, res) => {
  try {
    const { id } = req.params;

    const [[pandit]] = await db.query(
      `SELECT is_blocked FROM users WHERE id=? AND role='pandit'`,
      [id],
    );

    if (!pandit) {
      return res.status(404).json({ success: false });
    }

    const newStatus = pandit.is_blocked ? 0 : 1;

    await db.query(`UPDATE users SET is_blocked=? WHERE id=?`, [newStatus, id]);

    res.json({
      success: true,
      message: newStatus
        ? "Pandit blocked successfully"
        : "Pandit unblocked successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// =====================================
// 6️⃣ Delete Pandit
// =====================================
export const deletePandit = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM users WHERE id=? AND role='pandit'`, [id]);

    res.json({
      success: true,
      message: "Pandit deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

//================= Service Management, CRUD operations of service =========================

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT s.*, sp.id AS price_id, sp.pricing_type, sp.price, t.about, t.address, t.dateOfStart
       FROM services s
       LEFT JOIN service_prices sp ON s.id = sp.service_id
       LEFT JOIN temples t ON s.id = t.service_id
       WHERE s.id = ?`,
      [id],
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    const service = {
      ...rows[0],
      prices: rows
        .filter((r) => r.price_id)
        .map((r) => ({
          price_id: r.price_id,
          pricing_type: r.pricing_type,
          price: r.price,
        })),
    };
    res.json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const { puja_type, category, search, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE 1=1`;
    const params = [];

    if (puja_type || category) {
      whereClause += ` AND s.puja_type = ?`;
      params.push(puja_type || category);
    }
    if (search) {
      whereClause += ` AND (s.puja_name LIKE ? OR t.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status && status !== "all") {
      whereClause += ` AND s.status = ?`;
      params.push(status);
    }

    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT s.id) as total FROM services s LEFT JOIN temples t ON s.id = t.service_id ${whereClause}`,
      params,
    );

    // UPDATED: Added s.priority and s.is_featured in SELECT and ORDER BY
    const [rows] = await db.query(
      `SELECT s.*, sp.id as price_id, sp.pricing_type, sp.price,
              t.about as temple_about, t.address as temple_address, t.dateOfStart as temple_date
       FROM services s
       LEFT JOIN service_prices sp ON s.id = sp.service_id
       LEFT JOIN temples t ON s.id = t.service_id
       ${whereClause}
       ORDER BY s.priority DESC, s.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const serviceMap = {};
    rows.forEach((row) => {
      if (!serviceMap[row.id]) {
        serviceMap[row.id] = {
          ...row,
          about: row.temple_about,
          address: row.temple_address,
          dateOfStart: row.temple_date,
          prices: [],
        };
        delete serviceMap[row.id].temple_about;
        delete serviceMap[row.id].temple_address;
        delete serviceMap[row.id].temple_date;
      }
      if (row.price_id) {
        serviceMap[row.id].prices.push({
          price_id: row.price_id,
          pricing_type: row.pricing_type,
          price: row.price,
        });
      }
    });

    res.json({
      success: true,
      totalServices: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit),
      services: Object.values(serviceMap),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createService = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      puja_name,
      puja_type,
      description,
      about,
      address,
      dateOfStart,
      status,
      priority, // New
      is_featured, // New
    } = req.body;

    const prices = JSON.parse(req.body.prices || "[]");
    const image_url = req.file ? `${req.file.filename}` : null;

    await connection.beginTransaction();

    // UPDATED: Added priority and is_featured in INSERT
    const [result] = await connection.query(
      `INSERT INTO services (puja_name, puja_type, description, image_url, status, priority, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        puja_name,
        puja_type,
        description,
        image_url,
        status || "active",
        priority || 0,
        is_featured || 0,
      ],
    );

    const serviceId = result.insertId;
    // ... rest of the code (prices and temple logic) remains same as yours
    for (let p of prices) {
      await connection.query(
        `INSERT INTO service_prices (service_id, pricing_type, price) VALUES (?, ?, ?)`,
        [serviceId, p.pricing_type, p.price],
      );
    }

    if (["temple_puja", "pind_dan"].includes(puja_type)) {
      await connection.query(
        `INSERT INTO temples (service_id, about, address, dateOfStart) VALUES (?, ?, ?, ?)`,
        [serviceId, about, address, dateOfStart],
      );
    }

    await connection.commit();
    res.json({ success: true, serviceId });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
};

export const updateService = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    let {
      puja_name,
      puja_type,
      description,
      prices,
      status,
      about,
      address,
      dateOfStart,
      priority, // Naya field
      is_featured, // Naya field
    } = req.body;

    if (typeof prices === "string") prices = JSON.parse(prices);

    await connection.beginTransaction();
    let image_url = req.file ? `${req.file.filename}` : null;

    // 1. Update Services Table (Dynamic Fields)
    const fields = [];
    const vals = [];

    if (puja_name) {
      fields.push("puja_name=?");
      vals.push(puja_name);
    }
    if (puja_type) {
      fields.push("puja_type=?");
      vals.push(puja_type);
    }
    if (description) {
      fields.push("description=?");
      vals.push(description);
    }
    if (status) {
      fields.push("status=?");
      vals.push(status);
    }
    if (image_url) {
      fields.push("image_url=?");
      vals.push(image_url);
    }

    // Priority aur is_featured ko check kar rahe hain (0 bhi valid value ho sakti hai isliye undefined check kiya hai)
    if (priority !== undefined) {
      fields.push("priority=?");
      vals.push(priority);
    }
    if (is_featured !== undefined) {
      fields.push("is_featured=?");
      vals.push(is_featured);
    }

    if (fields.length > 0) {
      vals.push(id);
      await connection.query(
        `UPDATE services SET ${fields.join(", ")} WHERE id=?`,
        vals,
      );
    }

    // 2. Update Prices (Delete old and Insert new)
    if (Array.isArray(prices)) {
      await connection.query(`DELETE FROM service_prices WHERE service_id=?`, [
        id,
      ]);
      for (let p of prices) {
        await connection.query(
          `INSERT INTO service_prices (service_id, pricing_type, price) VALUES (?, ?, ?)`,
          [id, p.pricing_type, p.price],
        );
      }
    }

    // 3. Update/Insert Temple Details
    // Agar puja_type change hokar temple_puja/pind_dan hua hai toh check karenge
    if (["temple_puja", "pind_dan"].includes(puja_type)) {
      const [exists] = await connection.query(
        `SELECT id FROM temples WHERE service_id=?`,
        [id],
      );
      if (exists.length > 0) {
        await connection.query(
          `UPDATE temples SET about=?, address=?, dateOfStart=? WHERE service_id=?`,
          [about || null, address || null, dateOfStart || null, id],
        );
      } else {
        await connection.query(
          `INSERT INTO temples (service_id, about, address, dateOfStart) VALUES (?, ?, ?, ?)`,
          [id, about, address, dateOfStart],
        );
      }
    } else if (puja_type) {
      // Agar puja_type change hokar simple puja ban gaya hai toh temple details delete kar denge
      await connection.query(`DELETE FROM temples WHERE service_id=?`, [id]);
    }

    await connection.commit();
    res.json({
      success: true,
      message: "Service updated successfully with priority",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
};

//delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM service_prices WHERE service_id=?`, [id]);
    await db.query(`DELETE FROM temples WHERE service_id=?`, [id]);
    await db.query(`DELETE FROM services WHERE id=?`, [id]);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

//===== Booking Services=========

// Get all bookings for admin dashboard with filter and search
// GET /admin/bookings?status=pending
// GET /admin/bookings?date=2026-02-23
// GET /admin/bookings?search=BK123
// GET /admin/bookings?page=1&limit=10

export const getAllBookings = async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const params = [];
    let whereClause = "WHERE 1=1";

    if (status) {
      whereClause += " AND pr.status=?";
      params.push(status);
    }

    if (date) {
      whereClause += " AND pr.preferred_date=?";
      params.push(date);
    }

    if (search) {
      whereClause += " AND pr.bookingId LIKE ?";
      params.push(`%${search}%`);
    }

    // Total count
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM puja_requests pr ${whereClause}`,
      params,
    );

    const totalPages = Math.ceil(total / limit);

    // Actual bookings
    const [rows] = await db.query(
      `
      SELECT 
        pr.*,
        u.name AS user_name,
        u.phone AS user_phone,
        s.puja_name,
        s.puja_type,
        COALESCE(p.name, 'Not Assigned') AS pandit_name
      FROM puja_requests pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN services s ON pr.service_id = s.id
      LEFT JOIN users p ON pr.pandit_id = p.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    res.json({
      success: true,
      bookings: rows,
      currentPage: page,
      totalPages,
      totalBookings: rows.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// get single booking details for admin dashboard
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        pr.*,

        u.name AS user_name,
        u.email,
        u.phone,
        s.puja_name,
        s.puja_type,
        p.name AS pandit_name
      FROM puja_requests pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN services s ON pr.service_id = s.id
      LEFT JOIN users p ON pr.pandit_id = p.id
      WHERE pr.bookingId = ?
    `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      booking: rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// today booking details
export const getTodayBookings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pr.*,
        u.name AS user_name,
        s.puja_name
      FROM puja_requests pr
      LEFT JOIN users u ON pr.user_id = u.id
      LEFT JOIN services s ON pr.service_id = s.id
      LEFT JOIN service_prices sp 
        ON pr.service_id = sp.service_id
        AND pr.ticket_type = sp.pricing_type
      WHERE DATE(pr.completed_at)=CURDATE()
      ORDER BY pr.completed_at DESC
    `);

    res.json({
      success: true,
      totalTodayBookings: rows.length, // ✅ count added
      bookings: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

// Finance
// ─────────────────────────────────────────────
// 1. DASHBOARD SUMMARY (Top KPI Cards)
// ─────────────────────────────────────────────
export const getDashboardSummary = async (req, res) => {
  try {
    // Total Revenue (completed bookings)
    const [totalRevenue] = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) AS total_revenue
      FROM puja_requests
      WHERE status = 'completed'
    `);

    // Total Bookings
    const [totalBookings] = await db.query(`
      SELECT COUNT(*) AS total_bookings FROM puja_requests
    `);

    // Bookings by status
    const [statusCounts] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM puja_requests
      GROUP BY status
    `);

    // Total Donations (service_contributions)
    const [totalDonations] = await db.query(`
  SELECT COALESCE(SUM(CAST(donations AS UNSIGNED)), 0) AS total_donations
  FROM puja_requests
  WHERE donations IS NOT NULL
    AND donations != ''
    AND donations != '0'
    AND donations REGEXP '^[0-9]+$'
    AND status = 'completed'
`);

    // Total Users (role = 'user')
    const [totalUsers] = await db.query(`
      SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'
    `);

    // Total Pandits
    const [totalPandits] = await db.query(`
      SELECT COUNT(*) AS total_pandits FROM users WHERE role = 'pandit'
    `);

    // Today's Revenue
    const [todayRevenue] = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) AS today_revenue
      FROM puja_requests
      WHERE status = 'completed'
        AND DATE(completed_at) = CURDATE()
    `);

    // This Month Revenue
    const [monthRevenue] = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) AS month_revenue
      FROM puja_requests
      WHERE status = 'completed'
        AND MONTH(completed_at) = MONTH(CURDATE())
        AND YEAR(completed_at) = YEAR(CURDATE())
    `);

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue[0].total_revenue,
        total_donations: totalDonations[0].total_donations,
        total_bookings: totalBookings[0].total_bookings,
        today_revenue: todayRevenue[0].today_revenue,
        month_revenue: monthRevenue[0].month_revenue,
        total_users: totalUsers[0].total_users,
        total_pandits: totalPandits[0].total_pandits,
        booking_status: statusCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 2. MONTHLY REVENUE TREND (Last 12 Months)
// ─────────────────────────────────────────────
export const getMonthlyRevenue = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        DATE_FORMAT(completed_at, '%Y-%m') AS month,
        COALESCE(SUM(total_price), 0)      AS revenue,
        COUNT(*)                            AS bookings
      FROM puja_requests
      WHERE status = 'completed'
        AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(completed_at, '%Y-%m')
      ORDER BY month ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 3. REVENUE BY SERVICE TYPE
// ─────────────────────────────────────────────
export const getRevenueByServiceType = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        s.puja_type,
        COUNT(pr.id)                       AS total_bookings,
        COALESCE(SUM(pr.total_price), 0)   AS revenue
      FROM puja_requests pr
      JOIN services s ON pr.service_id = s.id
      WHERE pr.status = 'completed'
      GROUP BY s.puja_type
      ORDER BY revenue DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 4. TOP PERFORMING SERVICES (by Revenue)
// ─────────────────────────────────────────────
export const getTopServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [rows] = await db.query(
      `
      SELECT
        s.id,
        s.puja_name,
        s.puja_type,
        COUNT(pr.id)                     AS total_bookings,
        COALESCE(SUM(pr.total_price), 0) AS total_revenue
      FROM puja_requests pr
      JOIN services s ON pr.service_id = s.id
      WHERE pr.status = 'completed'
      GROUP BY s.id, s.puja_name, s.puja_type
      ORDER BY total_revenue DESC
      LIMIT ?
    `,
      [limit],
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. DONATION BREAKDOWN (by Contribution Type)
// ─────────────────────────────────────────────
export const getDonationBreakdown = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ct.name                          AS donation_type,
        COUNT(sc.id)                     AS count,
        COALESCE(SUM(sc.amount), 0)      AS total_amount
      FROM service_contributions sc
      JOIN contribution_types ct ON sc.contribution_type_id = ct.id
      JOIN puja_requests pr ON sc.puja_request_id = pr.id
      WHERE pr.status = 'completed'
      GROUP BY ct.id, ct.name
      ORDER BY total_amount DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 6. SAMAGRI KIT REVENUE
// ─────────────────────────────────────────────
export const getSamagriKitRevenue = async (req, res) => {
  try {
    const SAMAGRI_PRICE = 600; // from contribution_types table

    const [rows] = await db.query(`
      SELECT
        COUNT(*)                              AS total_kits_sold,
        COUNT(*) * ${SAMAGRI_PRICE}           AS samagri_revenue
      FROM puja_requests
      WHERE samagrikit = 1 AND status = 'completed'
    `);

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 7. REVENUE BY CITY (Top Cities)
// ─────────────────────────────────────────────
export const getRevenueByCity = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        city,
        COUNT(*)                         AS bookings,
        COALESCE(SUM(total_price), 0)    AS revenue
      FROM puja_requests
      WHERE status = 'completed'
        AND city NOT IN ('N/A', 'default city', 'Default City', 'defalut city')
      GROUP BY city
      ORDER BY revenue DESC
      LIMIT 10
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 8. RECENT TRANSACTIONS (Paginated)
// ─────────────────────────────────────────────
export const getRecentTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [rows] = await db.query(
      `
      SELECT
        pr.id,
        pr.bookingId,
        u.name        AS user_name,
        u.phone,
        s.puja_name,
        s.puja_type,
        pr.city,
        pr.state,
        pr.status,
        pr.total_price,
        pr.samagrikit,
        pr.donations,
        pr.created_at,
        pr.completed_at
      FROM puja_requests pr
      JOIN users u    ON pr.user_id    = u.id
      JOIN services s ON pr.service_id = s.id
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM puja_requests`,
    );

    res.json({
      success: true,
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 9. PANDIT EARNINGS (per Pandit)
// ─────────────────────────────────────────────
export const getPanditEarnings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id          AS pandit_id,
        u.name        AS pandit_name,
        u.phone,
        COUNT(pr.id)                     AS completed_pujas,
        COALESCE(SUM(pr.total_price), 0) AS total_earned
      FROM users u
      LEFT JOIN puja_requests pr
        ON pr.pandit_id = u.id AND pr.status = 'completed'
      WHERE u.role = 'pandit'
      GROUP BY u.id, u.name, u.phone
      ORDER BY total_earned DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────
// 10. DATE RANGE FILTER (Custom Report)
// ─────────────────────────────────────────────
export const getRevenueByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query; // ?from=2026-02-01&to=2026-03-03

    if (!from || !to)
      return res
        .status(400)
        .json({ success: false, message: "from aur to date required hai" });

    const [rows] = await db.query(
      `
      SELECT
        DATE(created_at)                 AS date,
        COUNT(*)                         AS bookings,
        COALESCE(SUM(total_price), 0)    AS revenue,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)  AS completed,
        SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END)  AS pending,
        SUM(CASE WHEN status = 'declined'  THEN 1 ELSE 0 END)  AS declined
      FROM puja_requests
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `,
      [from, to],
    );

    const [[summary]] = await db.query(
      `
      SELECT
        COALESCE(SUM(total_price), 0) AS total_revenue,
        COUNT(*)                      AS total_bookings
      FROM puja_requests
      WHERE status = 'completed'
        AND DATE(created_at) BETWEEN ? AND ?
    `,
      [from, to],
    );

    res.json({ success: true, summary, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//===========Analytics=========

export const getGodViewAnalytics = async (req, res) => {
  try {
    // 1. Total Revenue (only completed bookings)
    const [totalRevenueResult] = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) AS total_revenue
      FROM puja_requests
      WHERE status = 'completed'
    `);

    // 2. Completed Bookings Count
    const [completedBookingsResult] = await db.query(`
      SELECT COUNT(*) AS completed_bookings
      FROM puja_requests
      WHERE status = 'completed'
    `);

    // 3. Active Pandits (distinct pandits who have accepted or completed bookings)
    const [activePanditsResult] = await db.query(`
      SELECT COUNT(DISTINCT pandit_id) AS active_pandits
      FROM puja_requests
      WHERE status IN ('accepted', 'completed')
      AND pandit_id IS NOT NULL
    `);

    // 4. Average Order Value (completed bookings)
    const [avgOrderResult] = await db.query(`
      SELECT COALESCE(AVG(total_price), 0) AS avg_order_value
      FROM puja_requests
      WHERE status = 'completed'
    `);

    // 5. Revenue Last 7 Days (day-wise)
    const [revenueLastWeek] = await db.query(`
      SELECT
        DATE(created_at) AS date,
        COALESCE(SUM(total_price), 0) AS revenue,
        COUNT(*) AS bookings
      FROM puja_requests
      WHERE
        status = 'completed'
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Fill missing days with 0 (last 7 days complete)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const found = revenueLastWeek.find((r) => {
        const rd = new Date(r.date).toISOString().split("T")[0];
        return rd === dateStr;
      });
      last7Days.push({
        date: dateStr,
        revenue: found ? Number(found.revenue) : 0,
        bookings: found ? Number(found.bookings) : 0,
      });
    }

    // 6. Top 5 Performing Pujas (most booked services)
    const [topPujas] = await db.query(`
      SELECT
        s.id AS service_id,
        s.puja_name,
        s.puja_type,
        COUNT(pr.id) AS total_bookings
      FROM puja_requests pr
      JOIN services s ON pr.service_id = s.id
      GROUP BY s.id, s.puja_name, s.puja_type
      ORDER BY total_bookings DESC
      LIMIT 5
    `);

    // 7. Most Active Cities (from puja_requests.city)
    const [activeCities] = await db.query(`
      SELECT
        city,
        COUNT(*) AS total_bookings
      FROM puja_requests
      WHERE city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY total_bookings DESC
      LIMIT 5
    `);

    // Final Response
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_revenue: Number(totalRevenueResult[0].total_revenue),
          completed_bookings: Number(
            completedBookingsResult[0].completed_bookings,
          ),
          active_pandits: Number(activePanditsResult[0].active_pandits),
          avg_order_value: Math.round(
            Number(avgOrderResult[0].avg_order_value),
          ),
        },
        revenue_last_7_days: last7Days,
        top_pujas: topPujas.map((p, index) => ({
          rank: index + 1,
          service_id: p.service_id,
          puja_name: p.puja_name,
          puja_type: p.puja_type,
          total_bookings: Number(p.total_bookings),
        })),
        most_active_cities: activeCities.map((c) => ({
          city: c.city,
          total_bookings: Number(c.total_bookings),
        })),
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Analytics data fetch karne mein error aaya",
      error: error.message,
    });
  }
};

// ══════════════════════════════════════════════════════════════
// BLOGS — Admin Controller Functions
// Yeh sab adminController.js ke END mein paste karo
// (import pool mat karna — already hoga upar)
// ══════════════════════════════════════════════════════════════

// GET /api/admin/blogs
export const adminGetAllBlogs = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT id, title, slug, category, tag, author, image_url,
                        read_time, status, views, created_at, updated_at
                 FROM blogs WHERE 1=1`;
    const params = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }
    if (category) {
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

    // Total count
    let countQ = `SELECT COUNT(*) as total FROM blogs WHERE 1=1`;
    const countP = [];
    if (status) {
      countQ += ` AND status = ?`;
      countP.push(status);
    }
    if (category) {
      countQ += ` AND category = ?`;
      countP.push(category);
    }
    if (search) {
      countQ += ` AND (title LIKE ? OR excerpt LIKE ?)`;
      countP.push(`%${search}%`, `%${search}%`);
    }
    const [[{ total }]] = await pool.query(countQ, countP);

    // Stats cards ke liye
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*)                  AS total,
        SUM(status = 'published') AS published,
        SUM(status = 'draft')     AS drafts,
        SUM(views)                AS total_views
      FROM blogs
    `);

    res.json({
      success: true,
      blogs,
      total,
      stats,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    console.error("adminGetAllBlogs:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/admin/blogs/:id
export const adminGetBlogById = async (req, res) => {
  try {
    const [[blog]] = await pool.query(`SELECT * FROM blogs WHERE id = ?`, [
      req.params.id,
    ]);
    if (!blog)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/admin/blogs
export const adminCreateBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      category,
      tag,
      author,
      read_time,
      status = "draft",
    } = req.body;

    if (!title || !content)
      return res
        .status(400)
        .json({ success: false, error: "Title aur content zaroori hai" });

    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120);

    const image_url = req.file ? req.file.filename : null;

    const [result] = await pool.query(
      `INSERT INTO blogs (title, slug, excerpt, content, category, tag, author, image_url, read_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt || null,
        content,
        category || null,
        tag || null,
        author || null,
        image_url,
        read_time || "5 min",
        status,
      ],
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      slug,
      message: "Blog create ho gaya",
    });
  } catch (err) {
    console.error("adminCreateBlog:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({
        success: false,
        error: "Is title ka blog already exist karta hai",
      });
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/admin/blogs/:id
export const adminUpdateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const [[existing]] = await pool.query(`SELECT * FROM blogs WHERE id = ?`, [
      id,
    ]);
    if (!existing)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });

    const {
      title,
      excerpt,
      content,
      category,
      tag,
      author,
      read_time,
      status,
    } = req.body;
    const image_url = req.file ? req.file.filename : existing.image_url;
    const slug = title
      ? title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 120)
      : existing.slug;

    await pool.query(
      `UPDATE blogs SET title=?, slug=?, excerpt=?, content=?, category=?,
                        tag=?, author=?, image_url=?, read_time=?, status=?
       WHERE id = ?`,
      [
        title || existing.title,
        slug,
        excerpt ?? existing.excerpt,
        content || existing.content,
        category ?? existing.category,
        tag ?? existing.tag,
        author ?? existing.author,
        image_url,
        read_time || existing.read_time,
        status || existing.status,
        id,
      ],
    );

    res.json({ success: true, message: "Blog update ho gaya" });
  } catch (err) {
    console.error("adminUpdateBlog:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/admin/blogs/:id
export const adminDeleteBlog = async (req, res) => {
  try {
    const [[blog]] = await pool.query(`SELECT id FROM blogs WHERE id = ?`, [
      req.params.id,
    ]);
    if (!blog)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });
    await pool.query(`DELETE FROM blogs WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: "Blog delete ho gaya" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/blogs/:id/status  — Published ↔ Draft toggle
export const adminToggleBlogStatus = async (req, res) => {
  try {
    const [[blog]] = await pool.query(
      `SELECT id, status FROM blogs WHERE id = ?`,
      [req.params.id],
    );
    if (!blog)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });

    const newStatus = blog.status === "published" ? "draft" : "published";
    await pool.query(`UPDATE blogs SET status = ? WHERE id = ?`, [
      newStatus,
      req.params.id,
    ]);

    res.json({
      success: true,
      status: newStatus,
      message: `Blog ${newStatus} ho gaya`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["pending", "accepted", "declined", "completed"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const [result] = await db.query(
      `UPDATE puja_requests SET status = ? WHERE id = ?`,
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ═══════════════════════════════════════════════════════════
// BENEFITS MANAGEMENT
// ═══════════════════════════════════════════════════════════

// Create Benefit
export const createBenefit = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Benefit name required hai",
      });
    }

    // Check if service exists
    const [[service]] = await db.query(`SELECT id FROM services WHERE id = ?`, [
      serviceId,
    ]);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service nahi mili",
      });
    }

    const [result] = await db.query(
      `INSERT INTO benefits (service_id, name, description) 
       VALUES (?, ?, ?)`,
      [serviceId, name, description || null],
    );

    res.status(201).json({
      success: true,
      message: "Benefit add ho gaya",
      benefitId: result.insertId,
    });
  } catch (error) {
    console.error("Create Benefit Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Benefits by Service
export const getBenefitsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const [benefits] = await db.query(
      `SELECT id, name, description, created_at 
       FROM benefits 
       WHERE service_id = ? 
       ORDER BY created_at DESC`,
      [serviceId],
    );

    res.json({
      success: true,
      benefits,
    });
  } catch (error) {
    console.error("Get Benefits Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Benefit
export const updateBenefit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }

    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Koi field update karne ke liye nahi mili",
      });
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE benefits SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Benefit nahi mila",
      });
    }

    res.json({
      success: true,
      message: "Benefit update ho gaya",
    });
  } catch (error) {
    console.error("Update Benefit Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Benefit
export const deleteBenefit = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(`DELETE FROM benefits WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Benefit nahi mila",
      });
    }

    res.json({
      success: true,
      message: "Benefit delete ho gaya",
    });
  } catch (error) {
    console.error("Delete Benefit Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
