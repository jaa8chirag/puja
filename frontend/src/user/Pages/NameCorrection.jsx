import React, { useState, useRef } from "react";
import { PremiumReportSection } from "./PremiumReportSection";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${API_BASE_URL}/name/analyze`;

// ── Styling helpers ───────────────────────────────────────────
const STRENGTH_STYLE = {
  VeryStrong: {
    bg: "bg-emerald-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
  Master: {
    bg: "bg-violet-50",
    border: "border-violet-300",
    text: "text-violet-700",
    badge: "bg-violet-100 text-violet-800",
  },
  Strong: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
  },
  Moderate: {
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  Weak: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
  },
};

const GRADE_STYLE = {
  "A+": "from-emerald-500 to-teal-400",
  A: "from-green-500 to-emerald-400",
  "B+": "from-amber-500 to-yellow-400",
  B: "from-orange-500 to-amber-400",
  C: "from-red-600 to-rose-500",
};

const CHALDEAN_MAP = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};
const PYTH_MAP = {
  A: 1, J: 1, S: 1,
  B: 2, K: 2, T: 2,
  C: 3, L: 3, U: 3,
  D: 4, M: 4, V: 4,
  E: 5, N: 5, W: 5,
  F: 6, O: 6, X: 6,
  G: 7, P: 7, Y: 7,
  H: 8, Q: 8, Z: 8,
  I: 9, R: 9,
};

function compatColor(p) {
  return p >= 85 ? "bg-emerald-500" : p >= 70 ? "bg-amber-400" : "bg-red-400";
}

// ── Reusable Components ───────────────────────────────────────
function CompatBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-amber-800">{label}</span>
        <span
          className={
            value >= 80
              ? "text-emerald-600"
              : value >= 65
                ? "text-amber-600"
                : "text-red-500"
          }
        >
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${compatColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function LetterBreakdown({ name, mapType }) {
  const map = mapType === "chaldean" ? CHALDEAN_MAP : PYTH_MAP;
  const letters = name
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .split("");
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {letters.map((l, i) =>
        l === " " ? (
          <div key={i} className="w-3" />
        ) : (
          <div
            key={i}
            className="flex flex-col items-center bg-amber-50 rounded-lg px-2 py-1 border border-amber-200 min-w-[28px]"
          >
            <span className="text-amber-700 font-bold text-sm">{l}</span>
            <span className="text-amber-400 text-xs">{map[l] ?? "–"}</span>
          </div>
        ),
      )}
    </div>
  );
}

function NumberCard({ title, icon, data, name }) {
  const st = STRENGTH_STYLE[data.strength] || STRENGTH_STYLE.Moderate;
  return (
    <div className={`rounded-2xl border p-5 ${st.bg} ${st.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-amber-900 font-semibold text-sm uppercase tracking-wider">
            {title}
          </span>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.badge}`}
        >
          {data.strength}
        </span>
      </div>
      <div className="flex items-end gap-4 mb-3">
        <div className="text-center">
          <p className="text-amber-600 text-xs mb-0.5">Compound</p>
          <p className={`text-5xl font-black ${st.text}`}>{data.compound}</p>
        </div>
        <div className="text-amber-300 text-2xl font-light mb-2">→</div>
        <div className="text-center">
          <p className="text-amber-600 text-xs mb-0.5">Root</p>
          <p className="text-5xl font-black text-amber-900">{data.root}</p>
        </div>
      </div>
      <div
        className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${st.badge} opacity-90`}
      >
        {data.category}
      </div>
      <p className={`text-sm font-medium ${st.text} mb-3`}>"{data.meaning}"</p>
      <p className="text-amber-500 text-xs uppercase tracking-wider mb-1">
        Letter Values
      </p>
      <LetterBreakdown
        name={name}
        mapType={
          title.toLowerCase().includes("chaldean") ? "chaldean" : "pythagorean"
        }
      />
    </div>
  );
}

