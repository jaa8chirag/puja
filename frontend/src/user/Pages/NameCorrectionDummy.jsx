import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const NAME_CORRECTION_URL = `${API_BASE_URL}/name/name-correction`;

export default function NameCorrectionDummy() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const token = localStorage.getItem("token");
  const userId = jwtDecode(token)?.id;

  const saveData = async () => {
    setError("");
    setSuccess(false);
    setLimitReached(false);
    if (!name.trim()) return setError("Please enter a name.");
    if (!dob) return setError("Please enter date of birth.");
    setLoading(true);

    try {
      const res = await fetch(NAME_CORRECTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, dob, userId }),
      });

      const data = await res.json();

      if (data.limitReached) {
        setLimitReached(true);
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server error");
      }

      setSuccess(true);
      setName("");
      setDob("");
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Limit Reached — Premium UI */}
        {limitReached ? (
          <div className="relative bg-white border border-orange-200 rounded-[2rem] p-8 md:p-12 mb-8 shadow-[0_20px_50px_rgba(217,119,6,0.1)] text-center overflow-hidden">
            {/* Background Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-6 text-4xl">
                ✨
              </div>

              <h2 className="text-[#7c2d00] font-black text-3xl mb-3" style={{ fontFamily: "'Georgia', serif" }}>
                Complete a Puja to Unlock
              </h2>

              <div className="max-w-md mx-auto">
                <p className="text-amber-800 font-medium text-lg leading-relaxed mb-2">
                  One Name Correction session is included with every completed puja.
                </p>
                <p className="text-orange-600/70 text-sm mb-8">
                  To continue using our AI-powered analysis, simply book or complete a puja service. This ensures your spiritual and numerological journey remains perfectly aligned.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://wa.me/919771157571"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-green-200 active:scale-95"
                >
                  <FaWhatsapp size={22} className="group-hover:rotate-12 transition-transform" />
                  <span>Talk to Our Expert</span>
                </a>
              </div>

              <button
                onClick={() => setLimitReached(false)}
                className="mt-8 text-amber-500 hover:text-amber-700 text-[13px] font-bold uppercase tracking-widest transition-colors"
              >
                ← Return to Page
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="bg-white border border-amber-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
            <h2 className="text-amber-700 font-semibold text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
                1
              </span>
              Enter Your Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-amber-600 text-xs uppercase tracking-wider mb-1.5 block">
                  Full Name (as currently used)
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar Sharma"
                  className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 placeholder:text-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-base"
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

            {/* Error Message */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                ✅ Request submitted successfully! We'll analyze your name soon.
              </div>
            )}

            <button
              onClick={saveData}
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
                  Submitting…
                </span>
              ) : (
                "🔢 Analyze Name (AI-Powered)"
              )}
            </button>
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