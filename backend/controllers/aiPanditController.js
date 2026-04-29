import { Groq } from "groq-sdk";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateKundli } from "./kundliController.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── AI Response Helper ─────────────────────────────────────
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

// ── User State Map ─────────────────────────────────────────
const userStates = new Map();

// ── Smart Pandit System Prompt ─────────────────────────────
const PANDIT_PROMPT = `You are 'Smart Pandit Ji', the knowledgeable Vedic Pandit of 'Sri Vedic Puja Kendra'.
1. Always start every reply with "🙏 Om Namah Shivay".
2. LANGUAGE DETECTION: Detect the user's language. If the user asks in English, reply in English. If the user asks in Hinglish or Hindi, reply in HINGLISH (Hindi using English script).
3. Be extremely concise. Use point-to-point format.
4. If user mentions any problem (Job, Health, Marriage, Money, Family, career, etc.), write 'TRIGGER_KUNDLI' in your reply.
DO NOT ask for details yourself, just say 'TRIGGER_KUNDLI'.`;

// ── Fetch Puja Services ────────────────────────────────────
const fetchPujaServices = async () => {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/puja/allServices`);
    const data = await res.json();
    return Array.isArray(data) ? data : data.services || data.data || [];
  } catch (err) {
    console.error("⚠️ Could not fetch puja services:", err.message);
    return [];
  }
};

// ── Dosha → Puja Keyword Map ───────────────────────────────
const DOSHA_PUJA_KEYWORDS = {
  "Mangal Dosha": ["mangal dosha", "mangal", "mangala", "mars dosha", "kuja dosha"],
  "Pitra Dosha": ["pitra dosha", "pitru dosha", "pitra", "pitru", "pind dan", "tarpan", "ancestor"],
  "Shani Sade Sati": ["shani sade sati", "sade sati", "shani dosha", "shani shanti", "saturn dosha"],
  "Guru Chandal Yoga": ["guru chandal", "chandal yoga", "guru dosha", "jupiter dosha", "rahu guru"],
  "Shapit Yoga": ["shapit yoga", "shapit", "shrapit", "shani rahu", "cursed yoga"],
  "Surya Grahan Dosha": ["surya grahan", "solar grahan", "surya dosha", "sun dosha", "surya shanti"],
  "Chandra Grahan Dosha": ["chandra grahan", "lunar grahan", "chandra dosha", "moon dosha", "chandra shanti"],
  "Vish Yoga": ["vish yoga", "vish dosha", "poison yoga", "chandra shani", "moon saturn"],
  "Angarak Yoga": ["angarak yoga", "angarak", "mars rahu", "mangal rahu", "rahu mangal"],
  "Kaal Sarp Dosh": ["kaal sarp", "kalsarp", "kal sarp", "naag dosha", "serpent dosha"],
};

// ── Match Puja for a Dosha ─────────────────────────────────
const matchPujaForDosha = (doshaName, allServices) => {
  const keywords = DOSHA_PUJA_KEYWORDS[doshaName] || [doshaName.toLowerCase().split(" ")[0]];
  return allServices.filter((service) => {
    const name = (service.puja_name || service.name || service.title || "").toLowerCase();
    return keywords.some((kw) => name.includes(kw));
  });
};

// ── Build Puja Recommendation Cards ───────────────────────
const buildPujaCards = (doshas, allServices) => {
  if (!doshas || doshas.length === 0) return null;

  const activeDoshas = doshas.filter((d) => d.present && d.type !== "CANCELLED");
  if (activeDoshas.length === 0) return null;

  const severityOrder = { HIGH: 0, MODERATE: 1, LOW: 2 };
  activeDoshas.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

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

    const service = matched[0];
    const id = service.id || service._id;
    if (addedIds.has(id)) return;
    addedIds.add(id);

    const typeMap = {
      home_puja: "home-Puja",
      katha: "katha-jaap",
      temple_puja: "temple-puja",
      pind_dan: "pind-dan",
    };
    const routePrefix = typeMap[service.puja_type] || "home-Puja";

    const reasonMap = {
      "Mangal Dosha": "Marriage delays and relationship hurdles",
      "Pitra Dosha": "Ancestral peace and family growth",
      "Shani Sade Sati": "Career stability and mental peace",
      "Guru Chandal Yoga": "Financial wisdom and education success",
      "Shapit Yoga": "Removing generational obstacles",
      "Surya Grahan Dosha": "Confidence and social reputation",
      "Chandra Grahan Dosha": "Emotional balance and health",
      "Vish Yoga": "Mental strength and removing negativity",
      "Angarak Yoga": "Anger management and avoiding accidents",
      "Kaal Sarp Dosh": "Success in all tasks and mental peace",
    };

    cards.push({
      doshaName: dosha.name,
      severity: dosha.severity,
      urgency: urgencyMap[dosha.severity]?.label || "",
      reason: reasonMap[dosha.name] || "For overall spiritual growth",
      pujaName: service.puja_name || service.name || service.title,
      pujaId: id,
      price: service.price || service.amount || "",
      bookingUrl: `${process.env.FRONTEND_URL}/${routePrefix}/${id}`,
    });
  });

  return cards.length > 0 ? cards : null;
};

// ── City → Coordinates Resolver ────────────────────────────
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
    const res = await fetch(url, { headers: { "User-Agent": "SmartPanditApp/1.0" } });
    const data = await res.json();
    if (data && data.length > 0) {
      console.log(`📍 Nominatim: ${cityName}`);
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (apiErr) {
    console.warn(`⚠️ Nominatim failed:`, apiErr.message);
  }

  console.warn(`⚠️ Using India center for: ${cityName}`);
  return { lat: 20.5937, lon: 78.9629 };
};

// ── Kundli Collection Handler ──────────────────────────────
async function handleCollection(socket, text, state) {
  const steps = {
    name: { next: "dob", msg: "Dhanyawad! Ab kripya apni **Janm Tithi** batayein (DD-MM-YYYY)." },
    dob: { next: "tob", msg: "Uttam. Aapka **Janm Samay** kya hai? (HH:MM AM/PM)" },
    tob: { next: "city", msg: "Aapka **Janm Sthan** (City) kaunsa hai?" },
    city: { next: "gender", msg: "Kripya apna **Gender** (Male/Female) batayein." },
    gender: { next: "complete", msg: "🙏 Prateeksha karein, aapki kundli ki ganana ho rahi hai..." },
  };

  const current = state.subStep;
  state.data[current] = text;

  if (steps[current].next !== "complete") {
    state.subStep = steps[current].next;
    return steps[current].msg;
  }

  try {
    const { name, dob, tob, city, gender } = state.data;

    // DD-MM-YYYY → YYYY-MM-DD
    const [dd, mm, yyyy] = dob.split("-");
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    // "07:30 AM" → "07:30" (24hr)
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

    const coords = await getCoords(city);

    const rawData = await generateKundli(name, formattedDate, formattedTime, city, gender, 5.5, coords.lat, coords.lon);

    const allServices = await fetchPujaServices();
    const pujaCards = buildPujaCards(rawData.doshas, allServices);

    const analysisPrompt = `Aap 'Smart Pandit Ji' hain, ek anubhavi Vedic Jyotishi. 
Is Kundli data ka nikarsh nikaalein: ${JSON.stringify(rawData)}.
Report bilkul POINT-TO-POINT honi chahiye.
IMPORTANT: Use the same language as the user (English or Hinglish).
Sirf mukhya baatein batayein (strictly 1 line each):
1. Vyaktitv (Personality)
2. Sabse Shubh Grah (Best Planet)
3. Mukhya Dosh (Major Dosha)
4. Upay (Remedy)
Faltu vistar aur lambe paragraphs na likhein. Seedha aur sateek javab dein.`;

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

    socket.emit("ai_response", { text: finalReport, sender: "bot", timestamp: new Date() });

    if (pujaCards && pujaCards.length > 0) {
      socket.emit("ai_response", {
        text: "🙏 Aapki Kundli ke anusar, in Dosho ke nivaran ke liye ye Puja karwana labhdayak rahega:",
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

// ── Setup AI Pandit Socket Namespace ───────────────────────
export const setupAIPandit = (io) => {
  const panditNS = io.of("/pandit");

  panditNS.on("connection", (socket) => {
    console.log("🔱 Smart Pandit Connected:", socket.id);

    socket.on("ai_query", async ({ text }) => {
      try {
        let state = userStates.get(socket.id) || { step: "chat", data: {}, history: [] };

        if (state.step === "collecting") {
          const reply = await handleCollection(socket, text, state);
          userStates.set(socket.id, state);
          if (reply !== null) {
            socket.emit("ai_response", { text: reply, sender: "bot", timestamp: new Date() });
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
            text: "🙏 Om Namah Shivay! Is vishay ka gehra vishleshan karne ke liye mujhe aapki grah-stithi dekhni hogi. Kripya apna **Pura Naam** pradan karein.",
            sender: "bot",
            timestamp: new Date(),
          });
        }

        socket.emit("ai_response", { text: reply, sender: "bot", timestamp: new Date() });
        state.history.push({ role: "user", content: text }, { role: "assistant", content: reply });
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
