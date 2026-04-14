import express from "express";
import { createOrder, verifyPayment } from "../controllers/razorpayController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/create-order", verifyToken, createOrder);
router.post("/verify-payment", verifyToken, verifyPayment);

export default router;
