// pages/AboutUs.jsx
import React, { useEffect, useState } from "react";
import { Users, Target, Eye } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function AboutUs() {
  const [raw, setRaw] = useState(null);
  const [pageTitle, setPageTitle] = useState("About Us");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/about-us`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPageTitle(d.data.title || "About Us");
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

  // ── NEW format: array [{title, content}, ...] saved from updated admin ─────
  if (Array.isArray(raw)) {
    const sections = raw.filter((s) => s.title || s.content);
    return (
      <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
        <div className="relative max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-orange-500/60 text-[10px] tracking-[0.4em] uppercase mb-3 font-bold">ॐ</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#7c2d00]"
            style={{ fontFamily: "'Georgia', serif" }}>{pageTitle}</h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #d97706)" }} />
            <span className="text-orange-500 text-lg">🛕</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 pb-16 space-y-5">
          {sections.map((sec, i) => (
            <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
              {sec.title && (
                <h2 className="text-lg font-black text-[#7c2d00] mb-2"
                  style={{ fontFamily: "'Georgia', serif" }}>{sec.title}</h2>
              )}
              {sec.content && (
                <p className="text-orange-900/60 text-sm leading-relaxed">{sec.content}</p>
              )}
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-center text-orange-400/50 text-sm py-16">Content abhi available nahi hai.</p>
          )}
        </div>
      </div>
    );
  }

  // ── OLD flat format: { hero_title, mission_title, mission_text, ... } ──────
  const s = raw || {};

  // Extra dynamic sections (hamari_drishti_title etc.) — jo KNOWN set mein nahi
  const KNOWN = new Set([
    "hero_title", "hero_subtitle", "hero_image_url",
    "mission_title", "mission_text",
    "vision_title", "vision_text",
    "team_title", "team_subtitle",
    "stats_pujas", "stats_devotees", "stats_cities", "stats_pandits",
  ]);
  const keys = Object.keys(s);
  const used = new Set();
  const extraSections = [];
  keys.forEach((key) => {
    if (used.has(key) || KNOWN.has(key)) return;
    if (key.endsWith("_title")) {
      const base = key.replace(/_title$/, "");
      const textKey = `${base}_text`;
      if (keys.includes(textKey)) {
        if (s[key] || s[textKey]) extraSections.push({ title: s[key] || "", text: s[textKey] || "" });
        used.add(key);
        used.add(textKey);
      }
    }
  });

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {s.hero_image_url && (
          <img src={s.hero_image_url} alt="About"
            className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-orange-500/60 text-[10px] tracking-[0.4em] uppercase mb-3 font-bold">ॐ</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#7c2d00]"
            style={{ fontFamily: "'Georgia', serif" }}>
            {s.hero_title || "About Us"}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, transparent, #d97706)" }} />
            <span className="text-orange-500 text-lg">🛕</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(90deg, #d97706, transparent)" }} />
          </div>
          {s.hero_subtitle && (
            <p className="text-orange-700/70 text-lg font-medium max-w-xl mx-auto">{s.hero_subtitle}</p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8">
        {/* Stats */}
        {[s.stats_pujas, s.stats_devotees, s.stats_cities, s.stats_pandits].some(Boolean) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { val: s.stats_pujas, label: "Pujas" },
              { val: s.stats_devotees, label: "Devotees" },
              { val: s.stats_cities, label: "Cities" },
              { val: s.stats_pandits, label: "Pandits" },
            ].map((st, i) => st.val && (
              <div key={i} className="bg-white rounded-2xl border border-orange-200 p-5 text-center shadow-sm">
                <p className="text-3xl font-black text-orange-600"
                  style={{ fontFamily: "'Georgia', serif" }}>{st.val}</p>
                <p className="text-xs font-bold text-orange-700/60 uppercase tracking-wider mt-1">{st.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mission */}
        {(s.mission_title || s.mission_text) && (
          <div className="bg-white rounded-2xl border border-orange-200 p-7 shadow-sm flex gap-5">
            <div className="bg-orange-100 p-3 rounded-xl h-fit shrink-0">
              <Target size={22} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#7c2d00] mb-2"
                style={{ fontFamily: "'Georgia', serif" }}>{s.mission_title}</h2>
              <p className="text-orange-900/60 text-sm leading-relaxed">{s.mission_text}</p>
            </div>
          </div>
        )}

        {/* Vision */}
        {(s.vision_title || s.vision_text) && (
          <div className="bg-white rounded-2xl border border-orange-200 p-7 shadow-sm flex gap-5">
            <div className="bg-orange-100 p-3 rounded-xl h-fit shrink-0">
              <Eye size={22} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#7c2d00] mb-2"
                style={{ fontFamily: "'Georgia', serif" }}>{s.vision_title}</h2>
              <p className="text-orange-900/60 text-sm leading-relaxed">{s.vision_text}</p>
            </div>
          </div>
        )}

        {/* Team */}
        {s.team_title && (
          <div className="bg-white rounded-2xl border border-orange-200 p-7 shadow-sm text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Users size={22} className="text-orange-600" />
              </div>
            </div>
            <h2 className="text-xl font-black text-[#7c2d00] mb-1"
              style={{ fontFamily: "'Georgia', serif" }}>{s.team_title}</h2>
            <p className="text-orange-700/60 text-sm">{s.team_subtitle}</p>
          </div>
        )}

        {/* Extra dynamic sections (hamari_drishti, hamara_uddeshya, etc.) */}
        {extraSections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
            {sec.title && (
              <h2 className="text-lg font-black text-[#7c2d00] mb-2"
                style={{ fontFamily: "'Georgia', serif" }}>{sec.title}</h2>
            )}
            {sec.text && (
              <p className="text-orange-900/60 text-sm leading-relaxed">{sec.text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}