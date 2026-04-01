import React, { useEffect, useState } from "react";
import {
  Pencil,
  FileText,
  Loader2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import { API } from "../../services/adminApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isTextarea = (key) =>
  key.toLowerCase().includes("text") ||
  key.toLowerCase().includes("content") ||
  key.toLowerCase().includes("subtitle") ||
  key.toLowerCase().includes("intro") ||
  key.toLowerCase().includes("description");

const formatKey = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Sections object → ordered array of { key, title, content }
const sectionsToArray = (sections) => {
  if (!sections) return [];

  let parsed;
  try {
    parsed = typeof sections === "string" ? JSON.parse(sections) : sections;
  } catch {
    return [];
  }

  // Array format — normalize each item to ensure title & content exist
  if (Array.isArray(parsed)) {
    return parsed.map((item, i) => ({
      key: item.key || `section_${i}`,
      title: item.title ?? item.label ?? formatKey(item.key || `section_${i}`),
      content: item.content ?? item.text ?? item.value ?? "",
      _paired: item._paired ?? true,
    }));
  }

  // Flat object format — pair _title + _text keys
  const keys = Object.keys(parsed);
  const result = [];
  const used = new Set();

  keys.forEach((key) => {
    if (used.has(key)) return;

    if (key.endsWith("_title")) {
      const base = key.replace(/_title$/, "");
      const textKey = `${base}_text`;
      if (keys.includes(textKey)) {
        result.push({
          key: base,
          title: parsed[key] || "",
          content: parsed[textKey] || "",
          _paired: true,
        });
        used.add(key);
        used.add(textKey);
        return;
      }
    }

    if (!used.has(key)) {
      result.push({
        key,
        title: formatKey(key),
        content: String(parsed[key] ?? ""),
        _paired: false,
      });
      used.add(key);
    }
  });

  return result;
};

// Array back to flat object for API
const arrayToSections = (arr) => {
  const obj = {};
  arr.forEach((item) => {
    // If this item was originally a paired title+text
    if (item._paired) {
      obj[`${item.key}_title`] = item.title;
      obj[`${item.key}_text`] = item.content;
    } else {
      obj[item.key] = item.content;
    }
  });
  return obj;
};

// ─── Page Card ────────────────────────────────────────────────────────────────
const PageCard = ({ page, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  const sections = sectionsToArray(page.sections);
  const previewSections = sections.slice(0, 3);

  return (
    <div className="bg-[#131e32] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl mb-4">
      {/* Header */}
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

      {/* Preview */}
      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {previewSections.map((sec, i) => (
          <div key={i} className="bg-[#0f172a] rounded-xl px-4 py-3 border border-slate-800/50">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
              {sec.title || sec.key || `Section ${i + 1}`}
            </p>
            {sec.content ? (
              <p className="text-slate-300 text-xs font-medium truncate">{sec.content}</p>
            ) : (
              <p className="text-slate-600 text-xs italic">Empty</p>
            )}
          </div>
        ))}
      </div>

      {/* Expanded */}
      {expanded && sections.length > 3 && (
        <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-800/40 pt-4">
          {sections.slice(3).map((sec, i) => (
            <div key={i} className="bg-[#0f172a] rounded-xl px-4 py-3 border border-slate-800/50">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">
                {sec.title || sec.key || `Section ${i + 4}`}
              </p>
              {sec.content ? (
                <p className="text-slate-300 text-xs font-medium line-clamp-2">{sec.content}</p>
              ) : (
                <p className="text-slate-600 text-xs italic">Empty</p>
              )}
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

// ─── Section Row in Modal ─────────────────────────────────────────────────────
const SectionRow = ({ section, index, onChange, onDelete, isLast }) => {
  return (
    <div className="bg-[#0a1120] border border-slate-800 rounded-2xl overflow-hidden">
      {/* Section Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/30 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-slate-600" />
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            Section {index + 1}
          </span>
        </div>
        <button
          onClick={() => onDelete(index)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
          title="Delete section"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Fields */}
      <div className="px-4 py-4 space-y-3">
        {/* Title */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
            Title / Label
          </label>
          <input
            type="text"
            value={section.title}
            placeholder="Section ka title likho..."
            onChange={(e) => onChange(index, "title", e.target.value)}
            className="w-full bg-[#131e32] border border-slate-700/60 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-all placeholder:text-slate-700"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
            Content
          </label>
          <textarea
            rows={3}
            value={section.content}
            placeholder="Content likho..."
            onChange={(e) => onChange(index, "content", e.target.value)}
            className="w-full bg-[#131e32] border border-slate-700/60 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-all resize-none placeholder:text-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────
const EditModal = ({ page, onClose, onSaved }) => {
  const [pageTitle, setPageTitle] = useState(page.title);
  const [sections, setSections] = useState(() => {
    const arr = sectionsToArray(page.sections);
    // Mark paired items so we can reconstruct correctly
    return arr.map((s) => ({ ...s, _paired: s._paired ?? !!s.key }));
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (index, field, value) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleAdd = () => {
    setSections((prev) => [
      ...prev,
      {
        key: `section_${Date.now()}`,
        title: "",
        content: "",
        _paired: true,
      },
    ]);
  };

  const handleDelete = (index) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Save as clean array — simple, no key mangling, frontend reads directly
      const sectionsArr = sections.map((sec) => ({
        title: sec.title || "",
        content: sec.content || "",
      }));

      await API.put(`/pages/${page.slug}`, {
        title: pageTitle,
        sections: sectionsArr,
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
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
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
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Page Title */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
              Page Title
            </label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
              Sections ({sections.length})
            </p>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Section Rows */}
          {sections.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-sm italic">
              Koi section nahi hai. Neeche "+ Add Section" click karo.
            </div>
          )}

          {sections.map((sec, i) => (
            <SectionRow
              key={sec.key + i}
              section={sec}
              index={i}
              onChange={handleChange}
              onDelete={handleDelete}
              isLast={i === sections.length - 1}
            />
          ))}

          {/* Add Section Button */}
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-700 text-slate-500 hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5 transition-all text-sm font-bold"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-60"
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