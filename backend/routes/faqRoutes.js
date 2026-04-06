import express from "express";
import {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

const router = express.Router();

// Public route (Customer/Partner ke liye)
router.get("/get-all", getAllFAQs);

// Admin routes (Inhe aap protect bhi kar sakte hain middleware se)
router.post("/add", createFAQ);
router.put("/update/:id", updateFAQ);
router.delete("/delete/:id", deleteFAQ);

export default router;
