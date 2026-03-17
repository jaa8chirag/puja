import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tumhara existing folder: uploads/verifyPanditImg
    cb(null, path.join(__dirname, "../uploads/verifyPanditImg"));
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp + original extension
    const uniqueName = `${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Sirf JPG, PNG, WEBP allowed hai"), false);
  }
};

const uploadVerifyPandit = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
});

export default uploadVerifyPandit;
