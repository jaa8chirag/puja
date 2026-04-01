// import React, { useState } from "react";
// import { PremiumReportSection } from "./PremiumReportSection";
// import { jwtDecode } from "jwt-decode";
// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
// const API_URL = `${API_BASE_URL}/name/analyze`;
// const NAME_CORRECTION_URL = `${API_BASE_URL}/name/name-correction`;

// // ── Styling helpers ───────────────────────────────────────────

// // ── Main Component ────────────────────────────────────────────
// export default function NameCorrectionDummy() {
//   const [name, setName] = useState("");
//   const [dob, setDob] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);
//   const [error, setError] = useState("");
//   const token = localStorage.getItem("token");
//   const userId = jwtDecode(token)?.id;

//   const saveData = async () => {
//     setError("");
//     setResult(null);
//     if (!name.trim()) return setError("Please enter a name.");
//     if (!dob) return setError("Please enter date of birth.");
//     setLoading(true);
//     try {
//       const res = await fetch(NAME_CORRECTION_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ name, dob, userId }),
//       });
//       const data = await res.json();
//       if (!data.success) throw new Error(data.error || "Server error");
//     } catch (error) {
//       setError(error.message || "Failed to save data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen text-white"
//       style={{
//         background:
//           "radial-gradient(ellipse at 20% 10%,#1c1008 0%,#0e0a04 60%,#060402 100%)",
//       }}
//     >
//       {/* Stars */}

//       <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="text-5xl mb-4">🔢</div>
//           <h1
//             className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
//             style={{
//               background:
//                 "linear-gradient(135deg,#fbbf24,#f59e0b,#d97706,#92400e)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             Name Correction
//           </h1>
//           <p className="text-stone-500 text-sm tracking-widest uppercase mt-1">
//             Chaldean · Pythagorean · AI-Powered Analysis
//           </p>
//           <div className="flex justify-center gap-2 mt-4 flex-wrap">
//             {["🔮 Chaldean", "📐 Pythagorean", "✨ Smart Suggestions"].map(
//               (t) => (
//                 <span
//                   key={t}
//                   className="text-xs bg-stone-900/80 border border-stone-700/40 text-stone-500 px-3 py-1 rounded-full"
//                 >
//                   {t}
//                 </span>
//               ),
//             )}
//           </div>
//         </div>

//         {/* Form */}
//         <div className="bg-stone-900/60 border border-stone-700/40 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl backdrop-blur">
//           <h2 className="text-amber-400 font-semibold text-base mb-5 flex items-center gap-2">
//             <span className="w-6 h-6 rounded-full bg-amber-600/40 flex items-center justify-center text-xs font-bold">
//               1
//             </span>
//             Enter Details Dummy page
//           </h2>
//           <div className="space-y-4">
//             <div>
//               <label className="text-stone-500 text-xs uppercase tracking-wider mb-1.5 block">
//                 Full Name (as currently used)
//               </label>
//               <input
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 placeholder="e.g. Ramesh Kumar Sharma"
//                 className="w-full bg-black/30 border border-stone-700/50 rounded-xl px-4 py-3 text-white placeholder-stone-700 focus:outline-none focus:border-amber-500/60 transition-colors text-base"
//               />
//             </div>
//             <div className="md:w-1/2">
//               <label className="text-stone-500 text-xs uppercase tracking-wider mb-1.5 block">
//                 Date of Birth
//               </label>
//               <input
//                 type="date"
//                 value={dob}
//                 onChange={(e) => setDob(e.target.value)}
//                 className="w-full bg-black/30 border border-stone-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 text-sm">
//               ⚠️ {error}
//             </div>
//           )}

//           <button
//             onClick={saveData}
//             disabled={loading}
//             className="mt-6 w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all disabled:opacity-50"
//             style={{
//               background: loading
//                 ? "linear-gradient(135deg,#44403c,#292524)"
//                 : "linear-gradient(135deg,#d97706,#b45309,#92400e)",
//               boxShadow: loading ? "none" : "0 0 30px rgba(217,119,6,0.30)",
//             }}
//           >
//             {loading ? (
//               <span className="flex items-center justify-center gap-3">
//                 <span className="animate-spin inline-block w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full" />
//                 AI analyzing name numerology…
//               </span>
//             ) : (
//               "🔢 Analyze Name (AI-Powered)"
//             )}
//           </button>
//         </div>

//         {/* Results */}

//         <div className="text-center mt-14 text-stone-500 text-xs space-y-1">
//           <p>🔮 Chaldean · 📐 Pythagorean </p>
//           <p>For major decisions, consult a qualified numerologist.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const NAME_CORRECTION_URL = `${API_BASE_URL}/name/name-correction`;

export default function NameCorrectionDummy() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem("token");
  const userId = jwtDecode(token)?.id;

  const saveData = async () => {
    setError("");
    setSuccess(false);
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
        body: JSON.stringify({ name, dob, userId }), // ✅ camelCase matches backend
      });

      const data = await res.json();

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
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%,#1c1008 0%,#0e0a04 60%,#060402 100%)",
      }}
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔢</div>
          <h1
            className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
            style={{
              background:
                "linear-gradient(135deg,#fbbf24,#f59e0b,#d97706,#92400e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Name Correction
          </h1>
          <p className="text-stone-500 text-sm tracking-widest uppercase mt-1">
            Chaldean · Pythagorean · AI-Powered Analysis
          </p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {["🔮 Chaldean", "📐 Pythagorean", "✨ Smart Suggestions"].map(
              (t) => (
                <span
                  key={t}
                  className="text-xs bg-stone-900/80 border border-stone-700/40 text-stone-500 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-stone-900/60 border border-stone-700/40 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl backdrop-blur">
          <h2 className="text-amber-400 font-semibold text-base mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-600/40 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Enter Your Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-stone-500 text-xs uppercase tracking-wider mb-1.5 block">
                Full Name (as currently used)
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar Sharma"
                className="w-full bg-black/30 border border-stone-700/50 rounded-xl px-4 py-3 text-white placeholder-stone-700 focus:outline-none focus:border-amber-500/60 transition-colors text-base"
              />
            </div>
            <div className="md:w-1/2">
              <label className="text-stone-500 text-xs uppercase tracking-wider mb-1.5 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-black/30 border border-stone-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 transition-colors text-sm"
              />
            </div>
          </div>

          {/* ✅ Error Message */}
          {error && (
            <div className="mt-4 bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* ✅ Success Message */}
          {success && (
            <div className="mt-4 bg-green-900/30 border border-green-700/50 text-green-300 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              ✅ Request submitted successfully! We'll analyze your name soon.
            </div>
          )}

          <button
            onClick={saveData}
            disabled={loading}
            className="mt-6 w-full py-4 rounded-xl font-bold text-base tracking-wide transition-all disabled:opacity-50"
            style={{
              background: loading
                ? "linear-gradient(135deg,#44403c,#292524)"
                : "linear-gradient(135deg,#d97706,#b45309,#92400e)",
              boxShadow: loading ? "none" : "0 0 30px rgba(217,119,6,0.30)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-amber-300 border-t-transparent rounded-full" />
                Submitting…
              </span>
            ) : (
              "🔢 Analyze Name (AI-Powered)"
            )}
          </button>
        </div>

        <div className="text-center mt-14 text-stone-500 text-xs space-y-1">
          <p>🔮 Chaldean · 📐 Pythagorean</p>
          <p>For major decisions, consult a qualified numerologist.</p>
        </div>
      </div>
    </div>
  );
}
