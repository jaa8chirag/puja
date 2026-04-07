// // pages/PrivacyPolicy.jsx
// import React, { useEffect, useState } from "react";
// import { ShieldCheck } from "lucide-react";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// // DB ke flat object se dynamic sections nikalo
// // { section1_title, section1_text, kya_jaankari_title, kya_jaankari_text, ... }
// const extractSections = (s) => {
//   if (!s || typeof s !== "object") return [];

//   const keys = Object.keys(s);
//   const used = new Set();
//   const result = [];

//   // Pehle _title + _text pairs dhundo
//   keys.forEach((key) => {
//     if (used.has(key)) return;
//     if (key.endsWith("_title")) {
//       const base = key.replace(/_title$/, "");
//       const textKey = `${base}_text`;
//       if (keys.includes(textKey)) {
//         const title = s[key];
//         const text = s[textKey];
//         if (title || text) {
//           result.push({ title, text });
//         }
//         used.add(key);
//         used.add(textKey);
//       }
//     }
//   });

//   return result;
// };

// export default function PrivacyPolicy() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${API_BASE_URL}/pages/privacy-policy`)
//       .then((r) => r.json())
//       .then((d) => {
//         if (d.success) {
//           setData(
//             typeof d.data.sections === "string"
//               ? JSON.parse(d.data.sections)
//               : d.data.sections
//           );
//         }
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading)
//     return (
//       <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
//         <p className="text-orange-600 font-bold animate-pulse">Loading...</p>
//       </div>
//     );

//   const s = data || {};

//   // Array format (naya) ya flat object (purana) — dono handle
//   let sections = [];
//   if (Array.isArray(s)) {
//     // Naya dynamic format: [{ title, content }, ...]
//     sections = s
//       .map((item) => ({ title: item.title, text: item.content ?? item.text ?? "" }))
//       .filter((sec) => sec.title || sec.text);
//   } else {
//     // Purana flat format: { section1_title, section1_text, kya_jaankari_title, ... }
//     sections = extractSections(s);
//   }

//   // Standalone fields (sirf flat format mein hote hain)
//   const heroTitle = Array.isArray(s) ? "" : s.hero_title;
//   const heroSubtitle = Array.isArray(s) ? "" : s.hero_subtitle;
//   const lastUpdated = Array.isArray(s) ? "" : (s.last_updated ?? s.last_updated_text);
//   const introText = Array.isArray(s) ? "" : s.intro_text;

//   return (
//     <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
//       {/* Hero */}
//       <div className="max-w-3xl mx-auto px-4 py-8 text-center">
//         <div className="flex justify-center mb-4">
//           <div className="bg-orange-100 p-4 rounded-2xl">
//             <ShieldCheck size={32} className="text-orange-600" />
//           </div>
//         </div>
//         <h1
//           className="text-4xl font-black mb-3 text-[#7c2d00]"
//           style={{ fontFamily: "'Georgia', serif" }}
//         >
//           {heroTitle || "Privacy Policy"}
//         </h1>
//         <div className="flex items-center justify-center gap-3 mb-4">
//           <div
//             className="h-px w-16"
//             style={{ background: "linear-gradient(90deg, transparent, #d97706)" }}
//           />
//           <span className="text-orange-500 text-lg">🛕</span>
//           <div
//             className="h-px w-16"
//             style={{ background: "linear-gradient(90deg, #d97706, transparent)" }}
//           />
//         </div>
//         {heroSubtitle && (
//           <p className="text-orange-700/70 text-base font-medium mb-2">{heroSubtitle}</p>
//         )}
//         {lastUpdated && (
//           <p className="text-xs text-orange-500/50 font-medium">
//             Last Updated: {lastUpdated}
//           </p>
//         )}
//       </div>

//       <div className="max-w-3xl mx-auto px-4 pb-16 space-y-5">
//         {/* Intro */}
//         {introText && (
//           <div className="bg-orange-50 rounded-2xl border border-orange-200 p-6">
//             <p
//               className="text-[#3d1500]/70 text-sm leading-relaxed"
//               style={{ fontFamily: "'Georgia', serif" }}
//             >
//               {introText}
//             </p>
//           </div>
//         )}

