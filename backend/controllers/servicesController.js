import db from "../config/db.js";
import pool from "../config/db.js";

export const getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
          s.id,
          s.puja_name,
          s.puja_type,
          s.description,
          s.image_url,
          s.status,
          s.priority, -- Priority select kiya
          MAX(CASE WHEN p.pricing_type = 'standard' THEN p.price END) AS standard_price,
          MAX(CASE WHEN p.pricing_type = 'single' THEN p.price END) AS single_price,
          MAX(CASE WHEN p.pricing_type = 'couple' THEN p.price END) AS couple_price,
          MAX(CASE WHEN p.pricing_type = 'family' THEN p.price END) AS family_price
      FROM services s
      LEFT JOIN service_prices p ON s.id = p.service_id
      WHERE s.puja_type = ?
      GROUP BY s.id
      ORDER BY s.priority DESC, s.id DESC -- Pehle priority phir nayi ID
    `,
      [type],
    );

    res.status(200).json({
      success: true,
      services: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllServices = async (req, res) => {
  try {
    // Priority DESC lagane se high priority upar aayegi
    const [rows] = await db.query(
      `SELECT * FROM services ORDER BY priority DESC, created_at DESC`,
    );

    res.status(200).json({
      success: true,
      services: rows,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const bookPuja = async (req, res) => {
  try {
    const { id } = req.params;

    // Get service with prices
    const [rows] = await db.query(
      `
      SELECT 
        s.id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,

        MAX(CASE WHEN p.pricing_type = 'standard' THEN p.price END) AS standard_price,
        MAX(CASE WHEN p.pricing_type = 'single' THEN p.price END) AS single_price,
        MAX(CASE WHEN p.pricing_type = 'couple' THEN p.price END) AS couple_price,
        MAX(CASE WHEN p.pricing_type = 'family' THEN p.price END) AS family_price

      FROM services s
      LEFT JOIN service_prices p 
        ON s.id = p.service_id

      WHERE s.id = ?

      GROUP BY 
        s.id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url
      `,
      [id],
    );

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get benefits for this service
    const [benefits] = await db.query(
      `SELECT id, name, description, created_at 
       FROM benefits 
       WHERE service_id = ? 
       ORDER BY created_at ASC`,
      [id],
    );

    // Combine service data with benefits
    const serviceData = {
      ...rows[0],
      benefits: benefits || [],
    };

    res.status(200).json(serviceData);
  } catch (error) {
    console.error("Book Puja Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch puja",
    });
  }
};
export const homeORKathaPujaBookingDetails = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      puja_id,
      date,
      time,
      location,
      city,
      state,
      devoteeName,
      ticket_type,
      donations,
      bookingId,
      total_price,
      samagriKit,
      coupon_code,
      discount_amount
    } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const userId = req.user.id;
    const formattedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // ==============================
    // ✅ HANDLE DONATIONS (STRING)
    // ==============================
    let totalDonationAmount = 0;
    const donationNames = donations
      ? donations.split(",").map((d) => d.trim())
      : [];

    // 1️⃣ Insert puja request
    const [result] = await connection.query(
      `
      INSERT INTO puja_requests 
      (user_id, service_id, preferred_date, preferred_time, address, city, state, status, otp, bookingId, ticket_type, donations, devotee_name, total_price, samagrikit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        puja_id,
        formattedDate,
        time || "Morning Slot",
        location,
        city || "N/A",
        state || "N/A",
        otp,
        bookingId,
        ticket_type || null,
        0,
        devoteeName || "User",
        total_price,
        samagriKit ? 1 : 0,
      ],
    );

    const pujaRequestId = result.insertId;

    // 2️⃣ Record Coupon Usage (If provided)
    if (coupon_code) {
      const [coupons] = await connection.query(
        "SELECT id FROM coupons WHERE code = ?",
        [coupon_code.toUpperCase()]
      );
      if (coupons.length > 0) {
        const couponId = coupons[0].id;
        // Insert usage record
        await connection.query(
          "INSERT INTO coupon_usage (user_id, coupon_id, order_id) VALUES (?, ?, ?)",
          [userId, couponId, bookingId]
        );
        // Increment used count
        await connection.query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [couponId]
        );
      }
    }

    // 2️⃣ Fetch price from DB & insert contributions
    for (let name of donationNames) {
      const [rows] = await connection.query(
        `SELECT id, price FROM contribution_types 
         WHERE name LIKE ? AND is_active = 1`,
        [`%${name}%`],
      );

      if (rows.length) {
        const contribution = rows[0];

        totalDonationAmount += Number(contribution.price);

        await connection.query(
          `
          INSERT INTO service_contributions
          (puja_request_id, service_id, contribution_type_id, amount)
          VALUES (?, ?, ?, ?)
          `,
          [pujaRequestId, puja_id, contribution.id, contribution.price],
        );
      }
    }

    // 3️⃣ Update donation total in puja_requests
    await connection.query(
      `UPDATE puja_requests SET donations = ? WHERE id = ?`,
      [totalDonationAmount, pujaRequestId],
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Home/Katha Booking Stored Successfully",
      bookingId: pujaRequestId,
      totalDonationAmount,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Booking Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};

