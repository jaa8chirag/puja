import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRouter from "./routes/authRouter.js";
import servicesRouter from "./routes/servicesRoutes.js";
import partnerRouter from "./routes/partnerRouter.js";
import adminRouter from "./routes/adminRouter.js";
import customerCare from "./routes/customerCareRouter.js";
import kundliRouter from "./routes/kundliRouter.js";
import blogsRouter from "./routes/blogsRouter.js";
import { debugSweph, generateKundli } from "./controllers/kundliController.js";
import nameCorrectionRouter from "./controllers/nameCorrectionController.js";
import chatRouter from "./routes/chatRouter.js";
import initChatSocket from "./socket/chatSocket.js";
import contribution from "./routes/contributionRouter.js";
import verifypandiRoutes from "./routes/verifypanditRoutes.js";
import pool from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { Groq } from "groq-sdk";
import fetch from "node-fetch";
import { generatePDF } from "./controllers/pdfReport.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getPageBySlug } from "./controllers/adminController.js";
import paymentRouter from "./routes/payment.routes.js";
import dataRouter from "./routes/aartiAndEventRoutes.js";
import faqRouter from "./routes/faqRoutes.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIResponse = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (text) return text;
    throw new Error("Gemini returned empty text");
  } catch (err) {
    console.error("🔱 Gemini Primary Error:", err.message);
    try {
      console.log("⚠️ Switching to Gemini 1.5 Pro...");
      const proModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const proResult = await proModel.generateContent(prompt);
      const proResponse = await proResult.response;
      return proResponse.text();
    } catch (proErr) {
      console.error("❌ All Gemini Models Failed:", proErr.message);
      throw proErr;
    }
  }
};

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
export const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 5000;
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  transports: ["polling", "websocket"],
});

const userStates = new Map();

// ── CHANGE 1: English prompt ──────────────────────────────
const PANDIT_PROMPT = `You are the chief Pandit of 'Sri Vedic Puja Kendra'.
1. Always start every reply with "🙏 Om Namah Shivay".
2. If user asks general spiritual questions, answer directly in English.
3. If user mentions any problem (Job, Health, Marriage, Money, Family), write 'TRIGGER_KUNDLI' in your reply.
DO NOT ask for details yourself, just say 'TRIGGER_KUNDLI'.`;

