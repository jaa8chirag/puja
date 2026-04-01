// pages/CancellationPolicy.jsx
import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function CancellationPolicy() {
  const [raw, setRaw] = useState(null);
  const [pageTitle, setPageTitle] = useState("Cancellation Policy");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/cancellation-policy`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPageTitle(d.data.title || "Cancellation Policy");
          const sec = d.data.sections;
          setRaw(typeof sec === "string" ? JSON.parse(sec) : sec);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
        <p className="text-orange-600 font-bold animate-pulse">Loading...</p>
      </div>
    );

  // ── NEW array format: [{title, content}, ...] ─────────────────────────────
  if (Array.isArray(raw)) {
    const sections = raw.filter((s) => s.title || s.content);
    const heroSection = sections[0];
    const restSections = sections.slice(1);

    return (
      <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-100 p-4 rounded-2xl">
              <ShieldAlert size={32} className="text-orange-600" />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-3 text-[#7c2d00]"
            style={{ fontFamily: "'Georgia', serif" }}>
            {pageTitle}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #d97706)" }} />
            <span className="text-orange-500 text-lg">🛕</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
          </div>
          {/* First section as intro */}
          {heroSection?.content && (
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6 text-left">
              {heroSection.title && (
                <h2 className="text-base font-black text-[#7c2d00] mb-2"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {heroSection.title}
                </h2>
              )}
              <p className="text-[#3d1500]/70 text-sm leading-relaxed"
                style={{ fontFamily: "'Georgia', serif" }}>
                {heroSection.content}
              </p>
            </div>
          )}
        </div>

        {/* Rest of sections */}
        <div className="max-w-3xl mx-auto px-4 pb-16 space-y-5">
          {restSections.map((sec, i) => (
            <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
              {sec.title && (
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0">
                    {i + 1}
                  </span>
                  <h2 className="text-base font-black text-[#7c2d00]"
                    style={{ fontFamily: "'Georgia', serif" }}>
                    {sec.title}
                  </h2>
                </div>
              )}
              {sec.content && (
                <p className={`text-[#3d1500]/65 text-sm leading-relaxed ${sec.title ? "ml-10" : ""}`}>
                  {sec.content}
                </p>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <p className="text-center text-orange-400/50 text-sm py-16">
              Content abhi available nahi hai.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── OLD flat format fallback ───────────────────────────────────────────────
  const s = raw || {};
  const keys = Object.keys(s);
  const used = new Set();
  const sections = [];

  // Pair _title + _text
  keys.forEach((key) => {
    if (used.has(key)) return;
    if (key.endsWith("_title")) {
      const base = key.replace(/_title$/, "");
      const textKey = `${base}_text`;
      if (keys.includes(textKey)) {
        if (s[key] || s[textKey]) sections.push({ title: s[key] || "", text: s[textKey] || "" });
        used.add(key);
        used.add(textKey);
      }
    }
  });

  const introText = s.intro_text;
  const lastUpdated = s.last_updated ?? s.last_updated_text;

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-2xl">
            <ShieldAlert size={32} className="text-orange-600" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-3 text-[#7c2d00]"
          style={{ fontFamily: "'Georgia', serif" }}>
          {s.hero_title || pageTitle}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #d97706)" }} />
          <span className="text-orange-500 text-lg">🛕</span>
          <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
        </div>
        {s.hero_subtitle && (
          <p className="text-orange-700/70 text-base font-medium mb-2">{s.hero_subtitle}</p>
        )}
        {lastUpdated && (
          <p className="text-xs text-orange-500/50 font-medium">Last Updated: {lastUpdated}</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-5">
        {introText && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
            <p className="text-[#3d1500]/70 text-sm leading-relaxed"
              style={{ fontFamily: "'Georgia', serif" }}>
              {introText}
            </p>
          </div>
        )}

        {sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
            {sec.title && (
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0">
                  {i + 1}
                </span>
                <h2 className="text-base font-black text-[#7c2d00]"
                  style={{ fontFamily: "'Georgia', serif" }}>
                  {sec.title}
                </h2>
              </div>
            )}
            {sec.text && (
              <p className={`text-[#3d1500]/65 text-sm leading-relaxed ${sec.title ? "ml-10" : ""}`}>
                {sec.text}
              </p>
            )}
          </div>
        ))}

        {sections.length === 0 && !introText && (
          <p className="text-center text-orange-400/50 text-sm py-16">
            Content not available.
          </p>
        )}
      </div>
    </div>
  );
}