// get
export const getOnlinePindDanServices = async (req, res) => {
  try {
    const query = `
      SELECT * 
      FROM services 
      WHERE puja_type = 'online_pind_dan' 
      AND status = 'active'
      ORDER BY priority DESC
    `;

    const [rows] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


export const bookOnlinePindDan = async (req, res) => {
  try {
    const { id } = req.params; // ✅ ab id le rahe hain

    const [rows] = await db.query(
      `
      SELECT 
        s.id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.priority,

        MAX(CASE WHEN p.pricing_type = 'standard' THEN p.price END) AS standard_price,
        MAX(CASE WHEN p.pricing_type = 'single' THEN p.price END) AS single_price,
        MAX(CASE WHEN p.pricing_type = 'couple' THEN p.price END) AS couple_price,
        MAX(CASE WHEN p.pricing_type = 'family' THEN p.price END) AS family_price

      FROM services s
      LEFT JOIN service_prices p 
        ON s.id = p.service_id

      WHERE s.id = ?   -- ✅ change here

      GROUP BY 
        s.id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.priority
      `,
      [id],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const service = rows[0];

    // ✅ Benefits fetch
    const [benefits] = await db.query(
      `SELECT id, name, description, created_at 
       FROM benefits 
       WHERE service_id = ? 
       ORDER BY created_at ASC`,
      [service.id],
    );

    const finalData = {
      ...service,
      benefits: benefits || [],
    };

    res.status(200).json({
      success: true,
      data: finalData, // ✅ consistent response
    });
  } catch (error) {
    console.error("Book Puja Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch puja",
    });
  }
};
export const onlinePinddanBookingDetails = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      puja_id,
      date,
      time,
      location,
      city,
      state,
      devoteeName,
      ticket_type,
      donations,
      bookingId,
      total_price,
      samagriKit,
      coupon_code,
      discount_amount,
    } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("home or katha booking details--", req.body);
    const userId = req.body.userId;
    const formattedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // ==============================
    // ✅ HANDLE DONATIONS (STRING)
    // ==============================

    let totalDonationAmount = 0;

    const donationNames = donations
      ? donations.split(",").map((d) => d.trim())
      : [];

    // 1️⃣ Insert puja request first
    const [result] = await connection.query(
      `
      INSERT INTO puja_requests 
      (user_id, service_id, preferred_date, preferred_time, address, city, state, status,otp, bookingId, ticket_type, donations, devotee_name, total_price, samagrikit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending',?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        puja_id,
        formattedDate,
        time || "Morning Slot",
        location,
        city || "N/A",
        state || "N/A",
        otp,
        bookingId,
        ticket_type || null,
        0, // 👈 temporarily 0 (later update karenge)
        devoteeName || "User",
        total_price,
        samagriKit ? 1 : 0,
      ],
    );

    const pujaRequestId = result.insertId;

    // 2️⃣ Fetch price from DB & insert contributions
    for (let name of donationNames) {
      const [rows] = await connection.query(
        `SELECT id, price FROM contribution_types 
         WHERE name LIKE ? AND is_active = 1`,
        [`%${name}%`],
      );

      if (rows.length) {
        const contribution = rows[0];

        totalDonationAmount += Number(contribution.price);

        await connection.query(
          `
          INSERT INTO service_contributions
          (puja_request_id, service_id, contribution_type_id, amount)
          VALUES (?, ?, ?, ?)
          `,
          [pujaRequestId, puja_id, contribution.id, contribution.price],
        );
      }
    }

    // 3️⃣ Update donation total in puja_requests
    await connection.query(
      `UPDATE puja_requests SET donations = ? WHERE id = ?`,
      [totalDonationAmount, pujaRequestId],
    );

    // 4️⃣ Record Coupon Usage (if applied)
    if (coupon_code) {
      const [couponRows] = await connection.query(
        "SELECT id FROM coupons WHERE code = ?",
        [coupon_code],
      );
      if (couponRows.length > 0) {
        const couponId = couponRows[0].id;
        await connection.query(
          "INSERT INTO coupon_usage (user_id, coupon_id, order_id) VALUES (?, ?, ?)",
          [userId, couponId, bookingId]
        );
        await connection.query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [couponId],
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Home/Katha Booking Stored Successfully",
      bookingId: pujaRequestId,
      totalDonationAmount,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Booking Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  } finally {
    connection.release();
  }
};
export const bookingDetails = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const {
      puja_id,
      date,
      time,
      address,
      city,
      state,
      devoteeName,
      ticket_type,
      donations,
      bookingId,
      total_price,
      coupon_code,
      discount_amount,
    } = req.body;
    console.log("booking details", req.body);
    const userId = req.user.id;

    const formattedDate = date
      ? new Date(date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const totalDonationAmount = donations.reduce(
      (sum, item) => sum + Number(item.amount),
      0,
    );

    // ✅ Insert temple booking (samagrikit = 0 always)
    const [result] = await connection.query(
      `
      INSERT INTO puja_requests 
      (user_id, service_id, preferred_date, preferred_time, address, city, state, status, bookingId, ticket_type, donations, devotee_name, total_price, samagrikit) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, 0)
      `,
      [
        userId,
        puja_id,
        formattedDate,
        time || "Morning Slot",
        address,
        city || "N/A",
        state || "N/A",

        bookingId,
        ticket_type,
        totalDonationAmount,
        devoteeName || "User",
        total_price,
      ],
    );

    const pujaRequestId = result.insertId;

    // ✅ Save donations
    for (let donation of donations) {
      await connection.query(
        `
        INSERT INTO service_contributions 
        (puja_request_id, service_id, contribution_type_id, amount) 
        VALUES (?, ?, ?, ?)
        `,
        [
          pujaRequestId,
          puja_id,
          donation.contribution_type_id,
          donation.amount,
        ],
      );
    }

    // ✅ Record Coupon Usage (if applied)
    if (coupon_code) {
      const [couponRows] = await connection.query(
        "SELECT id FROM coupons WHERE code = ?",
        [coupon_code],
      );
      if (couponRows.length > 0) {
        const couponId = couponRows[0].id;
        await connection.query(
          "INSERT INTO coupon_usage (user_id, coupon_id, order_id) VALUES (?, ?, ?)",
          [userId, couponId, bookingId]
        );
        await connection.query(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [couponId],
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Temple Booking Stored Successfully",
      bookingId: pujaRequestId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Temple Booking Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  } finally {
    connection.release();
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        b.*,

        COALESCE(
          CASE 
            WHEN s.puja_type = 'temple_puja' 
              THEN t.address
            ELSE b.address
          END
        ) AS final_address,

        s.puja_name, 
        s.image_url, 
        s.puja_type,

        COALESCE(ra.status, b.status) AS assignment_status,
        u.name AS pandit_name

      FROM puja_requests b
      JOIN services s ON b.service_id = s.id
      LEFT JOIN temples t ON b.service_id = t.service_id
      LEFT JOIN request_assignments ra ON ra.request_id = b.id
      LEFT JOIN users u ON u.id = ra.pandit_id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;

    const [rows] = await db.query(query, [userId]);

    res.status(200).json({
      success: true,
      bookings: rows,
    });
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    res.status(500).json({
      success: false,
      message: "Bookings Not Fetched",
    });
  }
};
export const templePuja = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id AS service_id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.status,
        s.priority, -- 1. Priority select ki
        s.created_at AS service_created_at,

        t.id AS temple_id,
        t.about,
        t.address,
        t.dateOfStart,
        t.created_at AS temple_created_at,

        MAX(CASE WHEN p.pricing_type = 'standard' THEN p.price END) AS standard_price,
        MAX(CASE WHEN p.pricing_type = 'single' THEN p.price END) AS single_price,
        MAX(CASE WHEN p.pricing_type = 'couple' THEN p.price END) AS couple_price,
        MAX(CASE WHEN p.pricing_type = 'family' THEN p.price END) AS family_price

      FROM services s

      LEFT JOIN temples t 
        ON s.id = t.service_id

      LEFT JOIN service_prices p 
        ON s.id = p.service_id

      WHERE s.puja_type = 'temple_puja'

      GROUP BY s.id, t.id
      ORDER BY s.priority DESC, s.id DESC -- 2. Priority ke hisab se order kiya
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const templePujaSingle = async (req, res) => {
  const { id } = req.params;
  try {
    // Main service data with temple and pricing
    const [rows] = await db.query(
      `
      SELECT 
        s.id AS service_id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.created_at AS service_created_at,

        t.id AS temple_id,
        t.about,
        t.address,
        t.dateOfStart,
        t.created_at AS temple_created_at,

        MAX(CASE WHEN p.pricing_type = 'single' THEN p.price END) AS single_price,
        MAX(CASE WHEN p.pricing_type = 'couple' THEN p.price END) AS couple_price,
        MAX(CASE WHEN p.pricing_type = 'family' THEN p.price END) AS family_price

      FROM services s

      LEFT JOIN temples t 
        ON s.id = t.service_id

      LEFT JOIN service_prices p 
        ON s.id = p.service_id

      WHERE s.id = ?

      GROUP BY s.id, t.id
    `,
      [id],
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get benefits for this service
    const [benefits] = await db.query(
      `SELECT id, name, description, created_at 
       FROM benefits 
       WHERE service_id = ? 
       ORDER BY created_at ASC`,
      [id],
    );

    // Combine service data with benefits
    const serviceData = rows.map((row) => ({
      ...row,
      benefits: benefits || [],
    }));

    res.status(200).json({
      success: true,
      data: serviceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const pindDan = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.id AS service_id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.status,
        s.priority, -- 1. Priority select ki
        s.created_at AS service_created_at,

        t.id AS temple_id,
        t.about,
        t.address,
        t.dateOfStart,
        t.created_at AS temple_created_at,

        p.price AS standard_price

      FROM services s

      LEFT JOIN temples t 
        ON s.id = t.service_id

      LEFT JOIN service_prices p 
        ON s.id = p.service_id 
        AND p.pricing_type = 'standard'

      WHERE s.puja_type = 'pind_dan'
      
      -- 2. Priority aur Created Date ke hisab se order kiya
      ORDER BY IFNULL(s.priority, 0) DESC, s.id DESC 
    `);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const PindDanSingle = async (req, res) => {
  const { id } = req.params;

  try {
    // Main service data with temple and pricing
    const [rows] = await db.query(
      `
      SELECT 
        s.id AS service_id,
        s.puja_name,
        s.puja_type,
        s.description,
        s.image_url,
        s.created_at AS service_created_at,

        t.id AS temple_id,
        t.about,
        t.address,
        t.dateOfStart,
        t.created_at AS temple_created_at,

        p.price AS standard_price

      FROM services s

      LEFT JOIN temples t 
        ON s.id = t.service_id

      LEFT JOIN service_prices p 
        ON s.id = p.service_id 
        AND p.pricing_type = 'standard'

      WHERE s.id = ?
      `,
      [id],
    );

    if (!rows[0]) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // Get benefits for this service
    const [benefits] = await db.query(
      `SELECT id, name, description, created_at 
       FROM benefits 
       WHERE service_id = ? 
       ORDER BY created_at ASC`,
      [id],
    );

    // Combine service data with benefits
    const serviceData = {
      ...rows[0],
      benefits: benefits || [],
    };

    res.status(200).json({
      success: true,
      data: serviceData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const [rows] = await db.query(
      "SELECT status FROM puja_requests WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Booking nahi mili." });
    }

    const currentStatus = rows[0].status;

    if (currentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Completed puja ko cancel nahi kiya ja sakta.",
      });
    }

    if (currentStatus === "declined" || currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Ye booking pehle hi cancel ho chuki hai.",
      });
    }

    await db.query(
      "UPDATE puja_requests SET status = 'cancelled', otp = NULL WHERE id = ?",
      [id],
    );

    await db.query(
      "UPDATE request_assignments SET status = 'cancelled', updated_at = NOW() WHERE request_id = ?",
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancel ho gayi hai.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const postSupportQuery = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, subject, message } = req.body;

    const sql =
      "INSERT INTO support_queries (user_id, category, subject, message) VALUES (?, ?, ?, ?)";

    // mysql2/promise mein hum aise await use karte hain:
    const [result] = await pool.execute(sql, [
      userId,
      category,
      subject,
      message,
    ]);

    // Ab ye response frontend ko 100% milega
    return res.status(200).json({
      success: true,
      message: "Query Submitted Successfully",
      id: result.insertId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database Error",
      error: error.message,
    });
  }
};

