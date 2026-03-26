import db from "../config/db.js";
import jwt from "jsonwebtoken";

let otpStore = {}; // Temporary memory for OTPs

// --- 1. SIGNUP REQUEST ---
export const customerSignupRequest = async (req, res) => {
  try {
    const { firstName, lastName, phone, email } = req.body;
    if (!phone || !firstName)
      return res.status(400).json({ message: "Name and Phone are required" });

    const [existing] = await db.query("SELECT id FROM users WHERE phone = ?", [
      phone,
    ]);
    if (existing.length > 0)
      return res
        .status(409)
        .json({ message: "Already registered. Please Login." });

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = {
      userData: { firstName, lastName, phone, email },
      otp: otp,
      type: "SIGNUP",
      expires: Date.now() + 10 * 60 * 1000,
    };

    console.log(`\n--- SIGNUP OTP FOR ${phone}: ${otp} ---\n`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- 2. SIGNUP VERIFY (With Transactions & Address) ---
export const customerSignupVerify = async (req, res) => {
  let connection;
  try {
    // 1. Inhe destructure karna zaroori hai (pincode aur address_type add kiya)
    const {
      phone,
      otp,
      role,
      address,
      city,
      state,
      lastName,
      email,
      firstName,
      pincode,
      address_type,
    } = req.body;

    const session = otpStore[phone];

    if (
      !session ||
      session.type !== "SIGNUP" ||
      session.otp.toString() !== otp.toString()
    ) {
      return res
        .status(400)
        .json({ message: "Invalid OTP or Session Expired" });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // User Insert
    const [userResult] = await connection.query(
      "INSERT INTO users (name, phone, email, gotra, role) VALUES (?, ?, ?, ?, ?)",
      [
        firstName,
        phone,
        email || null,
        lastName || null,
        role || "customerCare",
      ],
    );

    const newUserId = userResult.insertId;
    console.log("New User ID:", newUserId);

    if (address) {
      // 2. Query aur Values ko match kiya (Yahan 7 placeholders aur 7 values hain)
      await connection.query(
        "INSERT INTO addresses (user_id, address_line1, city, state, address_type, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          newUserId,
          address,
          city,
          state,
          address_type || "home",
          pincode || null,
          1,
        ],
      );
    }

    await connection.commit();
    delete otpStore[phone];

    const token = jwt.sign(
      { id: newUserId, firstName, phone, role: role || "customerCare" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Verified Successfully!",
      token,
      role: role || "customerCare",
    });
  } catch (error) {
    console.error("Signup Error:", error); // Console mein error check karne ke liye
    if (connection) await connection.rollback();
    res
      .status(500)
      .json({ message: "Error saving data", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- 3. LOGIN REQUEST (Modified for Partner Check) ---
export const CusomterLoginRequest = async (req, res) => {
  try {
    const { phone, role } = req.body; // Frontend se role ('user' ya 'pandit') bhejien

    // Role wise check: Pandit login tabhi hoga jab DB mein role 'pandit' ho
    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE phone = ?",
      [phone],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Account not found." });

    // Security Check: Agar Pandit login page hai aur user 'user' hai, toh block karein
    if (role && rows[0].role !== role) {
      return res.status(403).json({
        message: `Access denied. You are registered as a ${rows[0].role}.`,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[phone] = {
      otp,
      type: "LOGIN",
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log(`\n--- LOGIN OTP FOR ${phone}: ${otp} ---\n`);
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- 4. VERIFY OTP (Bypass Logic Added) ---
export const customerVerifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const session = otpStore[phone];

    // --- BYPASS LOGIC ---
    // Agar OTP '123456' hai, toh ye bypass ho jayega
    const isBypass = otp.toString() === "123456";

    if (
      isBypass ||
      (session &&
        session.type === "LOGIN" &&
        session.otp.toString() === otp.toString())
    ) {
      const [rows] = await db.query(
        "SELECT id, name, phone, email, role FROM users WHERE phone = ?",
        [phone],
      );

      // Check agar bypass use kar rahe hain par user DB mein nahi hai
      if (rows.length === 0) {
        return res.status(404).json({ message: "User not found in database." });
      }

      // Session delete karein agar normal login tha
      if (session) delete otpStore[phone];

      const token = jwt.sign(
        {
          id: rows[0].id,
          firstName: rows[0].name,
          phone: rows[0].phone,
          email: rows[0].email,
          role: rows[0].role,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" },
      );

      res.status(200).json({
        message: isBypass ? "Login success (Bypass Used)" : "Login success",
        token,
        role: rows[0].role,
      });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// Customer care ke pass All Booking Show hogi

export const getAllPujaRequests = async (req, res) => {
  try {
    const bookingsQuery = `
      SELECT
        b.id,
        b.bookingId,
        b.address,
        b.city,
        b.state,
        b.preferred_date,
        b.preferred_time,
        b.status,
        b.pandit_id,
        b.ticket_type,
        b.samagrikit,
        b.devotee_name,
        b.total_price,

        s.puja_name,
        s.puja_type,

        u.name  AS user_name,
        u.phone AS user_phone,

        pu.name AS pandit_name,
        ra.price AS pandit_price

      FROM puja_requests b

      LEFT JOIN services          s  ON b.service_id  = s.id
      LEFT JOIN users             u  ON b.user_id      = u.id
      LEFT JOIN request_assignments ra ON ra.request_id = b.id
      LEFT JOIN users             pu ON pu.id           = ra.pandit_id
      WHERE s.puja_type IN ('home_puja', 'katha', 'online_pind_dan')
      ORDER BY b.preferred_date ASC
    `;

    const [bookings] = await db.query(bookingsQuery);

    // 2️⃣ Total bookings
    const totalBookings = bookings.length;

    // 3️⃣ Total revenue
    const totalRevenue = bookings.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0,
    );

    // 4️⃣ Total users
    const [users] = await db.query(`
      SELECT COUNT(*) AS totalUsers 
      FROM users 
      WHERE role = 'user'
    `);

    const totalUsers = users[0].totalUsers;

    // 5️⃣ Total completed puja
    const [completed] = await db.query(`
      SELECT COUNT(*) AS totalCompleted
      FROM puja_requests
      WHERE status = 'completed'
    `);

    const totalCompletedPuja = completed[0].totalCompleted;

    res.status(200).json({
      success: true,
      totalBookings,
      totalRevenue,
      totalUsers,
      totalCompletedPuja,
      bookings,
    });
  } catch (error) {
    console.error("Fetch Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getFilterPujaRequests = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status='accepted' THEN 1 ELSE 0 END) AS accepted,
        SUM(CASE WHEN status='declined' THEN 1 ELSE 0 END) AS declined,
        SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed
      FROM puja_requests
    `;

    const [stats] = await db.query(statsQuery);

    res.status(200).json({
      success: true,
      stats: stats[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// customer care ke pass booking accept ya decline karne ka option hoga,
// aur uske baad wo pandit ko assign kar sakta hai.
// Iske liye ek API banayenge jisme booking ID aur action (accept/decline) bhejna hoga.
// Phir us action ke hisaab se database update karenge.

// Accept decline API
export const updatePujaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["accepted", "declined", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    // Step 1: Get current status
    const [rows] = await db.query(
      "SELECT status FROM puja_requests WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const currentStatus = rows[0].status;

    // Step 2: Validate transition according to your diagram
    let isValidTransition = false;

    if (
      currentStatus === "pending" &&
      (status === "accepted" || status === "declined")
    ) {
      isValidTransition = true;
    }

    if (currentStatus === "accepted" && status === "completed") {
      isValidTransition = true;
    }

    if (!isValidTransition) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${currentStatus} to ${status}`,
      });
    }

    // Step 3: Update status
    if (status === "completed") {
      await db.query(
        "UPDATE puja_requests SET status = ?, completed_at = NOW() WHERE id = ?",
        [status, id],
      );
    } else {
      await db.query("UPDATE puja_requests SET status = ? WHERE id = ?", [
        status,
        id,
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `Puja request ${status} successfully`,
    });
  } catch (error) {
    console.error("Update Status Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllPandits = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.gotra,
        u.email,
        u.phone,
        u.is_online,
        
        a.id AS address_id,
        a.address_line1,
        a.city,
        a.state,
        a.pincode

      FROM users u
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.role = 'pandit'
      ORDER BY u.id DESC
    `;

    const [rows] = await db.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      pandits: rows,
    });
  } catch (error) {
    console.error("Error fetching pandits:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.gotra,
        u.email,
        u.phone,

        a.id AS address_id,
        a.address_line1,
        a.city,
        a.state,
        a.pincode

      FROM users u
      LEFT JOIN addresses a 
        ON u.id = a.user_id 
        AND a.is_default = TRUE

      WHERE u.role = 'user'
      ORDER BY u.id DESC
    `;

    const [rows] = await db.query(query);

    res.status(200).json({
      success: true,
      count: rows.length,
      users: rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// customercare resolve query show query and change status

// show all querys

export const assignPandit = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { panditId, price } = req.body; // ✅ price body se lo

    // 1️⃣ Check booking exist
    const [booking] = await db.query(
      "SELECT * FROM puja_requests WHERE id = ?",
      [bookingId],
    );

    if (booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 2️⃣ Check pandit exist and role = pandit
    const [pandit] = await db.query(
      "SELECT * FROM users WHERE id = ? AND role = 'pandit'",
      [panditId],
    );

    if (pandit.length === 0) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    const finalPrice = parseFloat(price || 0);

    // 3️⃣ request_assignments mein insert karo
    await db.query(
      `INSERT INTO request_assignments (request_id, pandit_id, status, price)
       VALUES (?, ?, 'pending', ?)
       ON DUPLICATE KEY UPDATE pandit_id = ?, status = 'pending', price = ?`,
      [bookingId, panditId, finalPrice, panditId, finalPrice],
    );

    // 4️⃣ puja_requests mein status accepted karo
    await db.query(
      `UPDATE puja_requests SET status = 'accepted' WHERE id = ?`,
      [bookingId],
    );

    res.status(200).json({
      success: true,
      message: "Pandit assigned successfully",
      data: { price: finalPrice },
    });
  } catch (error) {
    console.error("Assign Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllSupportQueries = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [];

    if (status) {
      whereClause = "WHERE sq.status = ?";
      params.push(status);
    }

    // Total count
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total 
       FROM support_queries sq 
       ${whereClause}`,
      params,
    );

    const totalPages = Math.ceil(total / limit);

    // Fetch queries with user details (JOIN)
    const [rows] = await db.query(
      `SELECT 
          sq.id,
          sq.category,
          sq.subject,
          sq.message,
          sq.status,
          sq.created_at,
          u.id        AS user_id,
          u.name      AS user_name,
          u.email     AS user_email,
          u.phone     AS user_phone
       FROM support_queries sq
       LEFT JOIN users u ON sq.user_id = u.id
       ${whereClause}
       ORDER BY sq.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    res.json({
      success: true,
      queries: rows,
      total,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// =====================================
// 2️⃣ Update Support Query Status
// =====================================
export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Open", "Resolved", "Closed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const [[query]] = await db.query(
      `SELECT id, status FROM support_queries WHERE id = ?`,
      [id],
    );

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    await db.query(`UPDATE support_queries SET status = ? WHERE id = ?`, [
      status,
      id,
    ]);

    res.json({
      success: true,
      message: `Query marked as ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
