import express from "express";
import { createOrder, verifyPayment, initiateRefund } from "../controllers/razorpayController.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);
router.post("/initiate-refund", verifyToken, isAdmin, initiateRefund);

export default router;
