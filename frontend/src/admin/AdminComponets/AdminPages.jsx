import React, { useEffect, useState } from "react";
import {
  Pencil,
  FileText,
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { API } from "../../services/adminApi";
import RichTextEditor from "../../Components/RichTextEditor";

// Simple utility to strip HTML for preview
const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const extractRobustContent = (sections) => {
  if (!sections) return "";
  
  // If it's already an HTML string (new format starts with < or doesn't look like JSON)
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
    // Special handling for some common keys to maintain order if possible
    const priorityKeys = ["hero_title", "hero_subtitle", "hero_text", "mission_title", "mission_text", "vision_title", "vision_text"];
    
    priorityKeys.forEach(k => {
      if (parsed[k]) {
        if (k.includes("title")) html += `<h2>${parsed[k]}</h2>`;
        else html += `<p>${parsed[k]}</p>`;
      }
    });

    // Add remaining keys
    Object.keys(parsed).forEach(k => {
      if (!priorityKeys.includes(k) && parsed[k] && typeof parsed[k] === "string" && parsed[k].trim() !== "" && !k.includes("image_url")) {
        if (k.endsWith("_title")) html += `<h3>${parsed[k]}</h3>`;
        else html += `<p>${parsed[k]}</p>`;
      }
    });
    return html;
  }

  return String(sections);
};

const extractContentSnippet = (sections) => {
  const content = extractRobustContent(sections);
  return stripHtml(content);
};

// ─── Page Card ────────────────────────────────────────────────────────────────
const PageCard = ({ page, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const snippet = extractContentSnippet(page.sections);

  return (
    <div className="bg-[#131e32] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-6 flex flex-col transition-all hover:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800/40 bg-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <FileText size={20} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-base tracking-tight">{page.title}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 opacity-60">
              slug: {page.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(page)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all text-xs font-black shadow-lg shadow-orange-500/5 group"
          >
            <Pencil size={14} className="group-hover:scale-110 transition-transform" /> 
            Modify Page
          </button>
        </div>
      </div>

      {/* Preview Snippet */}
      <div className="px-8 py-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-orange-500/50 rounded-full" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Preview</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic font-medium">
          "{snippet || "No content yet..."}"
        </p>
      </div>

      {/* Metadata Footer */}
      {page.updated_at && (
        <div className="px-8 py-4 border-t border-slate-800/20 flex items-center justify-between text-[10px] font-bold text-slate-600">
          <span>
            Refined on {new Date(page.updated_at).toLocaleDateString("en-IN")}
          </span>
          {page.updated_by && (
            <span className="bg-slate-800/50 px-2 py-1 rounded-md">
              by {page.updated_by}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ page, onClose, onSaved }) => {
  const [pageTitle, setPageTitle] = useState(page.title);
  const [content, setContent] = useState(() => extractRobustContent(page.sections));
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Send content as a PLAIN STRING (no JSON object)
      const contentString = content;

      await API.put(`/pages/${page.slug}`, {
        title: pageTitle,
        sections: contentString,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("Error saving. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Edit — {page.title}
            </h2>
            <p className="text-slate-500 text-[11px] mt-0.5">/{page.slug}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
          {/* Page Title */}
          <div className="group">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] block mb-2 transition-colors group-focus-within:text-orange-500">
              Page Heading
            </label>
            <input
              type="text"
              value={pageTitle}
              placeholder="Enter page title..."
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full bg-[#131e32]/50 border-b-2 border-slate-800 text-white rounded-none px-0 py-3 text-2xl font-black outline-none focus:border-orange-500 transition-all placeholder:text-slate-700"
            />
          </div>

          {/* Single Content Editor */}
          <div>
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] block mb-4">
              Page Content (Rich Text)
            </label>
            <div className="bg-[#131e32] rounded-3xl border border-slate-800 overflow-hidden text-white w-full transition-all focus-within:border-orange-500/50 shadow-inner">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your page content here..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-8 py-6 border-t border-slate-800 shrink-0 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-orange-500/10 active:scale-95 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={18} /> Publish Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await API.get("/pages");
      const result = response.data;
      if (result?.success && Array.isArray(result.data)) {
        setPages(result.data);
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error("Fetch Pages Error:", err);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="min-h-screen p-2 md:p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-orange-500" /> Pages
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage About Us & Privacy Policy content
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#131e32] border border-slate-800 rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400 text-[11px] font-bold">
            {pages.length} Pages
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p className="text-slate-500 text-sm">Loading pages...</p>
        </div>
      ) : pages.length > 0 ? (
        pages.map((page) => (
          <PageCard key={page.id} page={page} onEdit={setEditPage} />
        ))
      ) : (
        <div className="bg-[#131e32] rounded-2xl border border-slate-800 py-16 text-center">
          <FileText size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-medium italic">No pages found.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editPage && (
        <EditModal
          page={editPage}
          onClose={() => setEditPage(null)}
          onSaved={fetchPages}
        />
      )}
    </div>
  );
};

export default AdminPages;