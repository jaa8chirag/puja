import express from "express";
import uploadVerifyPandit from "../middleware/multerverifypandit.js";
import {
  addVerifyPandit,
  getAllVerifyPandits,
  deleteVerifyPandit,
  updateVerifyPandit, // 👈 Isse import kiya
} from "../controllers/verifypanditcontroller.js";

const router = express.Router();

router.get("/", getAllVerifyPandits);
router.post("/", uploadVerifyPandit.single("image"), addVerifyPandit);
router.put("/:id", uploadVerifyPandit.single("image"), updateVerifyPandit); // 👈 Yeh missing tha
router.delete("/:id", deleteVerifyPandit);

export default router;