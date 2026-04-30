import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  signupRequest,
  signupVerify,
  loginRequest,
  verifyOtp,
  addAddress,
  getUserAddresses,
  setDefaultAddress,
  getSingleAddress,
  deleteAddress,
  updateAddress,
  addMember,
  allMembers,
  deleteMember,
  getDefaultAddress,
  updateProfile,
  getProfile,
  getReferralRewards,
} from "../controllers/authController.js";

import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// 1. Check karein ki 'uploads' folder exist karta hai, nahi toh bana dein
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Storage Engine setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Files yahan save hongi
  },
  filename: (req, file, cb) => {
    // File ka unique naam (Timestamp + Original Name)
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 3. File Filter (Optional: Sirf images/pdf allow karne ke liye)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG and PDF are allowed."),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// 4. Route par middleware apply karein
// 'document' wahi key hai jo aapne frontend FormData mein append ki hai

// -------- AUTH --------
router.post("/signup-request", signupRequest);
router.post("/signup-verify", upload.single("document"), signupVerify);
router.post("/login-request", loginRequest);
router.post("/verify-otp", verifyOtp);

// Profile Routes
router.get("/get-profile", verifyToken, getProfile);
router.put("/update-profile", verifyToken, updateProfile);

// -------- ADDRESS MANAGEMENT ROUTES --------

router.post("/add-address", verifyToken, addAddress);
router.get("/get-addresses", verifyToken, getUserAddresses);
router.get("/address/:id", verifyToken, getSingleAddress);
router.put("/update-address/:id", verifyToken, updateAddress);
router.delete("/delete-address/:id", verifyToken, deleteAddress);
router.put("/set-default/:id", verifyToken, setDefaultAddress);
router.get("/default-address", verifyToken, getDefaultAddress);

// -------------ADD-Members-------------------
router.post("/add-member", verifyToken, addMember);
router.get("/get-members", verifyToken, allMembers);
router.delete("/delete-member/:id", verifyToken, deleteMember);

// -------- REFERRAL REWARDS --------
router.get("/referral-rewards", verifyToken, getReferralRewards);

export default router;
