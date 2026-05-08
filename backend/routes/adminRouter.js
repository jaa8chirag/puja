import express from "express";
import { upload, pdfUpload } from "../middleware/multerMiddleware.js";
import { adminOnly } from "../middleware/admin.js";
import {
  AdminLogin,
  createPandit,
  createService,
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
  getAllContributions,
  addContribution,
  updateContribution,
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  uploadPageImage,
  deleteContribution,
  getAllNameCorrections,
  getAllPersonalInfo,
  createPersonalInfo,
  updatePersonalInfo,
  deletePersonalInfo,
  updatePersonalInfoStatus,
  adminCreateUser,
  addPanditPayout,
  getAllKundliRequests,
  deleteKundliRequest,
  updateServiceStatus,
  updatePageStatus,
  updateContributionStatus,
} from "../controllers/adminController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post(
  "/replace-checklist",
  verifyToken,
  adminOnly,
  pdfUpload.single("pdf"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File nahi mili" });

    // ✅ Sync to dist folder if it exists (for live server)
    try {
      const publicPath = req.file.path;
      const distPath = path.join(__dirname, "../../frontend/dist/pdf/Puja_Samagri_Checklist.pdf");
      
      if (fs.existsSync(path.dirname(distPath))) {
        fs.copyFileSync(publicPath, distPath);
        console.log("✅ PDF synced to dist folder");
      }
    } catch (err) {
      console.error("❌ Sync to dist failed:", err);
      // Don't fail the request, but log the error
    }

    res.json({ success: true, message: "Checklist successfully update ho gayi ✅" });
  }
);
// Admin Authentication Routes
router.post("/login", AdminLogin);

// Admin Dashboard Routes
router.get("/dashboard", verifyToken, adminOnly, getDashboardStats);

// chart data for admin dashboard
router.get("/monthly-growth", verifyToken, adminOnly, getMonthlyGrowthChart);

// User Management, CRUD Operations Routes for Admin
router.get("/users", verifyToken, adminOnly, getAllUsers);
router.post("/createUser", verifyToken, adminOnly, adminCreateUser);
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
router.patch("/services/status/:id", verifyToken, adminOnly, updateServiceStatus);

// ── Pages Routes (About Us & Privacy Policy)
router.get("/pages", verifyToken, adminOnly, getPages);
router.get("/pages/:slug", verifyToken, adminOnly, getPageBySlug);
router.post("/pages", verifyToken, adminOnly, createPage);
router.put("/pages/:slug", verifyToken, adminOnly, updatePage);
router.post(
  "/pages/:slug/upload-image",
  verifyToken,
  adminOnly,
  upload.single("image"),
  uploadPageImage,
);
router.patch("/pages/status/:id", verifyToken, adminOnly, updatePageStatus);

//contributionn
router.get("/contributions", verifyToken, adminOnly, getAllContributions);
router.post("/createContribution", verifyToken, adminOnly, addContribution);
router.put("/contributions/:id", verifyToken, adminOnly, updateContribution);
router.delete("/contributions/:id", verifyToken, adminOnly, deleteUser); // Logic wise deleteContribution hoga
router.patch("/contributions/status/:id", verifyToken, adminOnly, updateContributionStatus);

// booking management routes for admin can be added here
router.get("/bookings", verifyToken, adminOnly, getAllBookings);
router.get("/bookings/:id", verifyToken, adminOnly, getBookingById);
router.get("/bookings_today", verifyToken, adminOnly, getTodayBookings);

// pandit management routes for admin can be added here
// router.get("/pandits", verifyToken, adminOnly, getAllPandits);
// router.post("/pandits", verifyToken, adminOnly, createPandit);
router.post(
  "/pandits",
  verifyToken,
  adminOnly,
  upload.single("document"),
  createPandit,
);
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
router.post("/pandit-payout", verifyToken, adminOnly, addPanditPayout);

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
// ── Name Correction Routes
router.get(
  "/name/name-correction/all",
  verifyToken,
  adminOnly,
  getAllNameCorrections,
);

router.get("/personal-info", getAllPersonalInfo);
router.post("/personal-info", verifyToken, adminOnly, createPersonalInfo);
router.put("/personal-info/:id", verifyToken, adminOnly, updatePersonalInfo);
router.delete("/personal-info/:id", verifyToken, adminOnly, deletePersonalInfo);
router.put(
  "/personal-info/:id/status",
  verifyToken,
  adminOnly,
  updatePersonalInfoStatus,
);

router.get("/kundli-requests", verifyToken, adminOnly, getAllKundliRequests);
router.delete("/kundli-requests/:id", verifyToken, adminOnly, deleteKundliRequest);

export default router;

