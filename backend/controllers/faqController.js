import db from "../config/db.js"; // Aapka pool connection file

// 1. GET ALL FAQs (User/Partner dono ke liye)
export const getAllFAQs = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, question, answer, created_at FROM faqs ORDER BY id DESC",
    );
    res.status(200).json({
      success: true,
      faqs: rows,
    });
  } catch (error) {
    console.error("Fetch FAQ Error:", error);
    res.status(500).json({
      success: false,
      message: "FAQs fetch nahi ho paye",
    });
  }
};

// 2. CREATE FAQ (Admin Panel ke liye)
export const createFAQ = async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res
      .status(400)
      .json({ success: false, message: "Sawal aur Jawab dono chahiye" });
  }

  try {
    const query = "INSERT INTO faqs (question, answer) VALUES (?, ?)";
    const [result] = await db.query(query, [question, answer]);

    res.status(201).json({
      success: true,
      message: "FAQ successfully add ho gaya",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Create FAQ Error:", error);
    res
      .status(500)
      .json({ success: false, message: "FAQ add karne mein error aaya" });
  }
};

// 3. UPDATE FAQ
export const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE faqs SET question = ?, answer = ? WHERE id = ?",
      [question, answer, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "FAQ nahi mila" });
    }

    res.status(200).json({ success: true, message: "FAQ update ho gaya" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update fail ho gaya" });
  }
};

// 4. DELETE FAQ
export const deleteFAQ = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM faqs WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "FAQ nahi mila" });
    }

    res.status(200).json({ success: true, message: "FAQ delete ho gaya" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete fail ho gaya" });
  }
};
