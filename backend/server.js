import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// ── Config ─────────────────────────────────────────────────
dotenv.config();

// ── DB ─────────────────────────────────────────────────────
import pool from "./config/db.js";

// ── Socket Handlers ────────────────────────────────────────
import initChatSocket from "./socket/chatSocket.js";
import { setupAIPandit } from "./controllers/aiPanditController.js";

// ── Route Imports ──────────────────────────────────────────
import authRouter from "./routes/authRouter.js";
import servicesRouter from "./routes/servicesRoutes.js";
import partnerRouter from "./routes/partnerRouter.js";
import adminRouter from "./routes/adminRouter.js";
import customerCare from "./routes/customerCareRouter.js";
import kundliRouter from "./routes/kundliRouter.js";
import blogsRouter from "./routes/blogsRouter.js";
import nameCorrectionRouter from "./controllers/nameCorrectionController.js";
import chatRouter from "./routes/chatRouter.js";
import contribution from "./routes/contributionRouter.js";
import verifypandiRoutes from "./routes/verifypanditRoutes.js";
import paymentRouter from "./routes/payment.routes.js";
import dataRouter from "./routes/aartiAndEventRoutes.js";
import faqRouter from "./routes/faqRoutes.js";
import couponRouter from "./routes/couponRouter.js";
import reviewsRouter from "./routes/reviewsRouter.js";
import newsletterRouter from "./routes/newsletterRouter.js";
import razorpayRouter from "./routes/razorpayRouter.js";
import settingsRouter from "./routes/settingsRouter.js";
import pdfRouter from "./routes/pdfRouter.js";

// ── Controller Imports (direct handler for single routes) ──
import { debugSweph } from "./controllers/kundliController.js";
import { getPageBySlug } from "./controllers/adminController.js";

// ── App Setup ──────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── Socket Initialization ──────────────────────────────────
setupAIPandit(io);
initChatSocket(io);

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health Check ───────────────────────────────────────────
app.get("/", (req, res) => res.send("Server running ✅"));

// ── API Routes ─────────────────────────────────────────────
app.use("/api/user", authRouter);
app.use("/api/puja", servicesRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/verify-pandit", verifypandiRoutes);
app.use("/api/customerCare", customerCare);
app.use("/api/kundli", kundliRouter);
app.use("/api/name", nameCorrectionRouter);
app.use("/api/name", pdfRouter);
app.use("/api/chat", chatRouter);
app.use("/api/contributions", contribution);
app.use("/api/blogs", blogsRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/content", dataRouter);
app.use("/api/admin/faq", faqRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/newsletter", newsletterRouter);
app.use("/api/razorpay", razorpayRouter);
app.use("/api/settings", settingsRouter);

// Public Pages Route (no auth needed)
app.get("/api/pages/:slug", getPageBySlug);

// ── Start Server ───────────────────────────────────────────
const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      debugSweph();
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