function SuggestionCard({ s, onCopy }) {
  const grade =
    s.compatScore >= 85
      ? "A+"
      : s.compatScore >= 75
        ? "A"
        : s.compatScore >= 65
          ? "B+"
          : "B";
  return (
    <div
      className={`rounded-xl border p-4 transition-all hover:scale-[1.01]
      ${
        s.isPowerful
          ? "bg-amber-50 border-amber-300"
          : "bg-white border-amber-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1">
          {s.isPowerful && (
            <span className="text-xs bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full font-bold mr-2">
              ⭐ Powerful
            </span>
          )}
          <span className="text-amber-900 font-bold text-lg tracking-wide">
            {s.name}
          </span>
        </div>
        <span
          className={`text-xs font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${GRADE_STYLE[grade] || GRADE_STYLE["B+"]} text-white shrink-0`}
        >
          {grade}
        </span>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
          <p className="text-amber-500 mb-0.5">Chaldean</p>
          <p className="text-amber-700 font-bold">
            {s.chaldean.compound} → {s.chaldean.root}
          </p>
          <p className="text-amber-600 text-xs leading-tight truncate">
            {s.chaldean.meaning}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <p className="text-blue-400 mb-0.5">Pythagorean</p>
          <p className="text-blue-700 font-bold">
            {s.pythagorean.compound} → {s.pythagorean.root}
          </p>
          <p className="text-blue-500 text-xs leading-tight truncate">
            {s.pythagorean.meaning}
          </p>
        </div>
      </div>

      {/* AI Insights */}
      {s.whyGood && (
        <div className="bg-orange-50 rounded-lg p-2.5 mb-2 border border-orange-100">
          <p className="text-xs text-orange-500 uppercase tracking-wider mb-1">
            🤖 Why this works
          </p>
          <p className="text-orange-800 text-xs leading-relaxed">{s.whyGood}</p>
        </div>
      )}
      {s.expectedBenefits && (
        <div className="bg-emerald-50 rounded-lg p-2.5 mb-3 border border-emerald-100">
          <p className="text-xs text-emerald-600 uppercase tracking-wider mb-1">
            ✨ Expected Benefits
          </p>
          <p className="text-emerald-700 text-xs leading-relaxed">
            {s.expectedBenefits}
          </p>
        </div>
      )}

      {/* Compat bars */}
      <div className="flex gap-2 items-center mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-amber-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${compatColor(s.dobCompat || 75)}`}
            style={{ width: `${s.dobCompat || 75}%` }}
          />
        </div>
        <span className="text-amber-500 text-xs whitespace-nowrap">
          {s.dobCompat || 75}% DOB
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-amber-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${compatColor(s.lpCompat || 75)}`}
            style={{ width: `${s.lpCompat || 75}%` }}
          />
        </div>
        <span className="text-amber-500 text-xs whitespace-nowrap">
          {s.lpCompat || 75}% LP
        </span>
      </div>

      <button
        onClick={() => onCopy(s.name)}
        className="w-full text-xs py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 hover:text-amber-900 transition-colors border border-amber-200"
      >
        📋 Copy Name
      </button>
    </div>
  );
}

// ── AI Insight Block ──────────────────────────────────────────
function AIInsights({ ai }) {
  if (!ai) return null;
  return (
    <div className="space-y-4">
      {/* Personality */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>🧠</span> Personality Insight
        </p>
        <p className="text-amber-900 text-sm leading-relaxed">
          {ai.personalityInsight}
        </p>
      </div>

      {/* Current Name Analysis */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>🔍</span> Current Name Analysis
        </p>
        <p className="text-amber-900 text-sm leading-relaxed">
          {ai.currentNameAnalysis}
        </p>

        {ai.correctionNeeded !== undefined && (
          <div
            className={`mt-3 rounded-xl p-3 border text-sm
            ${
              ai.correctionNeeded
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {ai.correctionNeeded ? "⚠️ " : "✅ "}
            {ai.correctionReason}
          </div>
        )}
      </div>

      {/* Challenges */}
      {ai.challenges && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-orange-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>⚡</span> Key Challenges
          </p>
          <p className="text-orange-900 text-sm leading-relaxed">
            {ai.challenges}
          </p>
        </div>
      )}

      {/* Career + Lucky */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ai.careerAreas?.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <span>💼</span> Best Career Areas
            </p>
            <div className="flex flex-wrap gap-2">
              {ai.careerAreas.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-white text-amber-800 px-2.5 py-1 rounded-full border border-amber-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
            <span>🍀</span> Lucky Details
          </p>
          <div className="space-y-2">
            {ai.luckyNumbers?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xs w-16">Numbers</span>
                <div className="flex gap-1">
                  {ai.luckyNumbers.map((n, i) => (
                    <span
                      key={i}
                      className="w-7 h-7 flex items-center justify-center bg-amber-200 text-amber-800 rounded-full text-xs font-bold border border-amber-300"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ai.luckyColors?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xs w-16">Colors</span>
                <div className="flex flex-wrap gap-1">
                  {ai.luckyColors.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-amber-700 px-2 py-0.5 rounded-full border border-amber-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ai.luckyDays?.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-amber-500 text-xs w-16">Days</span>
                <div className="flex flex-wrap gap-1">
                  {ai.luckyDays.map((d, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-amber-700 px-2 py-0.5 rounded-full border border-amber-200"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General Advice */}
      {ai.generalAdvice && (
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
          <p className="text-violet-600 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>💫</span> Numerologist's Advice
          </p>
          <p className="text-violet-800 text-sm leading-relaxed italic">
            "{ai.generalAdvice}"
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function NameCorrection() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [tab, setTab] = useState("numbers");
  const resultRef = useRef(null);

  const analyze = async () => {
    setError("");
    setResult(null);
    if (!name.trim()) return setError("Please enter a name.");
    if (!dob) return setError("Please enter date of birth.");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), dob }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Server error");
      setResult(data);
      setTab("numbers");
      setTimeout(
        () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
        200,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const TABS = [
    { id: "numbers", label: "🔢 Numbers" },
    { id: "aiInsights", label: "🤖 AI Insights" },
    { id: "compat", label: "🤝 Compatibility" },
    { id: "suggestions", label: "✨ Suggestions" },
  ];

  return (
    <div
      className="min-h-screen text-amber-900"
      style={{ background: "#FFF4E1" }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔢</div>
          <h1
            className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
            style={{
              background:
                "linear-gradient(135deg,#92400e,#b45309,#d97706,#f59e0b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Name Correction
          </h1>
          <p className="text-amber-600 text-sm tracking-widest uppercase mt-1">
            Chaldean · Pythagorean · AI-Powered Analysis
          </p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {["🔮 Chaldean", "📐 Pythagorean", "✨ Smart Suggestions"].map(
              (t) => (
                <span
                  key={t}
                  className="text-xs bg-white border border-amber-200 text-amber-600 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-amber-700 font-semibold text-base mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
              1
            </span>
            Enter Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-amber-600 text-xs uppercase tracking-wider mb-1.5 block">
                Full Name (as currently used)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyze()}
                placeholder="e.g. Ramesh Kumar Sharma"
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 placeholder-amber-300 focus:outline-none focus:border-amber-400 transition-colors text-base"
              />
            </div>
            <div className="md:w-1/2">
              <label className="text-amber-600 text-xs uppercase tracking-wider mb-1.5 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 focus:outline-none focus:border-amber-400 transition-colors text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={analyze}
            disabled={loading}
            className="mt-6 w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all disabled:opacity-50 text-white"
            style={{
              background: loading
                ? "#d4b896"
                : "linear-gradient(135deg,#d97706,#b45309,#92400e)",
              boxShadow: loading ? "none" : "0 4px 20px rgba(180,83,9,0.25)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                AI analyzing name numerology…
              </span>
            ) : (
              "🔢 Analyze Name (AI-Powered)"
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div ref={resultRef} className="space-y-5">
            {/* Grade Banner */}
            <div
              className={`rounded-2xl p-1 bg-gradient-to-r ${GRADE_STYLE[result.assessment.grade]}`}
            >
              <div className="bg-amber-50/95 rounded-xl p-5 flex flex-col md:flex-row items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-full shrink-0 flex flex-col items-center justify-center bg-gradient-to-br ${GRADE_STYLE[result.assessment.grade]}`}
                >
                  <span className="text-white font-black text-3xl leading-none">
                    {result.assessment.grade}
                  </span>
                </div>
                <div className="text-center md:text-left flex-1">
                  <p className="text-amber-900 font-bold text-xl">{result.name}</p>
                  <p className="text-amber-600 text-sm mt-0.5">
                    {result.assessment.label}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <span className="text-xs bg-amber-100 px-2 py-1 rounded-full text-amber-700 border border-amber-200">
                      Birth: {result.dob.birthNumber} · Life Path:{" "}
                      {result.dob.lifePath}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-bold
                      ${
                        result.compat.overall >= 80
                          ? "bg-emerald-100 text-emerald-700"
                          : result.compat.overall >= 65
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {result.compat.overall}% Match
                    </span>
                    {result.ai?.correctionNeeded && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full border border-red-200">
                        ⚠️ Correction Recommended
                      </span>
                    )}
                    {result.isPowerfulChaldean && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
                        ⭐ Powerful Chaldean
                      </span>
                    )}
                    {result.isPowerfulPythagorean && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        ⭐ Powerful Pythagorean
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
              <div className="flex gap-1 bg-amber-50 p-1 rounded-xl mb-6 overflow-x-auto border border-amber-100">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`shrink-0 flex-1 py-2.5 px-2 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap
                      ${tab === t.id ? "bg-amber-600 text-white shadow" : "text-amber-600 hover:text-amber-800 hover:bg-amber-100"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── Numbers Tab ── */}
              {tab === "numbers" && (
                <div className="space-y-4">
                  <NumberCard
                    title="Chaldean"
                    icon="🔮"
                    data={result.chaldean}
                    name={result.name}
                  />
                  <NumberCard
                    title="Pythagorean"
                    icon="📐"
                    data={result.pythagorean}
                    name={result.name}
                  />
                  {/* DOB */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="text-amber-600 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span>📅</span> Date of Birth Numbers
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        {
                          l: "Birth No.",
                          v: result.dob.birthNumber,
                          sub: "(Day only)",
                        },
                        {
                          l: "Life Path",
                          v: result.dob.lifePath,
                          sub: `(total ${result.dob.lifePathTotal})`,
                        },
                        {
                          l: "Overall %",
                          v: `${result.compat.overall}%`,
                          sub: "compatibility",
                        },
                      ].map(({ l, v, sub }) => (
                        <div key={l} className="bg-white rounded-xl p-3 border border-amber-100">
                          <p className="text-amber-500 text-xs mb-1">{l}</p>
                          <p className="text-amber-700 font-black text-3xl">{v}</p>
                          <p className="text-amber-400 text-xs">{sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── AI Insights Tab ── */}
              {tab === "aiInsights" && <AIInsights ai={result.ai} />}

              {/* ── Compatibility Tab ── */}
              {tab === "compat" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <h3 className="text-amber-900 font-semibold mb-1">
                      🤝 Name × DOB Compatibility
                    </h3>
                    <p className="text-amber-500 text-xs mb-5">
                      Name vibration vs birth numbers
                    </p>
                    <div className="space-y-4">
                      <CompatBar
                        label={`Chaldean (${result.chaldean.root}) × Birth No. (${result.dob.birthNumber})`}
                        value={result.compat.chaldeanVsBirth}
                      />
                      <CompatBar
                        label={`Chaldean (${result.chaldean.root}) × Life Path (${result.dob.lifePath})`}
                        value={result.compat.chaldeanVsLifePath}
                      />
                      <CompatBar
                        label={`Pythagorean (${result.pythagorean.root}) × Birth No. (${result.dob.birthNumber})`}
                        value={result.compat.pythagoreanVsBirth}
                      />
                      <CompatBar
                        label={`Pythagorean (${result.pythagorean.root}) × Life Path (${result.dob.lifePath})`}
                        value={result.compat.pythagoreanVsLP}
                      />
                    </div>
                    <div className="mt-6 bg-white rounded-xl p-4 text-center border border-amber-100">
                      <p className="text-amber-500 text-xs uppercase tracking-wider mb-1">
                        Overall Score
                      </p>
                      <p
                        className={`text-5xl font-black mb-1 ${result.compat.overall >= 80 ? "text-emerald-600" : result.compat.overall >= 65 ? "text-amber-600" : "text-red-500"}`}
                      >
                        {result.compat.overall}%
                      </p>
                      <p className="text-amber-600 text-sm">
                        {result.assessment.label}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 space-y-2">
                    {result.compat.overall >= 80 && (
                      <p>
                        ✅{" "}
                        <strong className="text-emerald-600">Excellent</strong>{" "}
                        — your name strongly supports your birth vibration.
                      </p>
                    )}
                    {result.compat.overall >= 65 &&
                      result.compat.overall < 80 && (
                        <p>
                          ⚡ <strong className="text-amber-600">Good</strong> —
                          minor corrections can improve results significantly.
                        </p>
                      )}
                    {result.compat.overall < 65 && (
                      <p>
                        ⚠️ <strong className="text-red-500">Weak</strong> —
                        spelling correction recommended for better alignment.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Suggestions Tab ── */}
              {tab === "suggestions" && (
                <div>
                  {result.suggestions.length === 0 ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-emerald-700 font-semibold">
                        Your name is already optimal!
                      </p>
                      <p className="text-emerald-500 text-sm mt-1">
                        No corrections needed.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-amber-900 font-semibold">
                            ✨ AI-Recommended Spellings
                          </h3>
                          <p className="text-amber-500 text-xs mt-0.5">
                            {
                              result.suggestions.filter((s) => s.isPowerful)
                                .length
                            }{" "}
                            powerful · {result.suggestions.length} total
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.suggestions.map((s, i) => (
                          <SuggestionCard key={i} s={s} onCopy={handleCopy} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Premium CTA */}
                  <PremiumReportSection result={result} />

                  {copied && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm shadow-xl border border-emerald-200 z-50">
                      ✓ "{copied}" copied!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-14 text-amber-400 text-xs space-y-1">
          <p>🔮 Chaldean · 📐 Pythagorean</p>
          <p>For major decisions, consult a qualified numerologist.</p>
        </div>
      </div>
    </div>
  );
}