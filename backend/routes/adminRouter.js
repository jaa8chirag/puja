import express from "express";

import { adminOnly } from "../middleware/admin.js";
import {
  AdminLoginRequest,
  AdminVerifyOtp,
  createPandit,
  createService,
  createUser,
  deletePandit,
  deleteService,
  deleteUser,
  getAllBookings,
  getAllPandits,
  getAllServices,
  getAllUsers,
  getBookingById,
  getDashboardStats,
  getDashboardSummary,
  getDonationBreakdown,
  getMonthlyGrowthChart,
  getMonthlyRevenue,
  getPanditEarnings,
  getRecentTransactions,
  getRevenueByCity,
  getRevenueByDateRange,
  getRevenueByServiceType,
  getSamagriKitRevenue,
  getServiceById,
  getSinglePandit,
  getTodayBookings,
  getTopServices,
  getUserById,
  togglePanditBlock,
  updatePandit,
  updateService,
  updateUser,
  getPanditBookingHistory,
  getGodViewAnalytics,
  adminGetAllBlogs,
  adminGetBlogById,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  adminToggleBlogStatus,
  updateBookingStatus,
  createBenefit,
  getBenefitsByService,
  updateBenefit,
  deleteBenefit,
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/auth.js";
import { upload } from "../middleware/multerMiddleware.js";

const router = express.Router();

// Admin Authentication Routes can be added here (e.g., login, logout)
router.post("/login", AdminLoginRequest);
router.post("/verify-otp", AdminVerifyOtp);

// Admin Dashboard Routes
router.get("/dashboard", verifyToken, adminOnly, getDashboardStats);

// chart data for admin dashboard
router.get("/monthly-growth", verifyToken, adminOnly, getMonthlyGrowthChart);

// User Management, CRUD Operations Routes for Admin
router.get("/users", verifyToken, adminOnly, getAllUsers);
router.post("/createUser", verifyToken, adminOnly, createUser);
router.get("/users/:id", verifyToken, adminOnly, getUserById);
router.put("/users/:id", verifyToken, adminOnly, updateUser);
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// service management routes for admin can be added here

router.get("/services", verifyToken, adminOnly, getAllServices);
router.get("/services/:id", verifyToken, adminOnly, getServiceById);
router.post(
  "/services",
  verifyToken,
  adminOnly,
  upload.single("image"),
  createService,
);
router.put(
  "/services/:id",
  verifyToken,
  adminOnly,
  upload.single("image"),
  updateService,
);
router.delete("/services/:id", verifyToken, adminOnly, deleteService);

// booking management routes for admin can be added here
router.get("/bookings", verifyToken, adminOnly, getAllBookings);
router.get("/bookings/:id", verifyToken, adminOnly, getBookingById);
router.get("/bookings_today", verifyToken, adminOnly, getTodayBookings);

// pandit management routes for admin can be added here
// router.get("/pandits", verifyToken, adminOnly, getAllPandits);
router.post("/pandits", verifyToken, adminOnly, createPandit);
router.get("/pandits", verifyToken, adminOnly, getAllPandits);
router.get("/pandits/:id", verifyToken, adminOnly, getSinglePandit);
router.put("/pandits/:id", verifyToken, adminOnly, updatePandit);
router.delete("/pandits/:id", verifyToken, adminOnly, deletePandit);
router.put("/pandits/block/:id", verifyToken, adminOnly, togglePanditBlock);

router.get(
  "/pandits/history/:id",
  verifyToken,
  adminOnly,
  getPanditBookingHistory,
);
// router.put("/pandits/assign/:bookingId", assignPanditToBooking);
// financial routes

// ── KPI Summary Cards
router.get("/summary", verifyToken, adminOnly, getDashboardSummary);

// ── Charts
router.get("/monthly-revenue", verifyToken, adminOnly, getMonthlyRevenue); // last 12 months trend
router.get("/by-service-type", verifyToken, adminOnly, getRevenueByServiceType); // home_puja, katha, etc.
router.get("/top-services", verifyToken, adminOnly, getTopServices); // ?limit=10
router.get("/by-city", verifyToken, adminOnly, getRevenueByCity); // top 10 cities

// ── Donations
router.get("/donations", verifyToken, adminOnly, getDonationBreakdown); // Vastra Dan, Anna Dan...
router.get("/samagri-kit", verifyToken, adminOnly, getSamagriKitRevenue); // kit sold count + revenue

// ── Transactions Table
router.get("/transactions", verifyToken, adminOnly, getRecentTransactions); // ?page=1&limit=20

// ── Pandit Performance
router.get("/pandit-earnings", verifyToken, adminOnly, getPanditEarnings);

// ── Custom Date Range Report
router.get("/date-range", verifyToken, adminOnly, getRevenueByDateRange); // ?from=2026-02-01&to=2026-03-03

//----------Analytics Routes
router.get("/analytics", verifyToken, adminOnly, getGodViewAnalytics);

// ── Blogs Management ─────────────────────────────────────────
router.get("/blogs", verifyToken, adminOnly, adminGetAllBlogs);
router.post(
  "/blogs",
  verifyToken,
  adminOnly,
  upload.single("image"),
  adminCreateBlog,
);
router.get("/blogs/:id", verifyToken, adminOnly, adminGetBlogById);
router.put(
  "/blogs/:id",
  verifyToken,
  adminOnly,
  upload.single("image"),
  adminUpdateBlog,
);
router.delete("/blogs/:id", verifyToken, adminOnly, adminDeleteBlog);
router.patch(
  "/blogs/:id/status",
  verifyToken,
  adminOnly,
  adminToggleBlogStatus,
);

router.put("/update-status/:id", verifyToken, adminOnly, updateBookingStatus);

// Benefits management routes (add after service routes)
router.post(
  "/services/:serviceId/benefits",
  verifyToken,
  adminOnly,
  createBenefit,
);
router.get(
  "/services/:serviceId/benefits",
  verifyToken,
  adminOnly,
  getBenefitsByService,
);
router.put("/benefits/:id", verifyToken, adminOnly, updateBenefit);
router.delete("/benefits/:id", verifyToken, adminOnly, deleteBenefit);

export default router;
