import db from "../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import fetch from "node-fetch";
import { sendPaymentReceipt, sendResetCodeEmail } from "../utils/mailService.js";


// =============================
// 1️⃣ SIGNUP (Direct Register with Password)
// =============================
export const signup = async (req, res) => {
  let connection;
  try {
    const {
      name,
      phone,
      email,
      gotra,
      password,
      role,
      address,
      city,
      state,
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

    if (!phone || !name || !password) {
      return res.status(400).json({ message: "Name, Phone and Password are required" });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    if (role === "pandit" && paymentMethod === "upi" && upiId) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test((upiId || "").trim())) {
        return res.status(400).json({ message: "Invalid UPI ID format (e.g. name@upi)." });
      }
    }

    const [existing] = await db.query("SELECT id FROM users WHERE phone = ?", [phone]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Phone number already registered. Please Login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const documentPath = req.file ? req.file.path : null;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Insert into users
    let referredBy = null;
    if (referralCode) {
      const [refRow] = await connection.query("SELECT id FROM users WHERE referral_code = ?", [referralCode]);
      if (refRow.length > 0) referredBy = refRow[0].id;
    }

    const uniqueReferralCode = 'PUJA' + (name ? name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') : 'USR') + Math.floor(1000 + Math.random() * 9000);

    const [userResult] = await connection.query(
      "INSERT INTO users (name, phone, email, password, gotra, role, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, phone, email || null, hashedPassword, gotra || null, role || "user", uniqueReferralCode, referredBy],
    );

    const newUserId = userResult.insertId;

    // 2️⃣ Insert Address
    if (address) {
      await connection.query(
        `INSERT INTO addresses (user_id, address_line1, city, state, address_type, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newUserId, address, city, state, address_type || "home", pincode || null, 1],
      );
    }

    // 3️⃣ Insert Pandit Data
    if (role === "pandit") {
      await connection.query(
        "INSERT INTO pandits (user_id, pandit_type, document_url) VALUES (?, ?, ?)",
        [newUserId, panditType || "Standard", documentPath],
      );

      if (paymentMethod && ["bank", "upi"].includes(paymentMethod)) {
        await connection.query(
          `INSERT INTO partner_payment_details (user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [newUserId, paymentMethod, accountHolderName || null, bankName || null, bankAccountNumber || null, ifscCode ? ifscCode.toUpperCase() : null, upiId || null],
        );
      }
    }

    await connection.commit();

    const token = jwt.sign(
      { id: newUserId, name, phone, role: role || "user" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "90d" },
    );

    res.status(201).json({
      message: "Registered Successfully!",
      token,
      role: role || "user",
      user_id: newUserId,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    res.status(500).json({ message: "Registration failed", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// =============================
// 2️⃣ LOGIN (Password Based)
// =============================
export const login = async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Email/Phone and Password are required" });
    }

    // Lookup by phone OR email
    const [rows] = await db.query(
      "SELECT * FROM users WHERE (phone = ? OR email = ?) AND is_deleted = 0",
      [phone, phone],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Account not found with this Email or Phone." });
    }

    const user = rows[0];

    // Security Check: Role match hona chahiye (optional if needed)
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Access denied. Role mismatch." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "90d" },
    );

    res.status(200).json({
      message: "Login success",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// =============================
// 3️⃣ SOCIAL LOGIN (Google/Apple)
// =============================
export const socialAuth = async (req, res) => {
  try {
    const { google_id, apple_id, email, name, avatar_url } = req.body;

    if (!google_id && !apple_id) {
      return res.status(400).json({ message: "Social ID is required" });
    }

    let query = "";
    let value = "";
    if (google_id) {
      query = "SELECT * FROM users WHERE google_id = ? AND is_deleted = 0";
      value = google_id;
    } else {
      query = "SELECT * FROM users WHERE apple_id = ? AND is_deleted = 0";
      value = apple_id;
    }

    const [rows] = await db.query(query, [value]);

    let user;
    if (rows.length === 0) {
      // Create new user if not exists
      const uniqueReferralCode = 'PUJA' + (name ? name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '') : 'USR') + Math.floor(1000 + Math.random() * 9000);
      
      const [result] = await db.query(
        "INSERT INTO users (name, email, google_id, apple_id, avatar_url, role, referral_code) VALUES (?, ?, ?, ?, ?, 'user', ?)",
        [name, email, google_id || null, apple_id || null, avatar_url || null, uniqueReferralCode]
      );
      
      const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      user = newUser[0];
    } else {
      user = rows[0];
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "90d" },
    );

    res.status(200).json({
      message: "Social Login success",
      token,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Social Auth failed", error: error.message });
  }
};

// =============================
// UPDATE PROFILE - Step 1: Personal Details
// =============================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, gotra, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (phone && phone.length !== 10) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    await db.query(
      "UPDATE users SET name = ?, email = ?, gotra = ?, phone = ? WHERE id = ?",
      [name, email?.trim() || null, gotra?.trim() || null, phone?.trim() || null, userId],
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile", error: error.message });
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
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// 1. Naya Address Add Karna
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address_line1, city, state, pincode, address_type, is_default } = req.body;

    if (!address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (is_default) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    }

    const [result] = await db.query(
      `INSERT INTO addresses (user_id, address_line1, city, state, pincode, address_type, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, address_line1, city, state, pincode, address_type, is_default ? 1 : 0],
    );

    res.status(201).json({ message: "Address added successfully", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Failed to add address", error: error.message });
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
    res.status(500).json({ message: "Error fetching addresses", error: error.message });
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

    if (rows.length === 0) return res.status(404).json({ message: "Address not found" });
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
    const { address_line1, city, state, pincode, address_type, is_default } = req.body;

    if (is_default) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    }

    await db.query(
      `UPDATE addresses SET address_line1=?, city=?, state=?, pincode=?, address_type=?, is_default=? WHERE id=? AND user_id=?`,
      [address_line1, city, state, pincode, address_type, is_default ? 1 : 0, id, userId],
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

    await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
    await db.query(
      "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    res.json({ message: "Default address updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to set default" });
  }
};

// 10. add family member
export const addMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, relation, gotra, dob, rashi } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: "Name and Relation required" });
    }

    await db.query(
      `INSERT INTO user_family_members (user_id, name, relation ,gotra ,dob ,rashi) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, relation, gotra, dob, rashi],
    );
    res.json({ message: "Family member added" });
  } catch (error) {
    console.error("Add Member Error:", error);
    res.status(500).json({ message: "Fill all Details" });
  }
};

// show all family members of user
export const allMembers = async (req, res) => {
  try {
    const userId = req.user.id;
    const [members] = await db.query(
      `SELECT * FROM user_family_members WHERE user_id = ? ORDER BY created_at DESC`,
      [userId],
    );
    res.json(members);
  } catch (error) {
    console.error("All Members Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE a family member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [member] = await db.execute(
      "SELECT * FROM user_family_members WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if (member.length === 0) {
      return res.status(404).json({ message: "Member not found or unauthorized" });
    }

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
      `SELECT id, address_line1, city, state, pincode FROM addresses WHERE user_id = ? AND is_default = true LIMIT 1`,
      [userId],
    );
    res.status(200).json(rows[0] || null);
  } catch (error) {
    console.error("Default Address Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch default address" });
  }
};

// =============================
// GET REFERRAL REWARDS
// =============================
export const getReferralRewards = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rewards] = await db.query(
      "SELECT id, discount_percentage, status, created_at FROM user_referral_rewards WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC",
      [userId]
    );
    res.status(200).json({ success: true, rewards });
  } catch (error) {
    console.error("Get Referral Rewards Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch rewards" });
  }
};
// =============================
// 4️⃣ FORGOT PASSWORD
// =============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [rows] = await db.query("SELECT id FROM users WHERE email = ? AND is_deleted = 0", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No account found with this email address" });
    }

    // Generate a 6-digit numeric reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
      [resetCode, expiry, email]
    );

    // Send code via Email
    const emailSent = await sendResetCodeEmail(email, resetCode);

    res.status(200).json({ 
      success: true, 
      message: emailSent 
        ? "Reset code sent successfully to your email." 
        : "Reset code generated. Please check your email or contact support.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error in forgot password", error: error.message });
  }
};