//         {/* Dynamic Sections — kitne bhi ho sab render honge */}
//         {sections.map((sec, i) => (
//           <div
//             key={i}
//             className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm"
//           >
//             {sec.title && (
//               <div className="flex items-center gap-3 mb-3">
//                 <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black shrink-0">
//                   {i + 1}
//                 </span>
//                 <h2
//                   className="text-base font-black text-[#7c2d00]"
//                   style={{ fontFamily: "'Georgia', serif" }}
//                 >
//                   {sec.title}
//                 </h2>
//               </div>
//             )}
//             {sec.text && (
//               <p className={`text-[#3d1500]/65 text-sm leading-relaxed ${sec.title ? "ml-10" : ""}`}>
//                 {sec.text}
//               </p>
//             )}
//           </div>
//         ))}

//         {/* Koi data nahi */}
//         {sections.length === 0 && !introText && (
//           <div className="text-center py-16 text-orange-400/50 text-sm">
//             Content abhi available nahi hai.
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// pages/PrivacyPolicy.jsx
import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const extractSections = (s) => {
  if (!s || typeof s !== "object") return [];
  const keys = Object.keys(s);
  const used = new Set();
  const result = [];

  keys.forEach((key) => {
    if (used.has(key)) return;
    if (key.endsWith("_title")) {
      const base = key.replace(/_title$/, "");
      const textKey = `${base}_text`;
      if (keys.includes(textKey)) {
        const title = s[key];
        const text = s[textKey];
        if (title || text) {
          result.push({ title, text });
        }
        used.add(key);
        used.add(textKey);
      }
    }
  });
  return result;
};

export default function PrivacyPolicy() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/privacy-policy`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(
            typeof d.data.sections === "string"
              ? JSON.parse(d.data.sections)
              : d.data.sections,
          );
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

  const s = data || {};

  let sections = [];
  if (Array.isArray(s)) {
    sections = s
      .map((item) => ({
        title: item.title,
        text: item.content ?? item.text ?? "",
      }))
      .filter((sec) => sec.title || sec.text);
  } else {
    sections = extractSections(s);
  }

  const heroTitle = Array.isArray(s) ? "" : s.hero_title;
  const heroSubtitle = Array.isArray(s) ? "" : s.hero_subtitle;
  const lastUpdated = Array.isArray(s)
    ? ""
    : (s.last_updated ?? s.last_updated_text);
  const introText = Array.isArray(s) ? "" : s.intro_text;

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      {/* Hero */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-2xl">
            <ShieldCheck size={32} className="text-orange-600" />
          </div>
        </div>
        <h1
          className="text-4xl font-black mb-3 text-[#7c2d00]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {heroTitle || "Privacy Policy"}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="h-px w-16"
            style={{
              background: "linear-gradient(90deg, transparent, #d97706)",
            }}
          />
          <span className="text-orange-500 text-lg">🛕</span>
          <div
            className="h-px w-16"
            style={{
              background: "linear-gradient(90deg, #d97706, transparent)",
            }}
          />
        </div>
        {heroSubtitle && (
          <p className="text-orange-700/70 text-base font-medium mb-2">
            {heroSubtitle}
          </p>
        )}
        {lastUpdated && (
          <p className="text-xs text-orange-500/50 font-medium">
            Last Updated: {lastUpdated}
          </p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-10">
        {/* Intro - No Box */}
        {introText && (
          <div className="py-2">
            <p
              className="text-[#3d1500]/70 text-sm leading-relaxed"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {introText}
            </p>
          </div>
        )}

        {/* Dynamic Sections - No Box, No Border, No Shadow */}
        {sections.map((sec, i) => (
          <div key={i} className="py-2">
            {sec.title && (
              <div className="flex items-center gap-3 mb-3">
                <h2
                  className="text-base font-black text-[#7c2d00]"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {sec.title}
                </h2>
              </div>
            )}
            {sec.text && (
              <p className={`text-[#3d1500]/65 text-sm leading-relaxed`}>
                {sec.text}
              </p>
            )}
          </div>
        ))}

        {/* Empty State */}
        {sections.length === 0 && !introText && (
          <div className="text-center py-16 text-orange-400/50 text-sm">
            Content abhi available nahi hai.
          </div>
        )}
      </div>
    </div>
  );
}
