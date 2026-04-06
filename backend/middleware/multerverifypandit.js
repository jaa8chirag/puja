import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Folder: uploads/verifyPanditImg
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
    // Error for wrong file types
    cb(new Error("Only JPG, PNG, and WEBP images are allowed!"), false);
  }
};

const uploadVerifyPandit = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ Fixed to 5MB
});

export default uploadVerifyPandit;