export const getUserSupportQueries = async (req, res) => {
  try {
    // console.log("--- Fetching from DB ---");
    const userId = req.user.id;

    const sql =
      "SELECT * FROM support_queries WHERE user_id = ? ORDER BY created_at DESC";

    // Kyunki aapne 'mysql2/promise' use kiya hai, toh yahan await lagega
    // results ek array return karta hai jisme pehla element data hota hai
    const [results] = await pool.query(sql, [userId]);

    // console.log("DB Success! Rows found:", results.length);

    return res.status(200).json(results);
  } catch (error) {
    console.error("DB Query Error:", error);
    return res.status(500).json({
      message: "Error fetching data",
      error: error.message,
    });
  }
};
// ─────────────────────────────────────────────────────────────────────────────
// ✅ NEW — puja_request_members ke liye 2 functions
// ─────────────────────────────────────────────────────────────────────────────

// 1️⃣ Booking ke baad selected members save karo
// POST /api/puja/save-members
// Body: { request_id, member_ids: [4, 2] }
export const savePujaRequestMembers = async (req, res) => {
  try {
    const { request_id, member_ids } = req.body;

    if (!request_id || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "request_id aur member_ids zaroori hain",
      });
    }

    for (let memberId of member_ids) {
      await db.query(
        `INSERT INTO puja_request_members (request_id, member_id) VALUES (?, ?)`,
        [request_id, memberId],
      );
    }

    return res.status(201).json({
      success: true,
      message: `${member_ids.length} member(s) saved successfully`,
    });
  } catch (error) {
    console.error("Save Puja Request Members Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// 2️⃣ Kisi booking ke saare members fetch karo — puri detail ke saath
// GET /api/puja/get-members/:request_id
export const getPujaRequestMembers = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        prm.id,
        prm.request_id,
        prm.member_id,
        prm.created_at,
        ufm.name,
        ufm.relation,
        ufm.gotra,
        ufm.dob,
        ufm.rashi
      FROM puja_request_members prm
      JOIN user_family_members ufm ON prm.member_id = ufm.id
      WHERE prm.request_id = ?
      `,
      [request_id],
    );

    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get Puja Request Members Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
