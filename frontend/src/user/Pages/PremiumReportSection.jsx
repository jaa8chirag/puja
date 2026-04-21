/**
 * PremiumReportSection.jsx
 * Import karo aur replace karo existing premium CTA block ko
 *
 * Usage:
 *   import { PremiumReportSection } from "./PremiumReportSection";
 *   <PremiumReportSection result={result} />
 */

import React, { useState } from "react";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function PremiumReportSection({ result }) {
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleDownload = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/name/pdf-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(result),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `Error ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(result?.name || "Report").replace(/\s+/g, "_")}_Numerology_Report.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setStatus("done");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (e) {
      setErrMsg(e.message);
      setStatus("error");
    }
  };

  return (
    <div className="mt-6 bg-gradient-to-br from-amber-900/60 to-stone-900/80 border border-amber-700/40 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">📜</div>
      <h3 className="text-amber-300 font-bold text-lg mb-1">Download Premium PDF Report</h3>
      <p className="text-stone-400 text-sm mb-4">6-page professional report with complete analysis</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-white mb-5 text-left max-w-sm mx-auto">
        {["✦ Cover Page with Grade Badge", "✦ Chaldean Analysis + Letter Map",
          "✦ Pythagorean Analysis", "✦ Compatibility Bar Charts",
          "✦ AI Personality Profile", "✦ Challenges & Remedies",
          "✦ Career Areas", "✦ Lucky Numbers, Colors & Days",
          "✦ Name Correction Suggestions", "✦ Final Advice & Summary Table",
        ].map(f => <span key={f}>{f}</span>)}
      </div>

      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {["📄 6 Pages", "🎨 Professional Design", "🔮 Chaldean", "📐 Pythagorean"].map(t => (
          <span key={t} className="text-xs bg-stone-900/60 border border-amber-800/40 text-amber-600/80 px-2.5 py-1 rounded-full">{t}</span>
        ))}
      </div>

      {status === "error" && (
        <div className="mb-3 bg-red-900/30 border border-red-700/40 text-red-300 text-xs rounded-xl px-4 py-2">
          ⚠️ {errMsg}
        </div>
      )}

      <button onClick={handleDownload} disabled={status === "loading"}
        className="px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
        style={{
          background: status === "loading" ? "linear-gradient(135deg,#44403c,#292524)"
            : status === "done" ? "linear-gradient(135deg,#059669,#047857)"
              : "linear-gradient(135deg,#d97706,#b45309)",
          boxShadow: status === "idle" ? "0 0 25px rgba(217,119,6,0.35)" : "none",
        }}>
        {status === "loading" ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full inline-block" />
            Generating PDF…
          </span>
        ) : status === "done" ? "✅ Downloaded!" : "⬇️ Download PDF Report"}
      </button>
      <p className="text-stone-700 text-xs mt-3">Free · Instant · No signup required</p>
    </div>
  );
}