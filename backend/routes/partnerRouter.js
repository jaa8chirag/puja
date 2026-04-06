// routes/partnerRoutes.js
import express from "express";
import { verifyToken } from "../middleware/auth.js"; // Pandit ka token check karne ke liye
import {
  getMyAssignedPujas,
  getPanditProfile,
  markPujaComplete,
  toggleOnlineStatus,
  updateProfile,
  verifyPujaOtp,
} from "../controllers/partnerController.js";

const router = express.Router();

router.get("/my-pujas", verifyToken, getMyAssignedPujas);

router.get("/profile", verifyToken, getPanditProfile);

// ✅ Add this PUT route
// router.put("/update-profile", verifyToken, updatePanditProfile);
router.put("/update-profile", verifyToken, updateProfile);

// mark complete puja
router.put("/complete-puja/:id", verifyToken, markPujaComplete);

//verify otp routes
router.post("/verify-otp", verifyToken, verifyPujaOtp);

// ablity
router.put("/toggle-status", verifyToken, toggleOnlineStatus);
export default router;
