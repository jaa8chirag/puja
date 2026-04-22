import db from "../config/db.js";
import jwt from "jsonwebtoken";

let otpStore = {};

// =============================
// 1️⃣ SIGNUP REQUEST
// =============================
export const signupRequest = async (req, res) => {
  try {
    const { name, phone, email, gotra } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ message: "Name and Phone are required" });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE phone = ?", [
      phone,
    ]);

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Already registered. Please Login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[phone] = {
      userData: { name, phone, email, gotra },
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    };

    console.log(`\n--- OTP FOR ${phone}: ${otp} ---\n`);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================
// 2️⃣ SIGNUP VERIFY
// =============================
export const signupVerify = async (req, res) => {
  let connection;

  try {
    const {
      phone,
      otp,
      role,
      address,
      city,
      state,
      gotra,
      email,
      name,
      pincode,
      address_type,
      panditType,
      paymentMethod,
      accountHolderName,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
      referralCode,
    } = req.body;

    const documentPath = req.file ? req.file.path : null;

    const session = otpStore[phone];
    const isBypass = otp?.toString() === "123456";

    if (
      !isBypass &&
      (!session ||
        session.otp.toString() !== otp?.toString() ||
        session.expires < Date.now())
    ) {
      return res.status(400).json({
        message: "Invalid OTP or Session Expired",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Insert into users
    let referredBy = null;
    if (referralCode) {
      console.log(`[Signup] Attempting to find referrer for code: ${referralCode}`);
      const [refRow] = await connection.query("SELECT id FROM users WHERE referral_code = ?", [referralCode]);
      if (refRow.length > 0) {
        referredBy = refRow[0].id;
        console.log(`[Signup] Found referrer: ${referredBy} for code: ${referralCode}`);
      } else {
        console.log(`[Signup] Referrer NOT found for code: ${referralCode}`);
      }
    }

    const uniqueReferralCode = 'PUJA' + (name ? name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') : 'USR') + Math.floor(1000 + Math.random() * 9000);
    console.log(`[Signup] Registering new user ${phone} with referred_by: ${referredBy}`);

    const [userResult] = await connection.query(
      "INSERT INTO users (name, phone, email, gotra, role, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, phone, email || null, gotra || null, role || "user", uniqueReferralCode, referredBy],
    );

    const newUserId = userResult.insertId;

    // 2️⃣ Insert Address
    if (address) {
      await connection.query(
        `INSERT INTO addresses
        (user_id, address_line1, city, state, address_type, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
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

    // 3️⃣ Insert Pandit Data
    if (role === "pandit") {
      await connection.query(
        "INSERT INTO pandits (user_id, pandit_type, document_url) VALUES (?, ?, ?)",
        [newUserId, panditType || "Standard", documentPath],
      );

      // 4️⃣ Insert Payment Details — sirf pandit ke liye
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
    }

    await connection.commit();
    delete otpStore[phone];

    const token = jwt.sign(
      { id: newUserId, name, phone, role: role || "user" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "Verified Successfully!",
      token,
      role: role || "user",
      user_id: newUserId,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    if (connection) await connection.rollback();
    res.status(500).json({
      message: "Error saving data",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};
// --- 3. LOGIN REQUEST (Modified for Partner Check) ---
export const loginRequest = async (req, res) => {
  try {
    const { phone, role } = req.body; // Frontend se role ('user' ya 'pandit') bhejien

    // Role wise check: Pandit login tabhi hoga jab DB mein role 'pandit' ho
    const [rows] = await db.query(
      "SELECT id, role FROM users WHERE phone = ?",
      [phone],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Account not found." });

    // Security Check: Role match hona chahiye
    if (role && rows[0].role !== role) {
      return res.status(403).json({
        message: "Access denied. You are not authorized to login here.",
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
export const verifyOtp = async (req, res) => {
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
          name: rows[0].name,
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

// profile update
// =============================
// UPDATE PROFILE - Step 1: Personal Details
// =============================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, gotra } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    await db.query(
      "UPDATE users SET name = ?, email = ?, gotra = ? WHERE id = ?",
      [name, email || null, gotra || null, userId],
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: error.message });
  }
};

// =============================
// GET PROFILE - Full profile with default address
// =============================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [userRows] = await db.query(
      "SELECT id, name, phone, email, gotra, role, referral_code, pending_referral_discounts FROM users WHERE id = ?",
      [userId],
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const [addressRows] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? AND is_default = 1 LIMIT 1",
      [userId],
    );

    res.status(200).json({
      user: userRows[0],
      defaultAddress: addressRows[0] || null,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: error.message });
  }
};

// 1. Naya Address Add Karna
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_line1, city, state, pincode, address_type, is_default } =
      req.body;

    if (!address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Agar naya address default hai, toh baaki purane addresses ko default se hatao
    if (is_default) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
        userId,
      ]);
    }

    const [result] = await db.query(
      `INSERT INTO addresses (user_id, address_line1, city, state, pincode, address_type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address_line1,
        city,
        state,
        pincode,
        address_type,
        is_default ? 1 : 0,
      ],
    );

    res
      .status(201)
      .json({ message: "Address added successfully", id: result.insertId });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add address", error: error.message });
  }
};

// 2. Saare Addresses Get Karna (Listing)
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
      [userId],
    );
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching addresses", error: error.message });
  }
};

// 3. Ek Single Address Get Karna (Edit Form ke liye)
export const getSingleAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Address not found" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching address" });
  }
};

// 4. Address Update Karna
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { address_line1, city, state, pincode, address_type, is_default } =
      req.body;

    if (is_default) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
        userId,
      ]);
    }

    await db.query(
      `UPDATE addresses SET address_line1=?, city=?, state=?, pincode=?, address_type=?, is_default=? WHERE id=? AND user_id=?`,
      [
        address_line1,
        city,
        state,
        pincode,
        address_type,
        is_default ? 1 : 0,
        id,
        userId,
      ],
    );

    res.json({ message: "Address Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// 5. Address Delete Karna
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

// 6. Default Status Toggle Karna
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
      userId,
    ]);
    await db.query(
      "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    res.json({ message: "Default address updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to set default" });
  }
};

//10.add family member

export const addMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, relation, gotra, dob, rashi } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: "Name and Relation required" });
    }

    await db.query(
      `INSERT INTO user_family_members
            (user_id, name, relation ,gotra ,dob ,rashi)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, relation, gotra, dob, rashi],
    );
    res.json({ message: "Family member added" });
  } catch (error) {
    console.log("Server", error);
    res.status(500).json({ message: "Fill all Details" });
  }
};

// show all family members of user
export const allMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const [members] = await db.query(
      `SELECT * FROM user_family_members 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
      [userId],
    );
    res.json(members);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE a family member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Token se user ki ID nikaali

    // Pehle check karein ki ye member usi user ka hai ya nahi (Security check)
    const [member] = await db.execute(
      "SELECT * FROM user_family_members WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (member.length === 0) {
      return res
        .status(404)
        .json({ message: "Member not found or unauthorized" });
    }

    // Member delete karein
    await db.execute("DELETE FROM user_family_members WHERE id = ?", [id]);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete Member Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Bydefault get address of user
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      `
      SELECT id, address_line1, city, state, pincode
      FROM addresses
      WHERE user_id = ? AND is_default = true
      LIMIT 1
      `,
      [userId],
    );

    res.status(200).json(rows[0] || null);
  } catch (error) {
    console.error("Default Address Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch default address",
    });
  }
};
