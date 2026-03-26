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

// ─── Field Label Map ──────────────────────────────────────────────────────────
const FIELD_LABELS = {
  // About Us
  hero_title: "Hero Title",
  hero_subtitle: "Hero Subtitle",
  hero_image_url: "Hero Image URL",
  mission_title: "Mission Title",
  mission_text: "Mission Text",
  vision_title: "Vision Title",
  vision_text: "Vision Text",
  team_title: "Team Title",
  team_subtitle: "Team Subtitle",
  stats_pujas: "Stats — Pujas",
  stats_devotees: "Stats — Devotees",
  stats_cities: "Stats — Cities",
  stats_pandits: "Stats — Pandits",
  // Privacy Policy
  last_updated: "Last Updated",
  intro_text: "Intro Text",
  section1_title: "Section 1 Title",
  section1_text: "Section 1 Text",
  section2_title: "Section 2 Title",
  section2_text: "Section 2 Text",
  section3_title: "Section 3 Title",
  section3_text: "Section 3 Text",
  section4_title: "Section 4 Title",
  section4_text: "Section 4 Text",
  section5_title: "Section 5 Title",
  section5_text: "Section 5 Text",
};

const isTextarea = (key) =>
  key.endsWith("_text") || key === "intro_text" || key === "hero_subtitle";

// ─── Page Card ────────────────────────────────────────────────────────────────
const PageCard = ({ page, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const sections = typeof page.sections === "string"
    ? JSON.parse(page.sections)
    : page.sections;

  const previewKeys = Object.keys(sections).slice(0, 3);

  return (
    <div className="bg-[#131e32] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl mb-4">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <FileText size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-white font-black text-sm tracking-tight">{page.title}</h2>
            <p className="text-slate-500 text-[11px] font-medium mt-0.5">/{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={() => onEdit(page)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-bold"
          >
            <Pencil size={13} /> Edit
          </button>
        </div>
      </div>

      {/* Preview (always visible) */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {previewKeys.map((key) => (
          <div key={key} className="bg-[#0f172a] rounded-xl px-4 py-3 border border-slate-800/50">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
              {FIELD_LABELS[key] || key}
            </p>
            <p className="text-slate-300 text-xs font-medium truncate">
              {sections[key] || <span className="text-slate-600 italic">Empty</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Expanded — All Fields */}
      {expanded && (
        <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/40 pt-4">
          {Object.keys(sections)
            .slice(3)
            .map((key) => (
              <div key={key} className="bg-[#0f172a] rounded-xl px-4 py-3 border border-slate-800/50">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                  {FIELD_LABELS[key] || key}
                </p>
                <p className="text-slate-300 text-xs font-medium line-clamp-2">
                  {sections[key] || <span className="text-slate-600 italic">Empty</span>}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Footer */}
      {page.updated_at && (
        <div className="px-6 py-3 border-t border-slate-800/40 flex items-center justify-between">
          <p className="text-slate-600 text-[11px]">
            Last updated:{" "}
            <span className="text-slate-500">
              {new Date(page.updated_at).toLocaleString("en-IN")}
            </span>
          </p>
          {page.updated_by && (
            <p className="text-slate-600 text-[11px]">
              by <span className="text-slate-500">{page.updated_by}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ page, onClose, onSaved }) => {
  const parsedSections =
    typeof page.sections === "string"
      ? JSON.parse(page.sections)
      : page.sections;

  const [title, setTitle] = useState(page.title);
  const [sections, setSections] = useState({ ...parsedSections });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setSections((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.put(`/pages/${page.slug}`, { title, sections });
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
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
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
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Page Title */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-wider">
              Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">Sections</p>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Section Fields */}
          {Object.keys(sections).map((key) => (
            <div key={key}>
              <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-wider">
                {FIELD_LABELS[key] || key}
              </label>
              {isTextarea(key) ? (
                <textarea
                  rows={3}
                  value={sections[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={sections[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1"
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-6 py-5 border-t border-slate-800">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={15} /> Save Changes
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
      if (result && result.success && Array.isArray(result.data)) {
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