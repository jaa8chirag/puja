import express from "express";
import { getSetting, updateSetting } from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// Publicly readable for frontend calculation
router.get("/:key", getSetting);

// Only admin can update
router.post("/update", verifyToken, adminOnly, updateSetting);

export default router;
