import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Existing storage (mat badlo)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// ✅ Naya — PDF replace ke liye alag storage
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Frontend public/pdf folder ka path
    const pdfPath = path.join(__dirname, "../../frontend/public/pdf");
    cb(null, pdfPath);
  },
  filename: function (req, file, cb) {
    // Hamesha same naam — purani file replace ho jayegi
    cb(null, "Puja_Samagri_Checklist.pdf");
  },
});

export const pdfUpload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Sirf PDF file allowed hai"));
  },
});