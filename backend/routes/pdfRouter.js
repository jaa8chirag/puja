import express from "express";
import { generatePDF } from "../controllers/pdfReport.js";
import { verifyToken } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";

const router = express.Router();

// POST /api/name/pdf-report
router.post("/pdf-report", verifyToken, adminOnly, async (req, res) => {
  try {
    const pdf = await generatePDF(req.body);
    const safeName = (req.body.name || "Report").replace(/\s+/g, "_");
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}_Numerology_Report.pdf"`,
      "Content-Length": pdf.length,
    });
    res.send(pdf);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: "PDF generation failed" });
  }
});

export default router;
