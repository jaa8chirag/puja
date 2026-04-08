import db from "../config/db.js";

// ── Admin: Create Coupon ──────────────────────────────────────────────────────
export const adminCreateCoupon = async (req, res) => {
  try {
    const { code, discount_percentage, usage_limit, expiry_date } = req.body;

    if (!code || !discount_percentage) {
      return res.status(400).json({ success: false, message: "Code and Percentage are required" });
    }

    const [result] = await db.query(
      `INSERT INTO coupons (code, discount_percentage, usage_limit, expiry_date) VALUES (?, ?, ?, ?)`,
      [code.toUpperCase(), discount_percentage, usage_limit || 100, expiry_date || null]
    );

    res.status(201).json({ success: true, message: "Coupon created successfully", id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }
    console.error("Create Coupon Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Admin: Get All Coupons ────────────────────────────────────────────────────
export const adminGetCoupons = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching coupons" });
  }
};

// ── Admin: Delete Coupon ──────────────────────────────────────────────────────
export const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM coupons WHERE id = ?", [id]);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting coupon" });
  }
};

// ── User: Validate Coupon ─────────────────────────────────────────────────────
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    // 1. Check if coupon exists and is active
    const [coupons] = await db.query(
      "SELECT * FROM coupons WHERE code = ? AND is_active = 1",
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ success: false, message: "Invalid or inactive coupon code" });
    }

    const coupon = coupons[0];

    // 2. Check Expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ success: false, message: "Coupon has expired" });
    }

    // 3. Check Total Usage Limit
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    // 4. Check Per-User Limit (One use per user)
    const [usage] = await db.query(
      "SELECT id FROM coupon_usage WHERE user_id = ? AND coupon_id = ?",
      [userId, coupon.id]
    );

    if (usage.length > 0) {
      return res.status(400).json({ success: false, message: "You have already used this coupon" });
    }

    // Return coupon details for frontend calculation
    res.json({
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        discount_percentage: coupon.discount_percentage
      }
    });

  } catch (error) {
    console.error("Validate Coupon Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
