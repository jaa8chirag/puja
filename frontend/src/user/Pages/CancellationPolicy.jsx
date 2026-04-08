import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import HTMLContent from "../../Components/HTMLContent";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function CancellationPolicy() {
  const [data, setData] = useState(null);
  const [pageTitle, setPageTitle] = useState("Cancellation Policy");
  const [loading, setLoading] = useState(true);

  // Extract robust content from various formats (raw string, JSON object, array)
  const extractContent = (sections) => {
    if (!sections) return "";
    
    // If it's already an HTML string (new format)
    if (typeof sections === "string" && !sections.trim().startsWith("{") && !sections.trim().startsWith("[")) {
      return sections;
    }

    let parsed;
    try {
      parsed = typeof sections === "string" ? JSON.parse(sections) : sections;
    } catch {
      return String(sections);
    }

    // 1. New Format { content: "..." }
    if (parsed.content && typeof parsed.content === "string") {
      return parsed.content;
    }

    // 2. Intermediate Array Format [{ content: "..." }, ...]
    if (Array.isArray(parsed)) {
      return parsed.map(s => s.content || s.text || "").join("");
    }

    // 3. Legacy Key-Value Format { hero_text, mission_title, etc. }
    if (typeof parsed === "object") {
      let html = "";
      const priorityKeys = ["hero_title", "hero_subtitle", "hero_text", "mission_title", "mission_text", "vision_title", "vision_text", "intro_text"];
      
      priorityKeys.forEach(k => {
        if (parsed[k]) {
          if (k.includes("title")) html += `<h2>${parsed[k]}</h2>`;
          else html += `<p>${parsed[k]}</p>`;
        }
      });

      Object.keys(parsed).forEach(k => {
        if (!priorityKeys.includes(k) && parsed[k] && typeof parsed[k] === "string" && parsed[k].trim() !== "" && !k.includes("image_url") && !k.includes("last_updated")) {
          if (k.endsWith("_title")) html += `<h3>${parsed[k]}</h3>`;
          else if (k.endsWith("_text")) html += `<p>${parsed[k]}</p>`;
          else html += `<p>${parsed[k]}</p>`;
        }
      });
      return html;
    }

    return String(sections);
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/cancellation-policy`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPageTitle(d.data.title || "Cancellation Policy");
          setData(extractContent(d.data.sections));
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
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-24">
        {/* Minimalist Header */}
        <header className="mb-16 text-center">
          <h1
            className="text-3xl md:text-5xl font-black mb-6 text-[#3d1500] leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {pageTitle}
          </h1>
          <div className="h-1 w-16 bg-orange-600/20 mx-auto" />
        </header>

        {/* Premium Content Area */}
        {data ? (
          <div className="prose prose-orange max-w-none">
            <HTMLContent 
              content={data} 
              className="text-[#3d1500]/80 text-lg md:text-xl leading-relaxed space-y-8 font-serif" 
            />
          </div>
        ) : (
          <div className="py-20 text-center border-t border-orange-200/30">
            <p className="text-orange-900/30 text-sm tracking-widest uppercase font-bold">
              Fetching Sacred Content...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}