// routes/verifypanditroutes.js
import express from "express";
import uploadVerifyPandit from "../middleware/multerverifypandit.js";
// import { adminOnly } from "../middleware/admin.js";
import {
  addVerifyPandit,
  getAllVerifyPandits,
  deleteVerifyPandit,
} from "../controllers/verifypanditcontroller.js";

const router = express.Router();

// POST   /api/admin/verify-pandit   → multer image upload + DB save
router.post("/", uploadVerifyPandit.single("image"), addVerifyPandit);

// GET    /api/admin/verify-pandit   → sab records lao
router.get("/", getAllVerifyPandits);

// DELETE /api/admin/verify-pandit/:id → DB record + image file delete
router.delete("/:id", deleteVerifyPandit);

export default router;
