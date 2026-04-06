import db from "../config/db.js"; // <--- Sabse pehle ye check karein

export const getMyAssignedPujas = async (req, res) => {
  try {
    const panditId = req.user.id;

    const query = `
      SELECT 
        ra.id,
        ra.request_id,
        ra.pandit_id,
        ra.status,
        ra.price,
        ra.verify_otp,
        ra.assigned_at,
        ra.updated_at,
        b.bookingId,
        b.preferred_date,
        b.preferred_time,
        b.address,
        b.city,
        b.state,
        b.samagrikit,
        s.puja_name,
        s.puja_type,
        u.name AS customer_name,
        u.phone AS customer_phone
      FROM request_assignments ra
      LEFT JOIN puja_requests b ON b.id = ra.request_id
      LEFT JOIN services s ON s.id = b.service_id
      LEFT JOIN users u ON u.id = b.user_id
      WHERE ra.pandit_id = ?
      ORDER BY ra.assigned_at DESC
    `;

    const [rows] = await db.query(query, [panditId]);

    res.status(200).json({
      success: true,
      count: rows.length,
      bookings: rows,
    });
  } catch (error) {
    console.error("Pandit Fetch Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  let connection;

  try {
    const partnerId = req.user.id; // JWT se aayega

    const {
      name,
      email,
      gotra,
      address,
      city,
      state,
      pincode,
      address_type,
      paymentMethod,
      accountHolderName,
      bankName,
      bankAccountNumber,
      ifscCode,
      upiId,
    } = req.body;

    const documentPath = req.file ? req.file.path : null;

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Update users table
    await connection.query(
      `UPDATE users SET name = ?, email = ?, gotra = ? WHERE id = ?`,
      [name, email || null, gotra || null, partnerId],
    );

    // 2️⃣ Update Address (agar address_id ho to update, warna insert)
    if (address) {
      const [existing] = await connection.query(
        `SELECT id FROM addresses WHERE user_id = ? AND is_default = 1 LIMIT 1`,
        [partnerId],
      );

      if (existing.length > 0) {
        await connection.query(
          `UPDATE addresses SET address_line1 = ?, city = ?, state = ?, pincode = ?, address_type = ?
           WHERE user_id = ? AND is_default = 1`,
          [
            address,
            city,
            state,
            pincode || null,
            address_type || "home",
            partnerId,
          ],
        );
      } else {
        await connection.query(
          `INSERT INTO addresses (user_id, address_line1, city, state, address_type, pincode, is_default)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            partnerId,
            address,
            city,
            state,
            address_type || "home",
            pincode || null,
            1,
          ],
        );
      }
    }

    // 3️⃣ Update Pandit document (agar naya document upload kiya)
    if (documentPath) {
      await connection.query(
        `UPDATE pandits SET document_url = ? WHERE user_id = ?`,
        [documentPath, partnerId],
      );
    }

    // 4️⃣ Update Payment Details
    if (paymentMethod && ["bank", "upi"].includes(paymentMethod)) {
      const [existingPayment] = await connection.query(
        `SELECT id FROM partner_payment_details WHERE user_id = ? LIMIT 1`,
        [partnerId],
      );

      if (existingPayment.length > 0) {
        await connection.query(
          `UPDATE partner_payment_details
           SET payment_method = ?, account_holder_name = ?, bank_name = ?,
               bank_account_number = ?, ifsc_code = ?, upi_id = ?
           WHERE user_id = ?`,
          [
            paymentMethod,
            accountHolderName || null,
            bankName || null,
            bankAccountNumber || null,
            ifscCode ? ifscCode.toUpperCase() : null,
            upiId || null,
            partnerId,
          ],
        );
      } else {
        await connection.query(
          `INSERT INTO partner_payment_details
           (user_id, payment_method, account_holder_name, bank_name, bank_account_number, ifsc_code, upi_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            partnerId,
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

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully!",
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    if (connection) await connection.rollback();
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};
// export const getPanditProfile = async (req, res) => {
//   try {
//     const panditId = req.user.id;

//     // 1️⃣ Basic user info
//     // const [userRows] = await db.query(
//     //   "SELECT id, name, phone, email, gotra FROM users WHERE id = ?",
//     //   [panditId],
//     // );
//     const [userRows] = await db.query(
//       "SELECT id, name, phone, email, gotra, is_online FROM users WHERE id = ?",
//       [panditId],
//     );

//     if (userRows.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const user = userRows[0];

//     // 2️⃣ Default address from addresses table
//     const [addressRows] = await db.query(
//       `SELECT address_line1, city, state, pincode
//    FROM addresses
//    WHERE user_id = ?
//    ORDER BY is_default DESC, id ASC
//    LIMIT 1`,
//       [panditId],
//     );

//     // Add address to user object (if exists)
//     if (addressRows.length > 0) {
//       user.address = addressRows[0]; // {address_line1, city, state, pincode}
//     } else {
//       user.address = null;
//     }

//     res.json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error("Get Pandit Profile Error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const getPanditProfile = async (req, res) => {
  try {
    const panditId = req.user.id;

    const [userRows] = await db.query(
      "SELECT id, name, phone, email, gotra, is_online FROM users WHERE id = ?",
      [panditId],
    );

    if (userRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const user = userRows[0];

    // Address
    const [addressRows] = await db.query(
      `SELECT address_line1 AS address, city, state, pincode
       FROM addresses WHERE user_id = ?
       ORDER BY is_default DESC, id ASC LIMIT 1`,
      [panditId],
    );

    if (addressRows.length > 0) {
      user.address = addressRows[0].address;
      user.city = addressRows[0].city;
      user.state = addressRows[0].state;
      user.pincode = addressRows[0].pincode;
    }

    // ✅ Payment details — ye naya add kiya
    const [paymentRows] = await db.query(
      `SELECT payment_method, account_holder_name AS accountHolderName,
              bank_name AS bankName, bank_account_number AS bankAccountNumber,
              ifsc_code AS ifscCode, upi_id AS upiId
       FROM partner_payment_details WHERE user_id = ? LIMIT 1`,
      [panditId],
    );

    if (paymentRows.length > 0) {
      user.payment_method = paymentRows[0].payment_method;
      user.accountHolderName = paymentRows[0].accountHolderName;
      user.bankName = paymentRows[0].bankName;
      user.bankAccountNumber = paymentRows[0].bankAccountNumber;
      user.ifscCode = paymentRows[0].ifscCode;
      user.upiId = paymentRows[0].upiId;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get Pandit Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const markPujaComplete = async (req, res) => {
  try {
    const panditId = req.user.id;
    const bookingId = req.params.id;

    const [rows] = await db.query(
      "SELECT * FROM request_assignments WHERE request_id = ? AND pandit_id = ?",
      [bookingId, panditId],
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (rows[0].status === "completed")
      return res
        .status(400)
        .json({ success: false, message: "Puja already completed" });

    if (rows[0].status !== "accepted")
      return res
        .status(400)
        .json({ success: false, message: "OTP verify karo pehle" });

    // ✅ Dono tables update
    await db.query(
      "UPDATE puja_requests SET status = 'completed', completed_at = NOW() WHERE id = ?",
      [bookingId],
    );

    await db.query(
      "UPDATE request_assignments SET status = 'completed', updated_at = NOW() WHERE request_id = ? AND pandit_id = ?",
      [bookingId, panditId],
    );

    res.json({ success: true, message: "Puja completed successfully" });
  } catch (error) {
    console.error("Mark Complete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const verifyPujaOtp = async (req, res) => {
  try {
    const panditId = req.user.id;
    const { request_id, otp } = req.body;

    const [rows] = await db.query(
      "SELECT otp FROM puja_requests WHERE id = ?",
      [request_id],
    );

    if (rows.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    if (!rows[0].otp)
      return res.status(400).json({ success: false, message: "No OTP found" });

    if (String(rows[0].otp).trim() !== String(otp).trim())
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // ✅ sirf request_assignments = accepted
    await db.query(
      "UPDATE request_assignments SET status = 'accepted', updated_at = NOW() WHERE request_id = ? AND pandit_id = ?",
      [request_id, panditId],
    );

    res.json({ success: true, message: "OTP Verified" });
  } catch (error) {
    console.error("OTP Verify Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const toggleOnlineStatus = async (req, res) => {
  try {
    const panditId = req.user.id;
    const { is_online } = req.body;

    await db.query("UPDATE users SET is_online = ? WHERE id = ?", [
      is_online ? 1 : 0,
      panditId,
    ]);

    res.json({
      success: true,
      is_online: is_online ? 1 : 0,
      message: is_online ? "You are now Online" : "You are now Offline",
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
