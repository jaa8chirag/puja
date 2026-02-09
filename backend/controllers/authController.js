import db from '../config/db.js'
import jwt from 'jsonwebtoken'

let otpStore = {}; // Temporary memory for OTPs

// --- 1. SIGNUP REQUEST ---
export const signupRequest = async (req, res) => {
    try {
        const { name, phone, email, gotra } = req.body;
        if (!phone || !name) return res.status(400).json({ message: "Name and Phone are required" });

        const [existing] = await db.query("SELECT id FROM users WHERE phone = ?", [phone]);
        if (existing.length > 0) return res.status(409).json({ message: "Already registered. Please Login." });

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore[phone] = {
            userData: { name, phone, email, gotra },
            otp: otp,
            type: 'SIGNUP',
            expires: Date.now() + 10 * 60 * 1000
        };

        console.log(`\n--- SIGNUP OTP FOR ${phone}: ${otp} ---\n`);
        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- 2. SIGNUP VERIFY (With Transactions & Address) ---
export const signupVerify = async (req, res) => {
    let connection;
    try {
        const { phone, otp, role, address, city, state, gotra, email, name } = req.body; 
        const session = otpStore[phone];

        if (!session || session.type !== 'SIGNUP' || session.otp.toString() !== otp.toString()) {
            return res.status(400).json({ message: "Invalid OTP or Session Expired" });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            "INSERT INTO users (name, phone, email, gotra, role) VALUES (?, ?, ?, ?, ?)",
            [name, phone, email || null, gotra || null, role || "user"]
        );

        const newUserId = userResult.insertId;

        if (address) {
            await connection.query(
                "INSERT INTO user_addresses (user_id, address_line, city, state, is_default) VALUES (?, ?, ?, ?, ?)",
                [newUserId, address, city || null, state || null, 1]
            );
        }

        await connection.commit();
        delete otpStore[phone];

        const token = jwt.sign(
            { id: newUserId, name, phone, role: role || "user" }, 
            process.env.JWT_SECRET || 'secret', 
            { expiresIn: '7d' }
        );

        res.status(201).json({ message: "Verified Successfully!", token, role: role || "user" });

    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: "Error saving data", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

// --- 3. LOGIN REQUEST (Modified for Partner Check) ---
export const loginRequest = async (req, res) => {
    try {
        const { phone, role } = req.body; // Frontend se role ('user' ya 'pandit') bhejien
        
        // Role wise check: Pandit login tabhi hoga jab DB mein role 'pandit' ho
        const [rows] = await db.query("SELECT id, role FROM users WHERE phone = ?", [phone]);
        
        if (rows.length === 0) return res.status(404).json({ message: "Account not found." });
        
        // Security Check: Agar Pandit login page hai aur user 'user' hai, toh block karein
        if (role && rows[0].role !== role) {
            return res.status(403).json({ message: `Access denied. You are registered as a ${rows[0].role}.` });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        otpStore[phone] = { otp, type: 'LOGIN', expires: Date.now() + 5 * 60 * 1000 };

        console.log(`\n--- LOGIN OTP FOR ${phone}: ${otp} ---\n`);
        res.status(200).json({ message: "OTP sent" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// --- 4. VERIFY OTP (Login Complete) ---
export const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const session = otpStore[phone];

        if (session && session.type === 'LOGIN' && session.otp.toString() === otp.toString()) {
            const [rows] = await db.query("SELECT id, name, phone, email, role FROM users WHERE phone = ?", [phone]);
            delete otpStore[phone];

            const token = jwt.sign({
                id: rows[0].id,
                name: rows[0].name,
                phone: rows[0].phone,
                email: rows[0].email,
                role: rows[0].role // Token mein role hona Dashboard redirection ke liye zaroori hai
            }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

            res.status(200).json({ 
                message: "Login success", 
                token, 
                role: rows[0].role 
            });
        } else {
            res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
    }
};

//5.add-address

export const addAddress = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            address_line,
            city,
            state,
            pincode,
            address_type,
            is_default
        } = req.body;

        if (!address_line) {
            return res.status(400).json({ message: "Address is required" });
        }

        if (is_default) {
            await db.query(
                "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
                [userId]
            );
        }

        const [result] = await db.query(
            `INSERT INTO user_addresses
            (user_id, address_line, city, state, pincode, address_type, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                address_line,
                city,
                state,
                pincode,
                address_type,
                is_default ? 1 : 0
            ]
        );

        res.status(201).json({
            message: "Address added successfully",
            addressId: result.insertId
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to add address",
            error: error.message
        });
    }
};


// 6.users ka profile mai sara address dikhana
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      "SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC",
      [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch addresses",
      error: error.message
    });
  }
};


//7.get single address
export const getSingleAddress = async (req, res) => {

    try {

        const { id } = req.params;

        const [rows] = await db.query(
            "SELECT * FROM user_addresses WHERE id = ?",
            [id]
        );

        res.json(rows[0]);

    } catch (error) {
        res.status(500).json({ message: "Error fetching address" });
    }
};

//8. set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // Remove previous default
    await db.query(
      "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
      [userId]
    );

    // Set new default
    await db.query(
      "UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    res.json({ message: "Default address updated" });

  } catch (error) {
    res.status(500).json({ message: "Error updating default address" });
  }
};

//9.updated arddress
export const updateAddress = async (req, res) => {

    try {

        const { id } = req.params;
        const userId = req.user.id;

        const {
            address_line,
            city,
            state,
            pincode,
            address_type,
            is_default
        } = req.body;

        if (is_default) {
            await db.query(
                "UPDATE user_addresses SET is_default = 0 WHERE user_id = ?",
                [userId]
            );
        }

        await db.query(
            `UPDATE user_addresses 
             SET address_line=?, city=?, state=?, pincode=?, address_type=?, is_default=?
             WHERE id=? AND user_id=?`,
            [
                address_line,
                city,
                state,
                pincode,
                address_type,
                is_default ? 1 : 0,
                id,
                userId
            ]
        );

        res.json({ message: "Address Updated" });

    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

// DELETE a saved address
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Token se login user ki ID li

    // Pehle check karein ki ye address isi user ka hai ya nahi
    const [address] = await db.execute(
      "SELECT * FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (address.length === 0) {
      return res.status(404).json({ 
        message: "Address not found or you don't have permission" 
      });
    }

    // Agar address default hai, toh delete karne se pehle sochna hoga 
    // (Optional: Aap prevent kar sakte hain ya delete karne de sakte hain)

    await db.execute("DELETE FROM user_addresses WHERE id = ?", [id]);

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//10.add family member

export const addMember = async(req,res) =>{
    try{
        const userId = req.user.id;
        const { name, relation, gotra, dob, rashi} = req.body;       

        if(!name || !relation){
            return res.status(400).json({message:"Name and Relation required"})
        }

        await db.query(
            `INSERT INTO user_family_members
            (user_id, name, relation ,gotra ,dob ,rashi)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId,name, relation, gotra, dob, rashi]
        );
        res.json({ message: "Family member added" });

    }catch(error){
        console.log("Server",error)
        res.status(500).json({ message: "Server error" });
    }
}


// show all family members of user
export const allMembers = async(req,res)=>{
    try{
        const userId = req.user.id;
        const [members] = await db.query(
            `SELECT * FROM user_family_members 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
            [userId]
        );
        res.json(members)
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Server Error"})
    }
}


// DELETE a family member
export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Token se user ki ID nikaali

    // Pehle check karein ki ye member usi user ka hai ya nahi (Security check)
    const [member] = await db.execute(
      "SELECT * FROM user_family_members WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (member.length === 0) {
      return res.status(404).json({ message: "Member not found or unauthorized" });
    }

    // Member delete karein
    await db.execute("DELETE FROM user_family_members WHERE id = ?", [id]);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Delete Member Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
