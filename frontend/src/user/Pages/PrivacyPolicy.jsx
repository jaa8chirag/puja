import React, { useEffect, useState } from "react";
import HTMLContent from "../../Components/HTMLContent";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function PrivacyPolicy() {
  const [data, setData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Privacy Policy");
  const [loading, setLoading] = useState(true);

  const extractSections = (sections) => {
    if (!sections) return [];

    let parsed;
    try {
      parsed = typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      return [{ title: "", content: String(sections) }];
    }

    if (Array.isArray(parsed)) {
      return parsed.map(s => ({
        title: (s.title || s.heading || "").replace(/\u00A0/g, " "),
        content: (s.content || s.text || "").replace(/\u00A0/g, " ")
      }));
    }

    if (parsed.content && typeof parsed.content === "string") {
      return [{ title: "", content: parsed.content.replace(/\u00A0/g, " ") }];
    }

    if (typeof parsed === "object") {
      const sectionsArray = [];
      const priorityKeys = ["hero_title", "hero_subtitle", "hero_text", "mission_title", "mission_text", "vision_title", "vision_text", "intro_text"];

      let currentSection = { title: "", content: "" };

      priorityKeys.forEach(k => {
        if (parsed[k]) {
          if (k.includes("title")) {
            if (currentSection.content) sectionsArray.push(currentSection);
            currentSection = { title: parsed[k], content: "" };
          } else {
            currentSection.content += parsed[k];
          }
        }
      });

      Object.keys(parsed).forEach(k => {
        if (!priorityKeys.includes(k) && parsed[k] && typeof parsed[k] === "string" && parsed[k].trim() !== "" && !k.includes("image_url") && !k.includes("last_updated")) {
          if (k.endsWith("_title")) {
            if (currentSection.content) sectionsArray.push(currentSection);
            currentSection = { title: parsed[k], content: "" };
          } else {
            currentSection.content += ` ${parsed[k]}`;
          }
        }
      });

      if (currentSection.content || currentSection.title) sectionsArray.push(currentSection);
      return sectionsArray;
    }

    return [{ title: "", content: String(sections).replace(/\u00A0/g, " ") }];
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/privacy-policy`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPageTitle(d.data.title || "Privacy Policy");
          setData(extractSections(d.data.sections));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">

        {/* Top Icon */}
        <div className="mb-2">
          <span className="text-orange-500 text-2xl">ॐ</span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#3d1500] text-center mb-4">
          {pageTitle}
        </h1>

        {/* Divider icon */}
        <div className="flex items-center gap-4 mb-12 w-full max-w-md justify-center">
          <div className="h-[1px] bg-orange-200 flex-grow"></div>
          <div className="w-2 h-2 bg-orange-800 rotate-45"></div>
          <div className="h-[1px] bg-orange-200 flex-grow"></div>
        </div>

        {/* Small Boxes (Cards) */}
        <div className="grid grid-cols-1 gap-8 w-full max-w-2xl">
          {data && data.length > 0 ? (
            data.map((section, idx) => (
              <div
                key={idx}
                className="bg-white p-6 md:p-8 rounded-[1.5rem] border border-orange-100 shadow-[0_4px_15px_-5px_rgba(251,146,60,0.1)] transition-all"
              >
                {section.title && (
                  <h3 className="text-xl font-serif font-bold text-[#3d1500] mb-3">
                    {section.title}
                  </h3>
                )}
                <div className="w-full">
                  <HTMLContent
                    content={section.content}
                    className="text-[#3d1500]/80 text-[15px] leading-relaxed font-sans"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center opacity-30">
              <p className="text-sm tracking-widest uppercase font-bold">
                Fetching Sacred Content...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


