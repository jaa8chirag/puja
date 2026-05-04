import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import db from "../config/db.js";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({
      success: false,
      message: "Could not create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid signature sent!",
    });
  }
};

export const initiateRefund = async (req, res) => {
  const { paymentId, amount, bookingId } = req.body;

  try {
    const options = {
      payment_id: paymentId,
    };

    // If amount is provided, refund that specific amount (in paise)
    // Else, Razorpay will refund the full amount if amount is not passed
    if (amount) {
      options.amount = amount * 100;
    }

    const refund = await razorpay.payments.refund(paymentId, options);

    // Update booking status in database
    if (bookingId) {
      await db.query("UPDATE puja_requests SET status = 'refunded' WHERE id = ?", [bookingId]);
    }

    res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      refund,
    });
  } catch (error) {
    console.error("Razorpay Refund Error:", error);
    res.status(500).json({
      success: false,
      message: error.description || "Could not initiate refund",
    });
  }
};
