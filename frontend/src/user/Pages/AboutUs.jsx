// pages/AboutUs.jsx
import React, { useEffect, useState } from "react";
import { Users, Target, Eye, MapPin } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function AboutUs() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/about-us`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(
          typeof d.page.sections === "string"
            ? JSON.parse(d.page.sections)
            : d.page.sections
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
      <p className="text-orange-600 font-bold animate-pulse">Loading...</p>
    </div>
  );

  const s = data || {};

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e8892200, #e88922 30%, #f59e0b 50%, #e88922 70%, #e8892200)' }} />

      {/* Hero */}
      <div className="relative overflow-hidden">
        {s.hero_image_url && (
          <img src={s.hero_image_url} alt="About"
            className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-orange-500/60 text-[10px] tracking-[0.4em] uppercase mb-3 font-bold">ॐ</p>
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#7c2d00]"
            style={{ fontFamily: "'Georgia', serif" }}>
            {s.hero_title || "About Us"}
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d97706)' }} />
            <span className="text-orange-500 text-lg">🛕</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #d97706, transparent)' }} />
          </div>
          <p className="text-orange-700/70 text-lg font-medium max-w-xl mx-auto">
            {s.hero_subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { val: s.stats_pujas,    label: "Pujas" },
            { val: s.stats_devotees, label: "Devotees" },
            { val: s.stats_cities,   label: "Cities" },
            { val: s.stats_pandits,  label: "Pandits" },
          ].map((st, i) => st.val && (
            <div key={i} className="bg-white rounded-2xl border border-orange-200 p-5 text-center shadow-sm">
              <p className="text-3xl font-black text-orange-600" style={{ fontFamily: "'Georgia', serif" }}>{st.val}</p>
              <p className="text-xs font-bold text-orange-700/60 uppercase tracking-wider mt-1">{st.label}</p>
            </div>
          ))}
        </div>

        {/* Mission */}
        {(s.mission_title || s.mission_text) && (
          <div className="bg-white rounded-2xl border border-orange-200 p-7 shadow-sm flex gap-5">
            <div className="bg-orange-100 p-3 rounded-xl h-fit shrink-0">
              <Target size={22} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#7c2d00] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                {s.mission_title}
              </h2>
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
              <h2 className="text-xl font-black text-[#7c2d00] mb-2" style={{ fontFamily: "'Georgia', serif" }}>
                {s.vision_title}
              </h2>
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
            <h2 className="text-xl font-black text-[#7c2d00] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              {s.team_title}
            </h2>
            <p className="text-orange-700/60 text-sm">{s.team_subtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}