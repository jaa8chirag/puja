// pages/PrivacyPolicy.jsx
import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function PrivacyPolicy() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/privacy-policy`)
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

  // Sections array — jo bhi filled ho render karo
  const sections = [
    { title: s.section1_title, text: s.section1_text },
    { title: s.section2_title, text: s.section2_text },
    { title: s.section3_title, text: s.section3_text },
    { title: s.section4_title, text: s.section4_text },
    { title: s.section5_title, text: s.section5_text },
  ].filter(sec => sec.title || sec.text);

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e8892200, #e88922 30%, #f59e0b 50%, #e88922 70%, #e8892200)' }} />

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 py-14 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-2xl">
            <ShieldCheck size={32} className="text-orange-600" />
          </div>
        </div>
        <h1 className="text-4xl font-black mb-3 text-[#7c2d00]"
          style={{ fontFamily: "'Georgia', serif" }}>
          {s.hero_title || "Privacy Policy"}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d97706)' }} />
          <span className="text-orange-500 text-lg">🛕</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #d97706, transparent)' }} />
        </div>
        <p className="text-orange-700/70 text-base font-medium mb-2">{s.hero_subtitle}</p>
        {s.last_updated && (
          <p className="text-xs text-orange-500/50 font-medium">Last Updated: {s.last_updated}</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-5">

        {/* Intro */}
        {s.intro_text && (
          <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
            <p className="text-[#3d1500]/70 text-sm leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
              {s.intro_text}
            </p>
          </div>
        )}

        {/* Sections */}
        {sections.map((sec, i) => (
          <div key={i} className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0">
                {i + 1}
              </span>
              <h2 className="text-base font-black text-[#7c2d00]" style={{ fontFamily: "'Georgia', serif" }}>
                {sec.title}
              </h2>
            </div>
            <p className="text-[#3d1500]/65 text-sm leading-relaxed ml-10">
              {sec.text}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}