// ── CHANGE 2: Puja fetch + dosha matching helpers ─────────
const fetchPujaServices = async () => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/puja/allServices`);
    const data = await res.json();
    // ✅ data.services extract karo
    return Array.isArray(data) ? data : data.services || data.data || [];
  } catch (err) {
    console.error("⚠️ Could not fetch puja services:", err.message);
    return [];
  }
};

const DOSHA_PUJA_KEYWORDS = {
  "Mangal Dosha": [
    "mangal dosha",
    "mangal",
    "mangala",
    "mars dosha",
    "kuja dosha",
  ],
  "Pitra Dosha": [
    "pitra dosha",
    "pitru dosha",
    "pitra",
    "pitru",
    "pind dan",
    "tarpan",
    "ancestor",
  ],
  "Shani Sade Sati": [
    "shani sade sati",
    "sade sati",
    "shani dosha",
    "shani shanti",
    "saturn dosha",
  ],
  "Guru Chandal Yoga": [
    "guru chandal",
    "chandal yoga",
    "guru dosha",
    "jupiter dosha",
    "rahu guru",
  ],
  "Shapit Yoga": [
    "shapit yoga",
    "shapit",
    "shrapit",
    "shani rahu",
    "cursed yoga",
  ],
  "Surya Grahan Dosha": [
    "surya grahan",
    "solar grahan",
    "surya dosha",
    "sun dosha",
    "surya shanti",
  ],
  "Chandra Grahan Dosha": [
    "chandra grahan",
    "lunar grahan",
    "chandra dosha",
    "moon dosha",
    "chandra shanti",
  ],
  "Vish Yoga": [
    "vish yoga",
    "vish dosha",
    "poison yoga",
    "chandra shani",
    "moon saturn",
  ],
  "Angarak Yoga": [
    "angarak yoga",
    "angarak",
    "mars rahu",
    "mangal rahu",
    "rahu mangal",
  ],
  "Kaal Sarp Dosh": [
    "kaal sarp",
    "kalsarp",
    "kal sarp",
    "naag dosha",
    "serpent dosha",
  ],
};

const matchPujaForDosha = (doshaName, allServices) => {
  const keywords = DOSHA_PUJA_KEYWORDS[doshaName] || [
    doshaName.toLowerCase().split(" ")[0],
  ];

  return allServices.filter((service) => {
    // ✅ puja_name field use karo
    const name = (
      service.puja_name ||
      service.name ||
      service.title ||
      ""
    ).toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
};

const buildPujaCards = (doshas, allServices) => {
  if (!doshas || doshas.length === 0) return null;

  const activeDoshas = doshas.filter(
    (d) => d.present && d.type !== "CANCELLED",
  );
  if (activeDoshas.length === 0) return null;

  // Severity ke hisaab se sort karo: HIGH > MODERATE > LOW
  const severityOrder = { HIGH: 0, MODERATE: 1, LOW: 2 };
  activeDoshas.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  const urgencyMap = {
    HIGH: { label: "🔴 Urgent — Immediate puja recommended", emoji: "🔴" },
    MODERATE: { label: "🟡 Moderate — Puja advisable soon", emoji: "🟡" },
    LOW: { label: "🟢 Mild — Puja beneficial but not critical", emoji: "🟢" },
  };

  const cards = [];
  const addedIds = new Set();

  activeDoshas.forEach((dosha) => {
    const matched = matchPujaForDosha(dosha.name, allServices);
    if (matched.length === 0) return;

    const service = matched[0]; // har dosha ke liye sirf ek puja
    const id = service.id || service._id;
    if (addedIds.has(id)) return;
    addedIds.add(id);

    cards.push({
      doshaName: dosha.name,
      severity: dosha.severity,
      urgency: urgencyMap[dosha.severity]?.label || "",
      pujaName: service.puja_name || service.name || service.title,
      pujaId: id,
      price: service.price || service.amount || "",
      bookingUrl: `${process.env.FRONTEND_URL}/homePuja/${id}`,
    });
  });

  return cards.length > 0 ? cards : null;
};

// =============================================
// 🔱 AI PANDIT JI — SOCKET LOGIC
// =============================================

const setupAIPandit = (io) => {
  const panditNS = io.of("/pandit");

  panditNS.on("connection", (socket) => {
    console.log("🔱 Smart Pandit Connected:", socket.id);

    socket.on("ai_query", async ({ text }) => {
      try {
        let state = userStates.get(socket.id) || {
          step: "chat",
          data: {},
          history: [],
        };

        if (state.step === "collecting") {
          const reply = await handleCollection(socket, text, state);
          userStates.set(socket.id, state);
          // reply null aata hai jab cards already emit ho chuke hain
          if (reply !== null) {
            socket.emit("ai_response", {
              text: reply,
              sender: "bot",
              timestamp: new Date(),
            });
          }
          return;
        }

        let reply = "";
        try {
          const prompt = `${PANDIT_PROMPT}\n\nChat History: ${JSON.stringify(state.history)}\nUser: ${text}`;
          reply = await getAIResponse(prompt);
          console.log("✅ Response from Gemini (Main)");
        } catch (geminiError) {
          console.error("⚠️ Switching to Groq Backup...");
          const completion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: PANDIT_PROMPT },
              ...state.history,
              { role: "user", content: text },
            ],
            model: "llama-3.3-70b-versatile",
          });
          reply = completion.choices[0]?.message?.content || "";
          console.log("✅ Response from Groq (Backup)");
        }

        if (reply.includes("TRIGGER_KUNDLI")) {
          state.step = "collecting";
          state.subStep = "name";
          userStates.set(socket.id, state);
          return socket.emit("ai_response", {
            // ── CHANGE 3: English trigger message ──
            text: "🙏 Om Namah Shivay! To analyze this matter, I need to examine your planetary positions. Please share your **Full Name**.",
            sender: "bot",
            timestamp: new Date(),
          });
        }

        socket.emit("ai_response", {
          text: reply,
          sender: "bot",
          timestamp: new Date(),
        });
        state.history.push(
          { role: "user", content: text },
          { role: "assistant", content: reply },
        );
        if (state.history.length > 6) state.history.shift();
        userStates.set(socket.id, state);
      } catch (error) {
        console.error("Critical Pandit Error:", error);
        socket.emit("ai_response", {
          text: "🙏 Om Namah Shivay! Please try again in a moment.",
          sender: "bot",
        });
      }
    });

    socket.on("disconnect", () => userStates.delete(socket.id));
  });
};

async function handleCollection(socket, text, state) {
  const steps = {
    name: {
      next: "dob",
      msg: "Thank you! Please share your **Date of Birth** (DD-MM-YYYY).",
    },
    dob: {
      next: "tob",
      msg: "Got it. What is your **Time of Birth**? (HH:MM AM/PM)",
    },
    tob: { next: "city", msg: "What is your **Place of Birth** (City)?" },
    city: {
      next: "gender",
      msg: "Please share your **Gender** (Male/Female).",
    },
    gender: {
      next: "complete",
      msg: "🙏 Please wait, calculating your planetary positions...",
    },
  };

  const current = state.subStep;
  state.data[current] = text;

  if (steps[current].next !== "complete") {
    state.subStep = steps[current].next;
    return steps[current].msg;
  } else {
    try {
      const { name, dob, tob, city, gender } = state.data;

      // FIX 1: DD-MM-YYYY → YYYY-MM-DD
      const [dd, mm, yyyy] = dob.split("-");
      const formattedDate = `${yyyy}-${mm}-${dd}`;

      // FIX 2: "07:30 AM" → "07:30" (24hr)
      let formattedTime = tob.trim();
      const timeParts = formattedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = timeParts[2];
        const meridiem = timeParts[3]?.toUpperCase();
        if (meridiem === "PM" && hours !== 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        formattedTime = `${String(hours).padStart(2, "0")}:${minutes}`;
      }

      // FIX 3: City → lat/lon (local map + Nominatim + fallback)
      const getCoords = async (cityName) => {
        const localMap = {
          delhi: { lat: 28.6139, lon: 77.209 },
          "new delhi": { lat: 28.6139, lon: 77.209 },
          mumbai: { lat: 19.076, lon: 72.8777 },
          bangalore: { lat: 12.9716, lon: 77.5946 },
          bengaluru: { lat: 12.9716, lon: 77.5946 },
          kolkata: { lat: 22.5726, lon: 88.3639 },
          chennai: { lat: 13.0827, lon: 80.2707 },
          hyderabad: { lat: 17.385, lon: 78.4867 },
          pune: { lat: 18.5204, lon: 73.8567 },
          haridwar: { lat: 29.9457, lon: 78.1642 },
          varanasi: { lat: 25.3176, lon: 82.9739 },
          lucknow: { lat: 26.8467, lon: 80.9462 },
          jaipur: { lat: 26.9124, lon: 75.7873 },
          ahmedabad: { lat: 23.0225, lon: 72.5714 },
          bhopal: { lat: 23.2599, lon: 77.4126 },
          patna: { lat: 25.5941, lon: 85.1376 },
          nagpur: { lat: 21.1458, lon: 79.0882 },
          indore: { lat: 22.7196, lon: 75.8577 },
          surat: { lat: 21.1702, lon: 72.8311 },
          kanpur: { lat: 26.4499, lon: 80.3319 },
          agra: { lat: 27.1767, lon: 78.0081 },
          meerut: { lat: 28.9845, lon: 77.7064 },
          noida: { lat: 28.5355, lon: 77.391 },
          gurgaon: { lat: 28.4595, lon: 77.0266 },
          gurugram: { lat: 28.4595, lon: 77.0266 },
          chandigarh: { lat: 30.7333, lon: 76.7794 },
          amritsar: { lat: 31.634, lon: 74.8723 },
          dehradun: { lat: 30.3165, lon: 78.0322 },
          rishikesh: { lat: 30.0869, lon: 78.2676 },
          mathura: { lat: 27.4924, lon: 77.6737 },
          allahabad: { lat: 25.4358, lon: 81.8463 },
          prayagraj: { lat: 25.4358, lon: 81.8463 },
          gwalior: { lat: 26.2183, lon: 78.1828 },
          jabalpur: { lat: 23.1815, lon: 79.9864 },
          raipur: { lat: 21.2514, lon: 81.6296 },
          bhubaneswar: { lat: 20.2961, lon: 85.8245 },
          visakhapatnam: { lat: 17.6868, lon: 83.2185 },
          coimbatore: { lat: 11.0168, lon: 76.9558 },
          madurai: { lat: 9.9252, lon: 78.1198 },
          kochi: { lat: 9.9312, lon: 76.2673 },
          thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
          guwahati: { lat: 26.1445, lon: 91.7362 },
          shimla: { lat: 31.1048, lon: 77.1734 },
          jammu: { lat: 32.7266, lon: 74.857 },
          srinagar: { lat: 34.0837, lon: 74.7973 },
          ranchi: { lat: 23.3441, lon: 85.3096 },
          jodhpur: { lat: 26.2389, lon: 73.0243 },
          udaipur: { lat: 24.5854, lon: 73.7125 },
          ajmer: { lat: 26.4499, lon: 74.6399 },
        };

        const key = cityName.toLowerCase().trim();
        if (localMap[key]) {
          console.log(`📍 Local map: ${cityName}`);
          return localMap[key];
        }
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ", India")}&format=json&limit=1`;
          const res = await fetch(url, {
            headers: { "User-Agent": "SmartPanditApp/1.0" },
          });
          const data = await res.json();
          if (data && data.length > 0) {
            console.log(`📍 Nominatim: ${cityName}`);
            return {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon),
            };
          }
        } catch (apiErr) {
          console.warn(`⚠️ Nominatim failed:`, apiErr.message);
        }
        console.warn(`⚠️ Using India center for: ${cityName}`);
        return { lat: 20.5937, lon: 78.9629 };
      };

      const coords = await getCoords(city);

      const rawData = await generateKundli(
        name,
        formattedDate,
        formattedTime,
        city,
        gender,
        5.5,
        coords.lat,
        coords.lon,
      );

      // ── Puja cards fetch + match ───────────────────────
      const allServices = await fetchPujaServices();
      const pujaCards = buildPujaCards(rawData.doshas, allServices);

      // ── AI Analysis — English ──────────────────────────
      const analysisPrompt = `You are an expert Vedic Astrologer. Analyze this Kundli data and give a clear, detailed reading in English: ${JSON.stringify(rawData)}`;

      let finalReport = "";
      try {
        finalReport = await getAIResponse(analysisPrompt);
      } catch (e) {
        const interpret = await groq.chat.completions.create({
          messages: [{ role: "user", content: analysisPrompt }],
          model: "llama-3.3-70b-versatile",
        });
        finalReport = interpret.choices[0].message.content;
      }

      // ── Emit analysis ──────────────────────────────────
      socket.emit("ai_response", {
        text: finalReport,
        sender: "bot",
        timestamp: new Date(),
      });

      // ── Emit puja cards (har dosha ke liye) ───────────
      if (pujaCards && pujaCards.length > 0) {
        socket.emit("ai_response", {
          text: "🙏 Based on your Kundli, the following Pujas are recommended to remedy your Doshas:",
          sender: "bot",
          timestamp: new Date(),
          pujaCards: pujaCards,
        });
      }

      state.step = "chat";
      state.data = {};
      return null; // already emitted above
    } catch (err) {
      console.error("Kundli generation error:", err);
      state.step = "chat";
      state.data = {};
      return "🙏 There was an error calculating your Kundli. Please try again.";
    }
  }
}

// REST OF ROUTES
setupAIPandit(io);
initChatSocket(io);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => res.send("Server running ✅"));

app.post("/api/name/pdf-report", async (req, res) => {
  const pdf = await generatePDF(req.body);
  const safeName = (req.body.name || "Report").replace(/\s+/g, "_");
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${safeName}_Numerology_Report.pdf"`,
    "Content-Length": pdf.length,
  });
  res.send(pdf);
});

app.use("/api/kundli", kundliRouter);
app.use("/api/name", nameCorrectionRouter);
app.use("/api/user", authRouter);
app.use("/api/puja", servicesRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/admin", adminRouter);
app.use("/api/customerCare", customerCare);
app.use("/api/chat", chatRouter);
app.use("/api/contributions", contribution);
app.use("/api/blogs", blogsRouter);
app.use("/api/admin/verify-pandit", verifypandiRoutes);
// Public Pages Route (no auth needed)
app.get("/api/pages/:slug", getPageBySlug);
app.use("/api/payment", paymentRouter);
app.use("/api/content", dataRouter);

// faqs routes
app.use("/api/admin/faq", faqRouter);

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
