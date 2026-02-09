import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRouter.js";
import userBookingDetailRoutes from "./routes/userBookingDetailRoutes.js";
import pool from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health check
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// Routes
app.use('/user', authRouter); // Yahan '/user' hona zaroori hai

// booking routes
app.use('/user/booking', userBookingDetailRoutes); //  '/user/booking-details'

// 🔥 DATABASE CHECK + SERVER START
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error.message);
  }
})();