// =============================
// 5️⃣ RESET PASSWORD
// =============================
export const resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW() AND is_deleted = 0",
      [email, resetCode]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error in reset password", error: error.message });
  }
};

// =============================
// GOOGLE LOGIN
// =============================
export const googleLogin = async (req, res) => {
  try {
    const { idToken, phone } = req.body;
    if (!idToken) return res.status(400).json({ message: "Token is required" });

    let email, name, picture, googleId;

    // Check if it's an Access Token (starts with ya29) or an ID Token (JWT)
    if (idToken.startsWith("ya29.") || !idToken.includes(".")) {
      const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${idToken}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_description || "Invalid Access Token");
      email = data.email;
      name = data.name;
      picture = data.picture;
      googleId = data.sub;
    } else {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
      googleId = payload.sub;
    }

    if (!email) throw new Error("Could not retrieve email from Google");

    // Check if user exists with this email or google_id
    let [users] = await db.query(
      "SELECT * FROM users WHERE (email = ? OR google_id = ?) AND is_deleted = 0",
      [email, googleId]
    );

    let user;
    if (users.length === 0) {
      // New user — need phone before creating account
      if (!phone) {
        return res.status(200).json({
          success: false,
          needsPhone: true,
          message: "Phone number required for new account",
          tempGoogle: { name, email, googleId, picture }
        });
      }
      // Create new user with phone + google_id
      const [result] = await db.query(
        "INSERT INTO users (name, email, phone, google_id, role, avatar_url, is_verified) VALUES (?, ?, ?, ?, 'user', ?, 1)",
        [name, email, phone, googleId || null, picture]
      );
      const [newUsers] = await db.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
      user = newUsers[0];
    } else {
      user = users[0];
      // Existing user — check if phone missing
      if (!user.phone && !phone) {
        return res.status(200).json({
          success: false,
          needsPhone: true,
          message: "Phone number required",
          tempGoogle: { name, email, googleId, picture }
        });
      }
      // Update missing fields
      const updates = [];
      const values = [];
      if (!user.phone && phone) { updates.push("phone = ?"); values.push(phone); }
      if (!user.google_id && googleId) { updates.push("google_id = ?"); values.push(googleId); }
      if (!user.avatar_url && picture) { updates.push("avatar_url = ?"); values.push(picture); }
      if (updates.length > 0) {
        values.push(user.id);
        await db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
        if (phone) user.phone = phone;
      }
    }

    // Generate JWT for our app session
    const token = jwt.sign(
      { id: user.id, name: user.name, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "90d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar_url
      }
    });
  } catch (error) {
    console.error("❌ Google Login Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Google Authentication failed", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
