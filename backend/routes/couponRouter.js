import express from "express";
import { 
  adminCreateCoupon, 
  adminGetCoupons, 
  adminDeleteCoupon, 
  validateCoupon,
  getPublicCoupons
} from "../controllers/couponController.js";
import { verifyToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// Admin Routes
router.post("/create", verifyToken, adminOnly, adminCreateCoupon);
router.get("/all", verifyToken, adminOnly, adminGetCoupons);
router.delete("/delete/:id", verifyToken, adminOnly, adminDeleteCoupon);

// User Routes
router.post("/validate", verifyToken, validateCoupon);
router.get("/public-coupons", verifyToken, getPublicCoupons);

export default router;
