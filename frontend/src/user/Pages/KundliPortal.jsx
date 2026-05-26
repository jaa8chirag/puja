import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${API_BASE_URL}/kundli/generate`;

// Dosha → Puja keyword map
const DOSHA_PUJA_KEYWORDS = {
  'Mangal Dosha': ['mangal dosha', 'mangal', 'mangala', 'mars dosha', 'kuja dosha'],
  'Pitra Dosha': ['pitra dosha', 'pitru dosha', 'pitra', 'pitru', 'pind dan', 'tarpan', 'ancestor'],
  'Shani Sade Sati': ['shani sade sati', 'sade sati', 'shani dosha', 'shani shanti', 'saturn dosha', 'shani'],
  'Guru Chandal Yoga': ['navgraha', 'nav graha', 'graha shanti', 'guru chandal', 'chandal yoga'],
  'Shapit Yoga': ['shapit yoga', 'shapit', 'shrapit', 'shani rahu', 'pind dan', 'pind'],
  'Surya Grahan Dosha': ['navgraha', 'nav graha', 'surya grahan', 'surya dosha', 'graha shanti'],
  'Chandra Grahan Dosha': ['maha mrityunjaya', 'mrityunjaya', 'chandra grahan', 'rudrabhishek', 'rudra'],
  'Vish Yoga': ['rudrabhishek', 'rudra', 'vish yoga', 'shiv', 'shiva'],
  'Angarak Yoga': ['hanuman', 'angarak', 'mars rahu', 'mangal rahu'],
  'Kaal Sarp Dosh': ['kaal sarp', 'kalsarp', 'kal sarp', 'naag dosha'],
};

const DOSHA_FALLBACK_ID = {
  'Mangal Dosha': 43,
  'Pitra Dosha': 48,
  'Shani Sade Sati': 30,
  'Guru Chandal Yoga': 4,
  'Shapit Yoga': 31,
  'Surya Grahan Dosha': 4,
  'Chandra Grahan Dosha': 3,
  'Vish Yoga': 6,
  'Angarak Yoga': 7,
  'Kaal Sarp Dosh': 13,
};

const matchPujaForDosha = (doshaName, allServices) => {
  const keywords = DOSHA_PUJA_KEYWORDS[doshaName] || [doshaName.toLowerCase().split(' ')[0]];
  const keywordMatches = allServices.filter(service => {
    const name = (service.puja_name || service.name || service.title || '').toLowerCase();
    return keywords.some(kw => name.includes(kw));
  });
  if (keywordMatches.length > 0) return keywordMatches;
  const fallbackId = DOSHA_FALLBACK_ID[doshaName];
  if (fallbackId) {
    const fallback = allServices.find(s => s.id === fallbackId || s._id === fallbackId);
    if (fallback) return [fallback];
  }
  return [];
};

const PLANET_SYMBOLS = {
  Sun: "☀️", Moon: "🌙", Mars: "♂️", Mercury: "☿",
  Jupiter: "♃", Venus: "♀", Saturn: "♄", Rahu: "☊", Ketu: "☋"
};
const SHORT = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke'
};
const PLANET_COLOR = {
  EXALTED: "#7B1A00",
  OWN: "#5A2D00",
  FRIENDLY: "#3B2000",
  NEUTRAL: "#2D1800",
  ENEMY: "#6B0000",
  DEBILITATED: "#3B2800",
};
const STRENGTH_CLS = {
  EXALTED: 'text-green-700 font-bold',
  OWN_SIGN: 'text-blue-700 font-semibold',
  DEBILITATED: 'text-red-600 font-semibold',
  NEUTRAL: 'text-amber-700/60'
};

// ── Light-theme severity colours ────────────────────────────
const SEVERITY_CLS = {
  HIGH: 'bg-red-50 border-red-300 text-red-800',
  MODERATE: 'bg-amber-50 border-amber-300 text-amber-800',
  LOW: 'bg-blue-50 border-blue-300 text-blue-800',
  CANCELLED: 'bg-gray-100 border-gray-300 text-gray-500',
};

const RASHIS_LIST = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// ── North Indian Kundli Chart (light parchment look) ────────
function KundliChart({ planets, lagnaRashi }) {
  const housePlanets = useMemo(() => {
    const m = {};
    for (let h = 1; h <= 12; h++) m[h] = [];
    Object.entries(planets).forEach(([name, p]) => {
      if (p.house >= 1 && p.house <= 12) m[p.house].push({ name, ...p });
    });
    return m;
  }, [planets]);

  const lagnaIdx = Math.max(0, RASHIS_LIST.indexOf(lagnaRashi));
  const getRashiNum = (h) => ((lagnaIdx + h - 1) % 12) + 1;
  const S = 500, M = 250;

  const getHouseLayout = (h) => {
    const layout = {
      1: { rx: M, ry: M - 50, px: M, py: M - 130 },
      4: { rx: M - 60, ry: M + 5, px: M / 2 - 15, py: M + 10 },
      7: { rx: M, ry: M + 50, px: M, py: M + 100 },
      10: { rx: M + 50, ry: M + 5, px: (3 * M) / 2 + 15, py: M + 10 },
      2: { rx: M - 120, ry: 100, px: M / 2, py: 60 },
      3: { rx: 80, ry: M - 120, px: 30, py: M / 2 - 5 },
      5: { rx: 100, ry: M + 130, px: 30, py: (3 * S) / 4 + 5 },
      6: { rx: M - 125, ry: S - 90, px: M / 2 + 10, py: S - 50 },
      8: { rx: M + 125, ry: S - 90, px: (3 * S) / 4, py: S - 60 },
      9: { rx: S - 90, ry: M + 130, px: S - 40, py: (3 * S) / 4 + 5 },
      11: { rx: S - 80, ry: M - 120, px: S - 35, py: M / 2 - 5 },
      12: { rx: M + 120, ry: 100, px: (3 * S) / 4 - 10, py: 30 },
    };
    return layout[h];
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <p className="text-amber-700 font-bold text-xl tracking-widest uppercase">Lagna Chart</p>
        <p className="text-amber-500 text-xs">Vedic North Indian Style</p>
      </div>
      <div className="relative w-full max-w-[500px] aspect-square">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-full rounded-xl"
          style={{ filter: 'drop-shadow(0 6px 24px rgba(180,100,20,0.18))' }}>
          <defs>
            <radialGradient id="parchment" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#fff8ee" />
              <stop offset="60%" stopColor="#fdefd4" />
              <stop offset="100%" stopColor="#f5d9a8" />
            </radialGradient>
            <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
              <stop offset="40%" stopColor="transparent" />
              <stop offset="100%" stopColor="#c07820" stopOpacity="0.12" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={S} height={S} fill="url(#parchment)" rx="8" />
          <rect x="0" y="0" width={S} height={S} fill="url(#vignette)" />
          <rect x="4" y="4" width={S - 8} height={S - 8} fill="none" stroke="#c07820" strokeWidth="2.5" rx="6" />
          <line x1="0" y1="0" x2={S} y2={S} stroke="#b45309" strokeWidth="1.5" />
          <line x1={S} y1="0" x2="0" y2={S} stroke="#b45309" strokeWidth="1.5" />
          <line x1={M} y1="0" x2="0" y2={M} stroke="#b45309" strokeWidth="1.5" />
          <line x1="0" y1={M} x2={M} y2={S} stroke="#b45309" strokeWidth="1.5" />
          <line x1={M} y1={S} x2={S} y2={M} stroke="#b45309" strokeWidth="1.5" />
          <line x1={S} y1={M} x2={M} y2="0" stroke="#b45309" strokeWidth="1.5" />
          <text x={M} y={M + 40} textAnchor="middle" fontSize="110" opacity="0.06"
            fill="#8B2020" fontFamily="serif">ॐ</text>
          <text x={M} y={M + 5} textAnchor="middle" fontSize="13" opacity="0.4"
            fill="#7c2d12" fontFamily="Georgia, serif" fontWeight="bold" letterSpacing="2">Lagna</text>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => {
            const { rx, ry, px, py } = getHouseLayout(h);
            const rashiNum = getRashiNum(h);
            const plist = housePlanets[h] || [];
            return (
              <g key={h}>
                <text x={rx} y={ry} textAnchor="middle"
                  fill="#92400e" fontSize="17" fontWeight="bold" fontFamily="serif">
                  {h === 1 ? `${rashiNum} ASC` : rashiNum}
                </text>
                {plist.map((p, i) => (
                  <text key={i} x={px} y={py + i * 20} textAnchor="middle"
                    fill={PLANET_COLOR[p.strength] || PLANET_COLOR.NEUTRAL}
                    fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                    {SHORT[p.name] || p.name.slice(0, 2)}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Analysis Text Renderer (light) ───────────────────────────
function AnalysisText({ text }) {
  if (!text?.trim()) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
      ⚠️ Analysis not available — see Raw tab.
    </div>
  );

  const formatLine = (l) => {
    // Basic bold support: **text** -> <b>text</b>
    const parts = l.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <b key={i} className="text-stone-900 font-bold">{part.slice(2, -2)}</b>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {text.split('\n').map((raw, i) => {
        const l = raw.trim();
        if (!l) return <div key={i} className="h-2" />;
        
        if (l.startsWith('## ')) return <h2 key={i} className="text-amber-800 font-bold text-lg mt-5 mb-2 border-b border-amber-200 pb-1">{formatLine(l.slice(3))}</h2>;
        if (l.startsWith('### ')) return <h3 key={i} className="text-amber-700 font-semibold text-base mt-4 mb-1">{formatLine(l.slice(4))}</h3>;
        if (l.startsWith('#### ')) return <h4 key={i} className="text-amber-600 font-medium mt-3">{formatLine(l.slice(5))}</h4>;
        
        if (/^[-*•]/.test(l)) return (
          <div key={i} className="flex items-start gap-2 ml-4 my-1">
            <span className="text-amber-500 mt-0.5 shrink-0 text-xs">◆</span>
            <span className="text-stone-700">{formatLine(l.replace(/^[-*•]\s+/, ''))}</span>
          </div>
        );
        
        if (/^\d+\./.test(l)) {
          const num = l.match(/^(\d+)/)[1], rest = l.replace(/^\d+\.\s*/, '');
          return (
            <div key={i} className="flex items-start gap-3 ml-4 my-1">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">{num}</span>
              <span className="text-stone-700">{formatLine(rest)}</span>
            </div>
          );
        }
        
        if (l === '---') return <hr key={i} className="border-amber-200 my-3" />;
        const color = l.includes('GOOD') ? 'text-green-700' : l.includes('CHALLENGING') ? 'text-red-600' : l.includes('MIXED') ? 'text-amber-700' : '';
        return <p key={i} className={`my-1 ${color || 'text-stone-700'}`}>{l}</p>;
      })}
    </div>
  );
}

// ── Time Picker (light) ───────────────────────────────────────
function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("hours");
  const [ampm, setAmpm] = useState("AM");
  const [hrs, setHrs] = useState(12);
  const [mins, setMins] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!value) return;
    const [h, m] = value.split(":").map(Number);
    setAmpm(h >= 12 ? "PM" : "AM");
    setHrs(h === 0 ? 12 : h > 12 ? h - 12 : h);
    setMins(m);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const emit = (h, m, ap) => {
    let hr24 = h;
    if (ap === "AM" && hr24 === 12) hr24 = 0;
    if (ap === "PM" && hr24 !== 12) hr24 += 12;
    onChange(String(hr24).padStart(2, "0") + ":" + String(m).padStart(2, "0"));
  };

  const SIZE = 220, CENTER = SIZE / 2, HOUR_R = 80, MIN_R = 80;
  const hourNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const minNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getPos = (index, total, radius) => {
    const angle = ((index / total) * 2 * Math.PI) - Math.PI / 2;
    return { x: CENTER + radius * Math.cos(angle), y: CENTER + radius * Math.sin(angle) };
  };

  const getHandAngle = () => mode === "hours" ? ((hrs % 12) / 12) * 360 - 90 : (mins / 60) * 360 - 90;
  const handAngle = getHandAngle();
  const handLength = mode === "hours" ? HOUR_R - 14 : MIN_R - 14;
  const handRad = (handAngle * Math.PI) / 180;
  const handX = CENTER + handLength * Math.cos(handRad);
  const handY = CENTER + handLength * Math.sin(handRad);

  const handleClockClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - CENTER, y = e.clientY - rect.top - CENTER;
    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const normalized = ((angle % 360) + 360) % 360;
    if (mode === "hours") {
      const h = Math.round(normalized / 30) % 12 || 12;
      setHrs(h); emit(h, mins, ampm);
      setTimeout(() => setMode("minutes"), 200);
    } else {
      const m = Math.round(normalized / 6) % 60;
      setMins(m); emit(hrs, m, ampm);
      setOpen(false); setMode("hours");
    }
  };

  const hh = String(hrs).padStart(2, "0"), mm = String(mins).padStart(2, "0");
  const display = value ? `${hh}:${mm} ${ampm}` : "Select time...";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen(o => !o); setMode("hours"); }}
        className={`w-full bg-white border rounded-xl px-4 py-3 text-left flex items-center justify-between transition-colors shadow-sm
          ${open ? "border-amber-500 ring-2 ring-amber-100" : "border-amber-200 hover:border-amber-400"}
          ${value ? "text-stone-800" : "text-stone-400"}`}>
        <span className="flex items-center gap-2 text-sm"><span className="text-amber-600">🕐</span>{display}</span>
        <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-baseline gap-1">
              <button type="button" onClick={() => setMode("hours")}
                className={`text-3xl font-bold tabular-nums transition-colors ${mode === "hours" ? "text-amber-600" : "text-stone-400 hover:text-amber-500"}`}>{hh}</button>
              <span className="text-amber-400 text-2xl font-bold">:</span>
              <button type="button" onClick={() => setMode("minutes")}
                className={`text-3xl font-bold tabular-nums transition-colors ${mode === "minutes" ? "text-amber-600" : "text-stone-400 hover:text-amber-500"}`}>{mm}</button>
            </div>
            <div className="flex flex-col gap-1">
              {["AM", "PM"].map(ap => (
                <button key={ap} type="button" onClick={() => { setAmpm(ap); emit(hrs, mins, ap); }}
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all
                    ${ampm === ap ? "bg-amber-500 text-white" : "text-stone-500 hover:bg-amber-50 border border-amber-200"}`}>{ap}</button>
              ))}
            </div>
          </div>
          <p className="text-center text-amber-500 text-xs uppercase tracking-widest mb-1">
            {mode === "hours" ? "Select Hour" : "Select Minute"}
          </p>
          <div className="flex justify-center pb-3">
            <svg width={SIZE} height={SIZE} onClick={handleClockClick} className="cursor-pointer" style={{ userSelect: "none" }}>
              <circle cx={CENTER} cy={CENTER} r={CENTER - 4} fill="#fffbf0" stroke="#fde68a" strokeWidth="1.5" />
              {Array.from({ length: 60 }, (_, i) => {
                const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
                const isMajor = i % 5 === 0, r1 = CENTER - 8, r2 = isMajor ? CENTER - 16 : CENTER - 12;
                return <line key={i} x1={CENTER + r1 * Math.cos(angle)} y1={CENTER + r1 * Math.sin(angle)}
                  x2={CENTER + r2 * Math.cos(angle)} y2={CENTER + r2 * Math.sin(angle)}
                  stroke={isMajor ? "#d97706" : "#fcd34d"} strokeWidth={isMajor ? 1.5 : 1} />;
              })}
              <line x1={CENTER} y1={CENTER} x2={handX} y2={handY} stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
              <circle cx={handX} cy={handY} r="6" fill="#d97706" />
              <circle cx={CENTER} cy={CENTER} r="4" fill="#d97706" />
              {mode === "hours" && hourNumbers.map((n, i) => {
                const pos = getPos(i + 1, 12, HOUR_R), isSelected = hrs === n;
                return (<g key={n}>
                  {isSelected && <circle cx={pos.x} cy={pos.y} r="14" fill="rgba(217,119,6,0.15)" />}
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize="13"
                    fontWeight={isSelected ? "bold" : "normal"} fill={isSelected ? "#b45309" : "#92400e"}
                    style={{ pointerEvents: "none" }}>{n}</text>
                </g>);
              })}
              {mode === "minutes" && minNumbers.map((n, i) => {
                const pos = getPos(i, 12, MIN_R), isSelected = mins === n;
                return (<g key={n}>
                  {isSelected && <circle cx={pos.x} cy={pos.y} r="14" fill="rgba(217,119,6,0.15)" />}
                  <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" fontSize="11"
                    fontWeight={isSelected ? "bold" : "normal"} fill={isSelected ? "#b45309" : "#92400e"}
                    style={{ pointerEvents: "none" }}>{String(n).padStart(2, "0")}</text>
                </g>);
              })}
            </svg>
          </div>
          <div className="border-t border-amber-100 p-2">
            <p className="text-amber-600 text-xs mb-1.5 uppercase tracking-wider px-1">Quick</p>
            <div className="flex flex-wrap gap-1">
              {[
                { l: "Midnight", h: 12, m: 0, ap: "AM" },
                { l: "Sunrise", h: 6, m: 0, ap: "AM" },
                { l: "Noon", h: 12, m: 0, ap: "PM" },
                { l: "Sunset", h: 6, m: 0, ap: "PM" },
              ].map(q => (
                <button key={q.l} type="button"
                  onClick={() => { setHrs(q.h); setMins(q.m); setAmpm(q.ap); emit(q.h, q.m, q.ap); setOpen(false); setMode("hours"); }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">{q.l}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Location Search (light) ───────────────────────────────────
function LocationSearch({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [sugs, setSugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState(false);
  const [err, setErr] = useState('');
  const debRef = useRef(null);

  const guessTimezone = lon => {
    if (lon >= 68 && lon <= 97) return 5.5;
    if (lon >= -8 && lon <= 2) return 0;
    if (lon >= -80 && lon <= -66) return -5;
    if (lon >= -125 && lon <= -115) return -8;
    return Math.round(lon / 15 * 2) / 2;
  };

  const search = useCallback(async q => {
    if (q.length < 3) { setSugs([]); return; }
    setLoading(true); setErr('');
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      setSugs(await r.json());
    } catch { setErr('Location search failed. Enter city manually.'); }
    finally { setLoading(false); }
  }, []);

  const handleInput = e => {
    const v = e.target.value;
    setQuery(v); setPicked(false);
    onChange(v, null, null, null);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => search(v), 500);
  };

  const handleSelect = p => {
    const lat = parseFloat(p.lat), lon = parseFloat(p.lon);
    const tz = guessTimezone(lon);
    const display = p.display_name.split(',').slice(0, 3).join(', ');
    setQuery(display); setSugs([]); setPicked(true);
    onSelect(display, lat, lon, tz);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input value={query} onChange={handleInput}
          placeholder="Type city... e.g. Mumbai, Delhi, London"
          className={`w-full bg-white border rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400
            focus:outline-none transition-colors text-sm pr-10 shadow-sm
            ${picked ? 'border-green-400 ring-2 ring-green-50' : 'border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'}`} />
        <div className="absolute right-3 top-3">
          {loading && <span className="animate-spin inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full" />}
          {picked && !loading && <span className="text-green-500 text-lg">✓</span>}
        </div>
      </div>
      {sugs.length > 0 && !picked && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-amber-200 rounded-xl overflow-hidden shadow-2xl">
          {sugs.map((p, i) => {
            const parts = p.display_name.split(',');
            return (
              <button key={i} onClick={() => handleSelect(p)}
                className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-amber-100 last:border-0">
                <p className="text-stone-800 text-sm font-medium">📍 {parts.slice(0, 2).join(',').trim()}</p>
                <div className="flex justify-between mt-0.5">
                  <p className="text-stone-500 text-xs">{parts.slice(2, 4).join(',').trim()}</p>
                  <p className="text-stone-400 text-xs">Lat:{parseFloat(p.lat).toFixed(2)} Lon:{parseFloat(p.lon).toFixed(2)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
      {picked && <p className="text-green-600 text-xs mt-1">✅ Coordinates captured — accurate Lagna guaranteed</p>}
      {!picked && query.length > 2 && <p className="text-amber-600 text-xs mt-1">⚠️ Select from dropdown for accurate Lagna</p>}
    </div>
  );
}

// ── Dosha Card (light) ────────────────────────────────────────
function DoshaCard({ d, matchedPuja }) {
  const [open, setOpen] = useState(false);
  const severityCls = SEVERITY_CLS[d.severity] || SEVERITY_CLS.LOW;

  return (
    <div className={`border rounded-xl p-4 transition-all ${severityCls}`}>
      <div className="cursor-pointer" onClick={() => setOpen(o => !o)}>
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm md:text-base leading-tight">{d.name}</p>
            <p className="text-xs opacity-60 mt-0.5 truncate">{d.trigger}</p>
          </div>
          <span className="text-sm shrink-0">{open ? '▲' : '▼'}</span>
        </div>
        {d.partialNote && (
          <div className="mt-2 px-3 py-1.5 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-700 font-medium">⚡ {d.partialNote}</p>
          </div>
        )}
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t border-current/20 pt-4">
          {d.cancellations?.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <p className="text-xs font-bold text-green-700 mb-1">✅ Cancellations / Reductions:</p>
              {d.cancellations.map((c, i) => <p key={i} className="text-xs text-green-700">• {c}</p>)}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Impact</p>
            <p className="text-sm">{d.impact}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">📖 Reference</p>
            <p className="text-xs italic opacity-70">{d.classicRef}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">🙏 Remedies</p>
            {(d.remedy || []).map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm mb-1">
                <span className="opacity-50 shrink-0">•</span><span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {matchedPuja && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div
            className={`group block w-full rounded-2xl overflow-hidden shadow-md relative ${matchedPuja.isDummy ? 'opacity-75 cursor-default' : 'cursor-pointer'}`}
          >
            <div className="relative w-full h-40 overflow-hidden"
              style={{ background: matchedPuja.isDummy ? 'linear-gradient(135deg,#9ca3af,#4b5563)' : 'linear-gradient(135deg,#f97316,#b45309)' }}>
              {matchedPuja.imageUrl ? (
                <img
                  src={matchedPuja.imageUrl}
                  alt={matchedPuja.pujaName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={48} className="text-white/20" />
                </div>
              )}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 30%, rgba(0,0,0,0.6) 100%)' }} />

              {matchedPuja.isDummy && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  Placeholder
                </div>
              )}

              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-white font-bold text-base leading-snug drop-shadow-lg">{matchedPuja.pujaName}</p>
                <p className="text-amber-200 text-xs mt-0.5 font-medium">
                  {matchedPuja.isDummy ? 'Available Soon' : 'Expert Pandit · Vedic Vidhi'}
                </p>
              </div>
            </div>

            {matchedPuja.isDummy ? (
              <div className="w-full py-3 text-center font-bold text-white text-sm bg-gray-600">
                Puja Coming Soon
              </div>
            ) : (
              <a
                href={matchedPuja.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-center font-bold text-white text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                🛕 Book Puja
              </a>
            )}
          </div>
          {matchedPuja.isDummy && (
            <p className="text-[10px] mt-2 opacity-60 italic text-center">
              Admin: Create a puja with name matching "{d.name}" to replace this.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab Bar (light) ───────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-amber-50 border border-amber-200 p-1 rounded-xl overflow-x-auto">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`shrink-0 py-2 px-3 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap
            ${active === t.id
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function KundliPortal() {
  const [form, setForm] = useState({
    name: '', mobile: '', dateOfBirth: '', timeOfBirth: '', placeOfBirth: '',
    gender: 'Male', latitude: null, longitude: null, timezoneOffset: 5.5
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('planets');
  const [allPujas, setAllPujas] = useState([]);
  const resultRef = useRef(null);

  useEffect(() => {
    const fetchPujas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/puja/allServices`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.services || data.data || []);
        setAllPujas(list);
      } catch (err) {
        console.warn('Could not fetch puja services:', err.message);
      }
    };
    fetchPujas();
  }, []);

  const doshaPujaMap = useMemo(() => {
    if (!result || allPujas.length === 0) return {};
    const map = {};
    const buildImageUrl = (imageUrl) => {
      if (!imageUrl) return null;
      if (imageUrl.startsWith('http')) return imageUrl;
      if (imageUrl.startsWith('/uploads/')) return `${API_BASE_URL.replace('/api', '')}${imageUrl}`;
      return `${API_BASE_URL}/uploads/${imageUrl}`;
    };
    (result.kundli.doshas || []).forEach(d => {
      const matched = matchPujaForDosha(d.name, allPujas);
      if (matched.length > 0) {
        const svc = matched[0];
        const id = svc.id || svc._id;
        map[d.name] = {
          pujaName: svc.puja_name || svc.name || svc.title,
          pujaId: id,
          imageUrl: buildImageUrl(svc.image_url),
          bookingUrl: `${window.location.origin}/home-puja/${id}`,
          isDummy: false,
        };
      } else {
        // Dummy/Placeholder Puja
        map[d.name] = {
          pujaName: `${d.name} Shanti Puja`,
          pujaId: null,
          imageUrl: null,
          bookingUrl: '#',
          isDummy: true,
        };
      }
    });
    return map;
  }, [result, allPujas]);

  const setF = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const generate = async () => {
    setError(''); setResult(null);
    if (!form.name || !form.mobile || !form.dateOfBirth || !form.timeOfBirth || !form.placeOfBirth)
      return setError('Please fill all mandatory fields, including your mobile number.');
    if (form.mobile.length < 10)
      return setError('Please enter a valid 10-digit mobile number.');
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, mobile: form.mobile, dateOfBirth: form.dateOfBirth, timeOfBirth: form.timeOfBirth,
          placeOfBirth: form.placeOfBirth, gender: form.gender,
          latitude: form.latitude || 20.5937, longitude: form.longitude || 78.9629,
          timezoneOffset: form.timezoneOffset || 5.5,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data); setTab('planets');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (e) {
      setError(e.message || 'Server error. Check backend is running on port 5000.');
    } finally { setLoading(false); }
  };

  const TABS = [
    { id: 'planets', label: '🪐 Planets' },
    { id: 'doshas', label: '⚠️ Doshas' },
  ];

  const SOURCE_BADGE = {
    swisseph: { cl: 'bg-green-100 text-green-700 border-green-300', ic: '🌌', t: 'Precision Calculation — High Accuracy' },
    moshier: { cl: 'bg-blue-100 text-blue-700 border-blue-300', ic: '🔭', t: 'Standard Calculation — Optimized' },
    mixed: { cl: 'bg-amber-100 text-amber-700 border-amber-300', ic: '⚡', t: 'Multi-Engine Calculation' },
    fallback: { cl: 'bg-stone-100 text-stone-600 border-stone-300', ic: '📐', t: 'Mathematical Fallback' },
  };

  return (
    /* ── Main bg: #FFF4E1 ── */
    <div className="min-h-screen" style={{ background: '#FFF4E1' }}>

      {/* Subtle warm texture dots */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: `rgba(180, 100, 20, ${Math.random() * 0.15 + 0.04})`
            }} />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🛕</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2"
            style={{ background: 'linear-gradient(135deg,#b45309,#d97706,#92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kundli Nirman
          </h1>
          <p className="text-amber-700 text-sm tracking-widest uppercase mt-1 opacity-70">
            Professional Birth Chart · Accurate Calculations · Detailed Analysis
          </p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {['🌌 Vedic Calculations', '📿 Lahiri Ayanamsa', '🏠 Whole Sign Houses'].map(t => (
              <span key={t} className="text-xs bg-amber-100 border border-amber-300 text-amber-700 px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
          <h2 className="text-amber-800 font-semibold text-lg mb-5">📋 Birth Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">Full Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={setF}
                placeholder="e.g. Ramesh Kumar Sharma"
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors text-sm shadow-sm" />
            </div>
            <div>
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">Mobile Number <span className="text-red-500">*</span></label>
              <input name="mobile" value={form.mobile} onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setForm(f => ({ ...f, mobile: val }));
              }}
                placeholder="10-digit mobile number"
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-colors text-sm shadow-sm" />
            </div>
            <div>
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">Gender <span className="text-red-500">*</span></label>
              <select name="gender" value={form.gender} onChange={setF}
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm shadow-sm">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={setF}
                className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-sm shadow-sm" />
            </div>
            <div>
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">
                Time of Birth <span className="text-red-500">*</span>
                {form.timeOfBirth && <span className="ml-2 text-green-600 normal-case text-xs font-normal">✓ {form.timeOfBirth}</span>}
              </label>
              <TimePicker value={form.timeOfBirth} onChange={v => setForm(f => ({ ...f, timeOfBirth: v }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-amber-700 text-xs uppercase tracking-wider mb-1.5 block font-medium">
                Place of Birth <span className="text-red-500">*</span>
                {form.latitude && <span className="ml-2 text-green-600 normal-case text-xs font-normal">
                  📍 {form.latitude?.toFixed(3)}, {form.longitude?.toFixed(3)} TZ:+{form.timezoneOffset}
                </span>}
              </label>
              <LocationSearch
                value={form.placeOfBirth}
                onChange={v => setForm(f => ({ ...f, placeOfBirth: v }))}
                onSelect={(d, lat, lon, tz) => setForm(f => ({ ...f, placeOfBirth: d, latitude: lat, longitude: lon, timezoneOffset: tz }))}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button onClick={generate} disabled={loading}
            className="mt-6 w-full py-4 rounded-xl font-bold text-base tracking-wide text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading
                ? '#d97706'
                : 'linear-gradient(135deg,#f59e0b,#d97706,#b45309)',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(180,100,20,0.3)'
            }}>
            {loading
              ? <span className="flex items-center justify-center gap-3">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Calculating Chart & Analyzing...
              </span>
              : '🛕 Generate Kundli Report'}
          </button>
        </div>

        {/* ── Results ── */}
        {result && (
          <div ref={resultRef} className="space-y-5">

            {/* Summary Card */}
            <div className="bg-white border border-amber-200 rounded-2xl p-5 md:p-6 shadow-lg">
              <h2 className="text-amber-800 font-bold text-lg mb-4">
                📊 Kundli — {result.kundli.nativeInfo.name}
              </h2>
              {(() => {
                const s = SOURCE_BADGE[result.kundli.dataSource] || SOURCE_BADGE.fallback;
                return (
                  <div className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full mb-4 border ${s.cl}`}>
                    {s.ic} {s.t}
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { l: 'Lagna', v: result.kundli.lagnaRashi },
                  { l: 'Moon Sign', v: result.kundli.planets.Moon.rashi },
                  { l: 'Nakshatra', v: result.kundli.nakshatra },
                  { l: 'Mahadasha', v: `${result.kundli.mahadasha.planet} (${result.kundli.mahadasha.yearsRemaining} yrs)` },
                ].map(({ l, v }) => (
                  <div key={l} className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-amber-600 text-xs uppercase tracking-wider mb-1">{l}</p>
                    <p className="text-stone-800 font-semibold text-sm">{v}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {result.kundli.strongPlanets?.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-green-700 text-xs font-bold uppercase mb-1">⬆ Strong</p>
                    <p className="text-green-800 text-sm">{result.kundli.strongPlanets.join(', ')}</p>
                  </div>
                )}
                {result.kundli.weakPlanets?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-600 text-xs font-bold uppercase mb-1">⬇ Weak</p>
                    <p className="text-red-700 text-sm">{result.kundli.weakPlanets.join(', ')}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-stone-500 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <span>📍 {result.kundli.nativeInfo.placeOfBirth}</span>
                <span>🌐 Ayanamsa: {result.kundli.ayanamsa}°</span>
                <span>⏱ TZ: UTC+{result.kundli.nativeInfo.timezoneOffset}</span>
              </div>
            </div>

            {/* Tab Content Card */}
            <div className="bg-white border border-amber-200 rounded-2xl p-5 md:p-6 shadow-lg">
              <TabBar tabs={TABS} active={tab} onChange={setTab} />

              <div className="mt-6">

                {/* ── Planets Tab ── */}
                {tab === 'planets' && (
                  <div className="space-y-6">
                    <KundliChart planets={result.kundli.planets} lagnaRashi={result.kundli.lagnaRashi} />
                    <div>
                      <h3 className="text-amber-800 font-semibold mb-3">🪐 Planetary Positions</h3>
                      <div className="overflow-x-auto rounded-xl border border-amber-200">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-amber-50 text-amber-700 text-xs uppercase tracking-widest border-b border-amber-200">
                              <th className="px-4 py-3 text-left">Planet</th>
                              <th className="px-4 py-3 text-left">Rashi</th>
                              <th className="px-4 py-3 text-left">Degree</th>
                              <th className="px-4 py-3 text-left">House</th>
                              <th className="px-4 py-3 text-left">Strength</th>
                              <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(result.kundli.planets).map(([name, p], i) => (
                              <tr key={name} className={`border-t border-amber-100 hover:bg-amber-50 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-50/50'}`}>
                                <td className="px-4 py-2.5 font-medium text-stone-800">
                                  <span className="mr-2">{PLANET_SYMBOLS[name] || '⭐'}</span>{name}
                                </td>
                                <td className="px-4 py-2.5 text-stone-700">{p.rashi}</td>
                                <td className="px-4 py-2.5 text-stone-700">{p.degree}°</td>
                                <td className="px-4 py-2.5 text-stone-700">H{p.house}</td>
                                <td className={`px-4 py-2.5 text-xs ${STRENGTH_CLS[p.strength] || STRENGTH_CLS.NEUTRAL}`}>
                                  {p.strength === 'EXALTED' ? '⬆ Exalted' : p.strength === 'OWN_SIGN' ? '🏠 Own' : p.strength === 'DEBILITATED' ? '⬇ Debil' : '— Neutral'}
                                </td>
                                <td className="px-4 py-2.5 text-xs">
                                  {p.retrograde && <span className="text-orange-500 font-medium">℞ Retro</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Doshas Tab ── */}
                {tab === 'doshas' && (
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-5">
                      <h3 className="text-amber-800 font-semibold text-base">⚠️ Dosha Analysis</h3>
                    </div>
                    {result.kundli.doshas.length === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="text-green-700 font-semibold">No Doshas Detected</p>
                        <p className="text-green-600 text-sm mt-1">Kundli is free from major afflictions</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {result.kundli.doshas.filter(d => d.present && d.type === 'FULL').length > 0 && (
                          <div>
                            <p className="text-red-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                              Full Doshas — Primary Afflictions
                            </p>
                            <div className="space-y-3">
                              {result.kundli.doshas.filter(d => d.present && d.type === 'FULL').map((d, i) => (
                                <DoshaCard key={i} d={d} matchedPuja={doshaPujaMap[d.name] || null} />
                              ))}
                            </div>
                          </div>
                        )}
                        {result.kundli.doshas.filter(d => d.present && d.type === 'PARTIAL').length > 0 && (
                          <div>
                            <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                              Partial Doshas — Mild Influence
                            </p>
                            <div className="space-y-3">
                              {result.kundli.doshas.filter(d => d.present && d.type === 'PARTIAL').map((d, i) => (
                                <DoshaCard key={i} d={d} matchedPuja={doshaPujaMap[d.name] || null} />
                              ))}
                            </div>
                          </div>
                        )}
                        {result.kundli.doshas.filter(d => d.type === 'CANCELLED').length > 0 && (
                          <div>
                            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-stone-400 inline-block" />
                              Cancelled Doshas — Neutralised
                            </p>
                            <div className="space-y-3">
                              {result.kundli.doshas.filter(d => d.type === 'CANCELLED').map((d, i) => (
                                <DoshaCard key={i} d={d} matchedPuja={null} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Option A Tab ── */}
                {tab === 'optionA' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-bold text-white shadow">A</div>
                      <h3 className="text-amber-800 font-semibold">Parashari System — BPHS / North Indian</h3>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                      <AnalysisText text={result.analysis?.optionA} />
                    </div>
                  </div>
                )}

                {/* ── Option B Tab ── */}
                {tab === 'optionB' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white shadow">B</div>
                      <h3 className="text-amber-800 font-semibold">KP / Jaimini System — South Indian</h3>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                      <AnalysisText text={result.analysis?.optionB} />
                    </div>
                  </div>
                )}

                {/* ── Verdict Tab ── */}
                {tab === 'verdict' && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-3xl">✅</span>
                      <h3 className="text-amber-800 font-semibold">Final Cross-Verified Verdict</h3>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                      <AnalysisText text={result.analysis?.finalVerdict} />
                    </div>
                    <p className="text-stone-400 text-xs text-right mt-3">
                      {result.meta?.model} · {result.meta?.tokensUsed} tokens
                    </p>
                  </div>
                )}

                {/* ── Raw Tab ── */}
                {tab === 'raw' && (
                  <div>
                    <h3 className="text-amber-800 font-semibold mb-3">🔍 Technical Details</h3>
                    <pre className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 whitespace-pre-wrap overflow-auto max-h-[600px]">
                      {result.rawAnalysis}
                    </pre>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center mt-14 text-amber-600 text-xs space-y-1 opacity-60">
          <p>🔭 Vedic Calculations • 📿 Lahiri Ayanamsa • 🏠 Whole Sign</p>
          <p>For important decisions, consult a qualified Jyotishi.</p>
        </div>
      </div>
    </div>
  );
}