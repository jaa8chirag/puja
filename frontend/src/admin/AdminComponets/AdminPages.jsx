import React, { useEffect, useState } from "react";
import {
  Pencil,
  FileText,
  Loader2,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { API } from "../../services/adminApi";
import RichTextEditor from "../../Components/RichTextEditor";

// Simple utility to strip HTML for preview
const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const parseSections = (sections) => {
  if (!sections) return [{ title: "", content: "" }];

  try {
    const parsed = typeof sections === "string" ? JSON.parse(sections) : sections;
    if (Array.isArray(parsed)) {
      return parsed.map(s => ({
        title: s.title || s.heading || "",
        content: s.content || s.text || ""
      }));
    }
    if (parsed.content && typeof parsed.content === "string") {
      return [{ title: "", content: parsed.content }];
    }
    // Handle key-value legacy
    if (typeof parsed === "object") {
      const arr = [];
      Object.keys(parsed).forEach(k => {
        if (typeof parsed[k] === "string" && !k.includes("image_url")) {
          arr.push({ title: k, content: parsed[k] });
        }
      });
      return arr.length > 0 ? arr : [{ title: "", content: "" }];
    }
  } catch {
    return [{ title: "", content: String(sections) }];
  }
  return [{ title: "", content: "" }];
};

const extractContentSnippet = (sections) => {
  const parsed = parseSections(sections);
  return stripHtml(parsed.map(p => p.content).join(" "));
};

// ─── Page Card ────────────────────────────────────────────────────────────────
const PageCard = ({ page, onEdit }) => {
  const snippet = extractContentSnippet(page.sections);

  return (
    <div className="bg-[#131e32] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl mb-6 flex flex-col transition-all hover:border-slate-700">
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
            Edit Boxes
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-3 bg-orange-500/50 rounded-full" />
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Preview</span>
        </div>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 italic font-medium">
          "{snippet || "No content yet..."}"
        </p>
      </div>

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

// ─── Edit Modal (Multi-Box Support) ───────────────────────────────────────────────
const EditModal = ({ page, onClose, onSaved }) => {
  const [pageTitle, setPageTitle] = useState(page.title);
  const [sections, setSections] = useState(() => parseSections(page.sections));
  const [submitting, setSubmitting] = useState(false);

  const handleAddSection = () => {
    setSections([...sections, { title: "", content: "" }]);
  };

  const handleRemoveSection = (idx) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleUpdateSection = (idx, field, value) => {
    const newSections = [...sections];
    newSections[idx][field] = value;
    setSections(newSections);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const sectionsJson = JSON.stringify(sections);
      await API.put(`/pages/${page.slug}`, {
        title: pageTitle,
        sections: sectionsJson,
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("Error saving boxes.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Manage Boxes — {page.title}
            </h2>
            <p className="text-slate-500 text-[11px] mt-0.5">/{page.slug}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-10 custom-scrollbar">
          <div className="group">
            <label className="text-[11px] uppercase font-black text-slate-500 tracking-[0.2em] block mb-2">Main Page Heading</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className="w-full bg-[#131e32]/50 border-b-2 border-slate-800 text-white rounded-none px-0 py-3 text-2xl font-black outline-none focus:border-orange-500 transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <label className="text-[12px] uppercase font-black text-orange-500 tracking-[0.2em]">Content Boxes ({sections.length})</label>
              <button onClick={handleAddSection} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest">
                <Plus size={14} /> Add New Box
              </button>
            </div>

            {sections.map((section, idx) => (
              <div key={idx} className="relative bg-[#131e32]/30 p-6 rounded-[2rem] border border-slate-800">
                <button onClick={() => handleRemoveSection(idx)} className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all shadow-lg">
                  <Trash2 size={16} />
                </button>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-600 mb-2 block tracking-widest">Box Title</label>
                    <input
                      type="text"
                      value={section.title}
                      placeholder="Box heading"
                      onChange={(e) => handleUpdateSection(idx, "title", e.target.value)}
                      className="w-full bg-transparent border-b border-slate-800 text-white py-2 focus:border-orange-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-600 mb-2 block tracking-widest">Box Content</label>
                    <div className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden text-white">
                      <RichTextEditor value={section.content} onChange={(val) => handleUpdateSection(idx, "content", val)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 px-8 py-6 border-t border-slate-800 shrink-0 bg-slate-900/50">
          <button onClick={onClose} className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all disabled:opacity-60">
            {submitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Save All Boxes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Create Page Modal ────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSaved }) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !slug) return alert("Title and Slug required!");
    setSubmitting(true);
    try {
      await API.post("/pages", {
        title,
        slug,
        sections: JSON.stringify([{ title: "Welcome", content: "New page content..." }]),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error("Create Error:", err);
      alert("Error creating page.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">New Page</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Page Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#131e32] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all font-bold" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Slug</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/ /g, "-"))} className="w-full bg-[#131e32] border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-orange-500 transition-all font-mono text-sm" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-800 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : <><Plus size={16} /> Create</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPage, setEditPage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await API.get("/pages");
      if (response.data?.success) setPages(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return (
    <div className="min-h-screen p-2 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-orange-500" /> Dynamic Page Boxes
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">Manage About Us & Policies</p>
        </div>
        <div className="flex items-center gap-4">

          <div className="bg-[#131e32] border border-slate-800 rounded-xl px-4 py-2">
            <span className="text-slate-400 text-[11px] font-bold">{pages.length} Pages</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((page) => <PageCard key={page.id} page={page} onEdit={setEditPage} />)}
        </div>
      )}

      {editPage && <EditModal page={editPage} onClose={() => setEditPage(null)} onSaved={fetchPages} />}
      {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} onSaved={fetchPages} />}
    </div>
  );
};

export default AdminPages;