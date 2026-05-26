import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// 2. Add New - description add karo
export const addContribution = async (req, res) => {
  const { name, price, is_active, description } = req.body;
  try {
    const sql =
      "INSERT INTO contribution_types (name, price, is_active, description) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      name,
      price,
      is_active ?? 1,
      description || "",
    ]);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Update - description add karo
export const updateContribution = async (req, res) => {
  const { id } = req.params;
  const { name, price, is_active, description } = req.body;
  try {
    const sql =
      "UPDATE contribution_types SET name=?, price=?, is_active=?, description=? WHERE id=?";
    await db.query(sql, [name, price, is_active, description || "", id]);
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

// Admin Login (Password Based)
export const AdminLogin = async (req, res) => {
  try {
    const { phone, country_code, password } = req.body;
    const isEmail = phone && phone.includes("@");

    if (!phone || !password) {
      return res.status(400).json({ message: "Email/Phone and Password are required" });
    }

    let rows;
    if (isEmail) {
      [rows] = await db.query(
        "SELECT * FROM users WHERE email = ? AND (role = 'admin' OR role = 'superAdmin') AND is_deleted = 0",
        [phone],
      );
    } else {
      [rows] = await db.query(
        "SELECT * FROM users WHERE phone = ? AND (country_code = ? OR country_code IS NULL) AND (role = 'admin' OR role = 'superAdmin') AND is_deleted = 0",
        [phone, country_code || "+91"],
      );
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "Admin account not found with this Email or Phone." });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "90d" },
    );

    res.status(200).json({
      message: "Admin Login success",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
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
         WHERE status IN ('declined', 'cancelled')) as totalCancelledBookings,

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
    pr.paid_amount,

    u.name AS user_name,
    u.phone,

    s.puja_name,

    p.name AS pandit_name,
    p.phone AS pandit_phone,
    (SELECT GROUP_CONCAT(ct.name SEPARATOR ', ') 
     FROM service_contributions sc 
     JOIN contribution_types ct ON sc.contribution_type_id = ct.id 
     WHERE sc.puja_request_id = pr.id) as contribution_names

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
    const search = req.query.search || "";
    const role = req.query.role || "all";
    const offset = (page - 1) * limit;

    let whereClause = "WHERE u.role != 'pandit' AND u.is_deleted = 0";
    const params = [];

    if (role !== "all") {
      whereClause += " AND u.role = ?";
      params.push(role);
    }

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // ✅ Total count with filters
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      params
    );

    // ✅ Get users with filters and pagination
    const [users] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.phone, u.country_code, u.role, u.created_at,
        COUNT(pr.id) as total_bookings
       FROM users u
       LEFT JOIN puja_requests pr ON pr.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      users,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("getAllUsers Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single user
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

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, country_code, role } = req.body;
    const requesterRole = req.user.role;

    // Check if target user is superadmin
    // Security check: Only superAdmin can modify another superAdmin
    const [[targetUser]] = await db.execute("SELECT role FROM users WHERE id = ?", [id]);
    if (targetUser && targetUser.role === 'superAdmin' && requesterRole !== 'superAdmin') {
      return res.status(403).json({ success: false, message: "Only SuperAdmin can modify another SuperAdmin." });
    }

    const fields = [];
    const values = [];

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
    if (country_code !== undefined) {
      fields.push("country_code=?");
      values.push(country_code);
    }

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      fields.push("password=?");
      values.push(hashedPassword);
    }

    // ✅ Role validate karke update karo
    if (role !== undefined) {
      const allowedRoles = ["user", "admin", "superAdmin", "customerCare"];
      if (!allowedRoles.includes(role)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid role" });
      }

      // Only superAdmin can promote someone to superAdmin
      if (role === 'superAdmin' && requesterRole !== 'superAdmin') {
        return res.status(403).json({ success: false, message: "Only SuperAdmin can assign SuperAdmin role." });
      }

      fields.push("role=?");
      values.push(role);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    values.push(id);
    await db.execute(
      `UPDATE users SET ${fields.join(", ")} WHERE id=?`,
      values,
    );

    res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterRole = req.user.role;

    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete yourself",
      });
    }

    // Check if target user is superAdmin
    const [[targetUser]] = await db.execute("SELECT role FROM users WHERE id = ?", [id]);
    if (targetUser && targetUser.role === 'superAdmin' && requesterRole !== 'superAdmin') {
      return res.status(403).json({ success: false, message: "Only SuperAdmin can delete a SuperAdmin." });
    }

    await db.execute("UPDATE users SET is_deleted = 1 WHERE id=?", [id]);

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, phone, country_code, password, role } = req.body;
    const requesterRole = req.user.role;

    if (!name || !phone || !password || !role) {
      console.log("adminCreateUser 400: All fields are required. Body:", req.body);
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      console.log("adminCreateUser 400: Password must be at least 6 characters long");
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    // Security: Only superAdmin can create another superAdmin
    if (role === 'superAdmin') {
      if (requesterRole !== 'superAdmin') {
        return res.status(403).json({ success: false, message: "Only SuperAdmin can create another SuperAdmin." });
      }
    }

    // Check if user already exists
    const [existing] = await db.execute("SELECT id FROM users WHERE phone = ? AND (country_code = ? OR country_code IS NULL)", [phone, country_code || "+91"]);
    if (existing.length > 0) {
      console.log("adminCreateUser 400: User with this phone and country code already exists", phone);
      return res.status(400).json({ success: false, message: "User with this phone and country code already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      "INSERT INTO users (name, email, phone, country_code, password, role, is_verified) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [name, email || null, phone, country_code || "+91", hashedPassword, role]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      userId: result.insertId
    });
  } catch (error) {
    console.error("Admin Create User Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Filter users by role
export const filtarUsers = async (req, res) => {
  try {
    const { types } = req.params;

    const allowedRoles = ["user", "admin", "superAdmin", "customerCare"];
    if (!allowedRoles.includes(types)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

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
    const {
      name,
      email,
      phone,
      country_code,
      pandit_type,
      gotra,
      // Address fields
      address,
      city,
      state,
      pincode,
      // Payment fields
      paymentMethod,
      accountHolderName,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
    } = req.body;
    const document_url = req.file ? req.file.path : null;
    if (!name || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Name and phone are required" });
    }

    await connection.beginTransaction();

    // 1. Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (name,gotra, email, phone, country_code, role, is_blocked)
       VALUES (?, ?, ?, ?, ?, 'pandit', 0)`,
      [name, gotra, email || null, phone, country_code || "+91"],
    );

    const newUserId = userResult.insertId;

    // 2. Insert into pandits table
    await connection.query(
      `INSERT INTO pandits (user_id, pandit_type, document_url)
       VALUES (?, ?, ?)`,
      [newUserId, pandit_type || null, document_url || null],
    );

    // 3. Insert Address (if provided)
    if (address && city && state) {
      await connection.query(
        `INSERT INTO addresses
         (user_id, address_line1, city, state, address_type, pincode, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newUserId, address, city, state, "home", pincode || null, 1],
      );
    }

    // 4. Insert Payment Details (if provided)
    if (paymentMethod && ["bank", "upi"].includes(paymentMethod)) {
      await connection.query(
        `INSERT INTO partner_payment_details
         (user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newUserId,
          paymentMethod,
          accountHolderName || null,
          bankName || null,
          bankAccountNumber || null,
          ifscCode ? ifscCode.toUpperCase() : null,
          upiId || null,
        ],
      );
    }

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

    let whereClause = `WHERE u.role='pandit' AND u.is_deleted = 0`;
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
         u.id, u.name, u.email, u.phone, u.country_code, u.is_blocked, u.created_at,
         p.pandit_type, p.document_url,
         ppd.id as payment_id,
         ppd.payment_method,
         ppd.account_holder_name,
         ppd.bank_name,
         ppd.bank_account_number,
         ppd.ifsc_code,
         ppd.upi_id,
         ppd.is_active as payment_is_active,
         ppd.is_verified as payment_is_verified,
         ppd.verified_at as payment_verified_at,
         a.address_line1 as address,
         a.city,
         a.state,
         a.pincode
        FROM users u
        LEFT JOIN pandits p ON u.id = p.user_id
        LEFT JOIN partner_payment_details ppd ON u.id = ppd.user_id AND ppd.is_active = 1
        LEFT JOIN addresses a ON u.id = a.user_id AND a.is_default = 1
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
    const {
      name,
      email,
      phone,
      country_code,
      pandit_type,
      document_url,
      // Address fields
      address,
      city,
      state,
      pincode,
      // Payment fields
      paymentMethod,
      accountHolderName,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
    } = req.body;

    await connection.beginTransaction();

    // 1. Update basic info in users
    await connection.query(
      `UPDATE users SET name=?, email=?, phone=?, country_code=? WHERE id=? AND role='pandit'`,
      [name, email, phone, country_code || "+91", id],
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

    // 3. Update Address
    if (address && city && state) {
      await connection.query(
        `INSERT INTO addresses
         (user_id, address_line1, city, state, address_type, pincode, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         address_line1 = VALUES(address_line1),
         city = VALUES(city),
         state = VALUES(state),
         pincode = VALUES(pincode)`,
        [id, address, city, state, "home", pincode || null, 1],
      );
    }

    // 4. Update Payment Details
    if (paymentMethod && ["bank", "upi"].includes(paymentMethod)) {
      await connection.query(
        `INSERT INTO partner_payment_details
         (user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
         payment_method = VALUES(payment_method),
         account_holder_name = VALUES(account_holder_name),
         bank_name = VALUES(bank_name),
         bank_account_number = VALUES(bank_account_number),
         ifsc_code = VALUES(ifsc_code),
         upi_id = VALUES(upi_id),
         is_active = 1`,
        [
          id,
          paymentMethod,
          accountHolderName || null,
          bankName || null,
          bankAccountNumber || null,
          ifscCode ? ifscCode.toUpperCase() : null,
          upiId || null,
        ],
      );
    }

    await connection.commit();
    res.json({ success: true, message: "Pandit updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
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
        u.name as customer_name,
        (SELECT GROUP_CONCAT(ct.name SEPARATOR ', ') 
         FROM service_contributions sc 
         JOIN contribution_types ct ON sc.contribution_type_id = ct.id 
         WHERE sc.puja_request_id = pr.id) as contribution_names
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

    await db.query(`UPDATE users SET is_deleted = 1 WHERE id=? AND role='pandit'`, [id]);

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
       WHERE s.id = ? AND s.is_deleted = 0`,
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
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    let whereClause = `WHERE s.is_deleted = 0`;
    const params = [];

    // Category/puja_type filter
    if (puja_type || category) {
      whereClause += ` AND s.puja_type = ?`;
      params.push(puja_type || category);
    }

    // Search filter
    if (search) {
      whereClause += ` AND (s.puja_name LIKE ? OR t.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Status filter
    if (status && status !== "all") {
      whereClause += ` AND s.status = ?`;
      params.push(status);
    }

    // ✅ Count total services
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT s.id) as total 
       FROM services s 
       LEFT JOIN temples t ON s.id = t.service_id
       ${whereClause}`,
      params,
    );

    // ✅ Step 1: Get paginated service IDs with ORDER BY columns included
    const [serviceIds] = await db.query(
      `SELECT s.id, s.is_featured, s.priority, s.created_at, s.updated_at, s.updated_by
       FROM services s
       LEFT JOIN temples t ON s.id = t.service_id
       ${whereClause}
       GROUP BY s.id, s.is_featured, s.priority, s.created_at, s.updated_at, s.updated_by
       ORDER BY s.is_featured DESC, s.priority DESC, s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    // Agar koi service nahi mili
    if (serviceIds.length === 0) {
      return res.json({
        success: true,
        totalServices: 0,
        totalPages: 0,
        services: [],
      });
    }

    // ✅ Step 2: Get full details for these service IDs
    const ids = serviceIds.map((row) => row.id);
    const placeholders = ids.map(() => "?").join(",");

    const [rows] = await db.query(
      `SELECT s.*, 
              sp.id as price_id, 
              sp.pricing_type, 
              sp.price,
              t.about, 
              t.address, 
              t.dateOfStart
       FROM services s
       LEFT JOIN service_prices sp ON s.id = sp.service_id
       LEFT JOIN temples t ON s.id = t.service_id
       WHERE s.id IN (${placeholders})
       ORDER BY 
         FIELD(s.id, ${placeholders}),
         sp.id`,
      [...ids, ...ids], // ids ko 2 baar pass karna padega (FIELD aur WHERE dono ke liye)
    );

    // ✅ Group by service ID
    const serviceMap = {};
    rows.forEach((row) => {
      if (!serviceMap[row.id]) {
        serviceMap[row.id] = {
          ...row, // Copy all database fields
          prices: [], // Initialize prices array
        };
      }
      if (row.price_id) {
        serviceMap[row.id].prices.push({
          price_id: row.price_id,
          pricing_type: row.pricing_type,
          price: row.price,
        });
      }
    });

    // ✅ Maintain original order from Step 1
    const orderedServices = ids.map((id) => serviceMap[id]).filter(Boolean);

    res.json({
      success: true,
      totalServices: countResult[0].total,
      totalPages: Math.ceil(countResult[0].total / limit),
      services: orderedServices,
    });
  } catch (error) {
    console.error("getAllServices Error:", error);
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
        status !== undefined && status !== null && status !== "" ? status : "active",
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
    if (status !== undefined) {
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

    // Always update modified info
    fields.push("updated_by=?");
    vals.push(req.admin?.name || "admin");

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

export const deleteService = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    await db.query(`UPDATE services SET is_deleted = 1 WHERE id = ?`, [id]);
    res.json({ success: true, message: "Service deleted successfully (Soft Delete)" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Delete Service Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
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
        COALESCE(p.name, 'Not Assigned') AS pandit_name,
        (SELECT GROUP_CONCAT(ct.name SEPARATOR ', ') 
         FROM service_contributions sc 
         JOIN contribution_types ct ON sc.contribution_type_id = ct.id 
         WHERE sc.puja_request_id = pr.id) as contribution_names,
        (SELECT GROUP_CONCAT(CONCAT(ct.name, '::', sc.amount) SEPARATOR '||') 
         FROM service_contributions sc 
         JOIN contribution_types ct ON sc.contribution_type_id = ct.id 
         WHERE sc.puja_request_id = pr.id) as contributions_data
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
      totalBookings: total,
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
        p.name AS pandit_name,
        (SELECT GROUP_CONCAT(ct.name SEPARATOR ', ') 
         FROM service_contributions sc 
         JOIN contribution_types ct ON sc.contribution_type_id = ct.id 
         WHERE sc.puja_request_id = pr.id) as contribution_names
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
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS total_revenue,
        COALESCE(SUM(total_price), 0) AS total_receivable,
        COALESCE(SUM(total_price - paid_amount), 0) AS total_balance
      FROM puja_requests
      WHERE status IN ('completed', 'pending', 'accepted')
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
      SELECT COALESCE(SUM(paid_amount), 0) AS today_revenue
      FROM puja_requests
      WHERE status IN ('completed', 'pending', 'accepted')
        AND DATE(created_at) = CURDATE()
    `);

    // This Month Revenue
    const [monthRevenue] = await db.query(`
      SELECT COALESCE(SUM(paid_amount), 0) AS month_revenue
      FROM puja_requests
      WHERE status IN ('completed', 'pending', 'accepted')
        AND MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `);

    res.json({
      success: true,
      data: {
        total_revenue: totalRevenue[0].total_revenue,
        total_receivable: totalRevenue[0].total_receivable,
        total_balance: totalRevenue[0].total_balance,
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
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COALESCE(SUM(paid_amount), 0)      AS revenue,
        COUNT(*)                            AS bookings
      FROM puja_requests
      WHERE status IN ('completed', 'pending', 'accepted')
        AND created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY month
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
        COALESCE(SUM(pr.paid_amount), 0)   AS revenue
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
        COALESCE(SUM(pr.paid_amount), 0) AS total_revenue
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
        COALESCE(SUM(paid_amount), 0)    AS revenue
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
    const limit = parseInt(req.query.limit) || 10;
    const paymentType = req.query.payment_type; // Optional: full/advance
    const offset = (page - 1) * limit;

    let whereClause = "WHERE pr.status IN ('completed', 'pending', 'accepted')";
    let params = [];

    if (paymentType && paymentType !== 'all') {
      whereClause += " AND pr.payment_type = ?";
      params.push(paymentType);
    }

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
        pr.paid_amount,
        pr.payment_status,
        pr.payment_type,
        pr.samagrikit,
        pr.donations,
        pr.created_at,
        pr.completed_at
      FROM puja_requests pr
      JOIN users u    ON pr.user_id    = u.id
      JOIN services s ON pr.service_id = s.id
      ${whereClause}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limit, offset],
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM puja_requests pr ${whereClause}`,
      params
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.query(`
      SELECT COUNT(*) AS total FROM users WHERE role = 'pandit'
    `);

    const [rows] = await db.query(
      `
      SELECT
        u.id          AS pandit_id,
        u.name        AS pandit_name,
        u.phone,
        COUNT(pr.id)                     AS completed_pujas,
        COALESCE(SUM(pr.total_price), 0) AS total_earned,
        COALESCE((SELECT SUM(amount) FROM pandit_payouts WHERE pandit_id = u.id), 0) AS total_paid,
        ppd.payment_method,
        ppd.account_holder_name,
        ppd.bank_name,
        ppd.bank_account_number,
        ppd.ifsc_code,
        ppd.upi_id
      FROM users u
      LEFT JOIN puja_requests pr
        ON pr.pandit_id = u.id AND pr.status = 'completed'
      LEFT JOIN partner_payment_details ppd
        ON ppd.user_id = u.id AND ppd.is_active = 1
      WHERE u.role = 'pandit'
      GROUP BY u.id, u.name, u.phone, ppd.id
      ORDER BY total_earned DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset],
    );

    const dataWithBalance = rows.map(r => ({
      ...r,
      total_paid: Number(r.total_paid),
      balance: Number(r.total_earned) - Number(r.total_paid)
    }));

    res.json({
      success: true,
      data: dataWithBalance,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─────────────────────────────────────────────
// 10. DATE RANGE FILTER (Custom Report)
// ─────────────────────────────────────────────

export const getRevenueByDateRange = async (req, res) => {
  try {
    const { from, to, status, payment_type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!from || !to)
      return res
        .status(400)
        .json({ success: false, message: "from aur to date required hai" });

    // Filter conditions
    let extraCondition = "";
    let extraParams = [];

    if (status && status !== "all") {
      extraCondition += " AND pr.status = ?";
      extraParams.push(status);
    }

    if (payment_type && payment_type !== "all") {
      extraCondition += " AND pr.payment_type = ?";
      extraParams.push(payment_type);
    }

    // Total count query
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM puja_requests pr 
       WHERE DATE(pr.created_at) BETWEEN ? AND ? ${extraCondition}`,
      [from, to, ...extraParams],
    );

    // Data query
    const [rows] = await db.query(
      `SELECT
        pr.id            AS bookingId,
        u.name           AS user_name,
        ps.puja_name     AS puja_name,
        pr.city          AS city,
        pr.status,
        pr.total_price,
        pr.paid_amount,
        pr.payment_status,
        pr.payment_type,
        pr.created_at
      FROM puja_requests pr
      LEFT JOIN users u ON u.id = pr.user_id
      LEFT JOIN services ps ON ps.id = pr.service_id
      WHERE DATE(pr.created_at) BETWEEN ? AND ? ${extraCondition}
      ORDER BY pr.created_at DESC
      LIMIT ? OFFSET ?`,
      [from, to, ...extraParams, limit, offset],
    );

    // Summary query with filters
    const [[summary]] = await db.query(
      `SELECT
        COALESCE(SUM(paid_amount), 0) AS total_revenue,
        COUNT(*) AS total_bookings
      FROM puja_requests pr
      WHERE DATE(pr.created_at) BETWEEN ? AND ? ${extraCondition}`,
      [from, to, ...extraParams],
    );

    res.json({
      success: true,
      data: {
        summary,
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
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

    const [blogs] = await db.query(query, params);

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
    const [[{ total }]] = await db.query(countQ, countP);

    // Stats cards ke liye
    const [[stats]] = await db.query(`
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
    const [[blog]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [
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

    const [result] = await db.query(
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
    const [[existing]] = await db.query(`SELECT * FROM blogs WHERE id = ?`, [
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

    await db.query(
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
    const [[blog]] = await db.query(`SELECT id FROM blogs WHERE id = ?`, [
      req.params.id,
    ]);
    if (!blog)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });
    await db.query(`DELETE FROM blogs WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: "Blog delete ho gaya" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH /api/admin/blogs/:id/status  — Published ↔ Draft toggle
export const adminToggleBlogStatus = async (req, res) => {
  try {
    const [[blog]] = await db.query(
      `SELECT id, status FROM blogs WHERE id = ?`,
      [req.params.id],
    );
    if (!blog)
      return res.status(404).json({ success: false, error: "Blog nahi mila" });

    const newStatus = blog.status === "published" ? "draft" : "published";
    await db.query(`UPDATE blogs SET status = ? WHERE id = ?`, [
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

    if (status === 'completed') {
      // ✅ Sync with request_assignments so Pandit also sees it as completed
      await db.query(
        "UPDATE request_assignments SET status = 'completed', updated_at = NOW() WHERE request_id = ?",
        [id],
      );

      import('../utils/referralUtil.js').then(({ processReferralReward }) => {
        processReferralReward(id);
      }).catch(console.error);
    }

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
        message: "No fields found to update.",
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

// Get All Pages (About Us & Privacy Policy)
export const getPages = async (req, res) => {
  try {
    const [pages] = await db.query(
      `SELECT * FROM pages WHERE slug != 'contact-us'`,
    );

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error("Get Pages Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get Single Page by Slug
export const getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    let query = `SELECT * FROM pages WHERE slug = ?`;
    const params = [slug];

    // If NOT admin (req.user is undefined for public routes in server.js), check is_active
    if (!req.user) {
      query += ` AND is_active = 1`;
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Page nahi mila",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Get Page Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create New Page
export const createPage = async (req, res) => {
  try {
    const { title, slug, sections } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ success: false, message: "Title and Slug are required" });
    }

    const [existing] = await db.query(`SELECT id FROM pages WHERE slug = ?`, [slug]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Slug already exists" });
    }

    await db.query(
      `INSERT INTO pages (title, slug, sections, updated_by) VALUES (?, ?, ?, ?)`,
      [title, slug, sections || "[]", req.admin?.name || "admin"],
    );

    res.status(201).json({
      success: true,
      message: "Page create ho gaya",
    });
  } catch (error) {
    console.error("Create Page Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update Page by Slug
export const updatePage = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, sections } = req.body;

    const [result] = await db.query(
      `UPDATE pages SET title = ?, sections = ?, updated_by = ? WHERE slug = ?`,
      [title, sections, req.admin?.name || "admin", slug],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Page nahi mila",
      });
    }

    res.json({
      success: true,
      message: "Page update ho gaya",
    });
  } catch (error) {
    console.error("Update Page Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadPageImage = async (req, res) => {
  try {
    const { slug } = req.params;
    const rawIndex = req.body.sectionIndex ?? req.query.sectionIndex ?? req.body["sectionIndex[]"];
    const sectionIndex = parseInt(Array.isArray(rawIndex) ? rawIndex[0] : rawIndex, 10);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Image file required" });
    }
    if (Number.isNaN(sectionIndex)) {
      return res.status(400).json({ success: false, message: "sectionIndex is required", received: rawIndex });
    }

    const [rows] = await db.query(`SELECT * FROM pages WHERE slug = ?`, [slug]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Page nahi mila" });
    }

    const page = rows[0];
    let sections = page.sections;
    if (typeof sections === "string") {
      try {
        sections = JSON.parse(sections);
      } catch {
        sections = [];
      }
    }

    if (!Array.isArray(sections)) {
      return res.status(400).json({ success: false, message: "Invalid page sections" });
    }
    if (sectionIndex < 0 || sectionIndex >= sections.length) {
      return res.status(400).json({ success: false, message: `Invalid sectionIndex: ${sectionIndex}. Available sections: 0-${sections.length - 1}` });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    sections[sectionIndex] = {
      ...sections[sectionIndex],
      img: imageUrl,
    };

    await db.query(
      `UPDATE pages SET sections = ?, updated_by = ? WHERE slug = ?`,
      [JSON.stringify(sections), req.admin?.name || "admin", slug],
    );

    res.json({
      success: true,
      data: {
        sectionIndex,
        section: sections[sectionIndex],
      },
    });
  } catch (error) {
    console.error("Upload Page Image Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// name correction
export const getAllNameCorrections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) as total FROM name_correction",
    );

    const [rows] = await db.execute(
      `SELECT 
        nc.id,
        nc.name,
        nc.dob,
        nc.userid,
        u.name  AS user_name,
        u.email AS user_email,
        u.phone AS user_phone
      FROM name_correction nc
      LEFT JOIN users u ON u.id = nc.userid
      ORDER BY nc.id DESC
      LIMIT ${limit} OFFSET ${offset}`,
    );

    return res.status(200).json({
      success: true,
      data: rows,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ getAllNameCorrections Error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error: " + error.message,
    });
  }
};

// ── Personal Info CRUD ─────────────────────────────────────────

export const getAllPersonalInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await db.execute(
      "SELECT COUNT(*) as total FROM personal_info",
    );

    const [rows] = await db.execute(
      `SELECT * FROM personal_info ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`,
    );

    return res.status(200).json({
      success: true,
      data: rows,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ getAllPersonalInfo Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createPersonalInfo = async (req, res) => {
  try {
    const { phone_name, email } = req.body;

    if (!phone_name || !email)
      return res.status(400).json({
        success: false,
        error: "Phone name and email are required.",
      });

    const [result] = await db.execute(
      "INSERT INTO personal_info (phone_name, email) VALUES (?, ?)",
      [phone_name.trim(), email.trim()],
    );

    return res.status(201).json({
      success: true,
      message: "Personal info created.",
      data: { id: result.insertId, phone_name, email },
    });
  } catch (error) {
    console.error("❌ createPersonalInfo Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { phone_name, email } = req.body;

    if (!phone_name || !email)
      return res.status(400).json({
        success: false,
        error: "Phone name and email are required.",
      });

    await db.execute(
      "UPDATE personal_info SET phone_name = ?, email = ? WHERE id = ?",
      [phone_name.trim(), email.trim(), id],
    );

    return res
      .status(200)
      .json({ success: true, message: "Updated successfully." });
  } catch (error) {
    console.error("❌ updatePersonalInfo Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deletePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute("DELETE FROM personal_info WHERE id = ?", [id]);

    return res
      .status(200)
      .json({ success: true, message: "Deleted successfully." });
  } catch (error) {
    console.error("❌ deletePersonalInfo Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePersonalInfoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined)
      return res.status(400).json({ success: false, error: "is_active is required." });

    if (is_active !== 0 && is_active !== 1)
      return res.status(400).json({ success: false, error: "is_active must be 0 or 1." });

    await db.execute("UPDATE personal_info SET is_active = ? WHERE id = ?", [is_active, id]);

    return res.status(200).json({ success: true, message: "Status updated successfully." });
  } catch (error) {
    console.error("❌ updatePersonalInfoStatus Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (is_active === undefined) return res.status(400).json({ success: false, error: "is_active is required." });
    await db.execute("UPDATE services SET is_active = ? WHERE id = ?", [is_active, id]);
    return res.status(200).json({ success: true, message: "Service status updated successfully." });
  } catch (error) {
    console.error("❌ updateServiceStatus Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updatePageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (is_active === undefined) return res.status(400).json({ success: false, error: "is_active is required." });
    await db.execute("UPDATE pages SET is_active = ? WHERE id = ?", [is_active, id]);
    return res.status(200).json({ success: true, message: "Page status updated successfully." });
  } catch (error) {
    console.error("❌ updatePageStatus Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateContributionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    if (is_active === undefined) return res.status(400).json({ success: false, error: "is_active is required." });
    await db.execute("UPDATE contribution_types SET is_active = ? WHERE id = ?", [is_active, id]);
    return res.status(200).json({ success: true, message: "Contribution status updated successfully." });
  } catch (error) {
    console.error("❌ updateContributionStatus Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const addPanditPayout = async (req, res) => {
  try {
    const { pandit_id, amount, payment_mode, transaction_id, remarks } = req.body;
    if (!pandit_id || !amount) {
      return res.status(400).json({ success: false, message: "Pandit ID and amount are required" });
    }
    await db.query(
      "INSERT INTO pandit_payouts (pandit_id, amount, payment_mode, transaction_id, remarks) VALUES (?, ?, ?, ?, ?)",
      [pandit_id, amount, payment_mode || "bank", transaction_id || "", remarks || ""]
    );
    res.json({ success: true, message: "Payout recorded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllKundliRequests = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kundli_requests ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteKundliRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM kundli_requests WHERE id = ?", [id]);
    res.json({ success: true, message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

