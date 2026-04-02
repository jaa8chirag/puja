import { useState, useEffect, useRef } from "react";
import { View, EyeOff, Code2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const CATEGORIES = ["Jyotish", "Vastu", "Puja Vidhi", "Rashifal", "Upay"];
const EMPTY_FORM = {
  title: "", excerpt: "", content: "", category: "",
  tag: "", author: "", read_time: "5 min", status: "draft",
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/")) return `http://localhost:5000${url}`;
  return `http://localhost:5000/api/uploads/${url}`;
};

// ─── Stat Tile (same as GodTile) ─────────────────────────────
const StatTile = ({ icon, value, label, iconBg }) => (
  <div className="bg-[#161b27] border border-white/[0.06] rounded-xl p-4 md:p-5 flex flex-col gap-2.5 hover:border-white/[0.12] transition-colors"
    style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: iconBg }}>
      {icon}
    </div>
    <div className="text-gray-50 text-xl md:text-2xl font-bold">{value}</div>
    <div className="text-gray-500 text-xs">{label}</div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────
const Adminblogs = () => {
  const [blogs, setBlogs]               = useState([]);
  const [stats, setStats]               = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage]                 = useState(1);
  const [total, setTotal]               = useState(0);
  const [modal, setModal]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [formError, setFormError]       = useState("");
  const fileRef = useRef(null);
  const LIMIT = 10;

  // ── Fetch ──────────────────────────────────────────────────
  const fetchBlogs = async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search)       params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      const res  = await fetch(`${API_BASE_URL}/admin/blogs?${params}`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
      setStats(data.stats || {});
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, [page, filterStatus]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchBlogs(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  // ── Modals ─────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null);
    setFormError(""); setModal("create");
  };

  const openEdit = async (blog) => {
    setFormError("");
    try {
      const res  = await fetch(`${API_BASE_URL}/admin/blogs/${blog.id}`, { headers: authHeaders() });
      const data = await res.json();
      const b = data.blog;
      setForm({
        title: b.title || "", excerpt: b.excerpt || "", content: b.content || "",
        category: b.category || "", tag: b.tag || "", author: b.author || "",
        read_time: b.read_time || "5 min", status: b.status || "draft",
      });
      setImagePreview(b.image_url ? buildImageUrl(b.image_url) : null);
      setImageFile(null); setSelected(b); setModal("edit");
    } catch { alert("Blog load nahi ho saka"); }
  };

  const openDelete = (blog) => { setSelected(blog); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim())   return setFormError("Title zaroori hai");
    if (!form.content.trim()) return setFormError("Content zaroori hai");
    setSaving(true); setFormError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      const url    = modal === "create" ? `${API_BASE_URL}/admin/blogs` : `${API_BASE_URL}/admin/blogs/${selected.id}`;
      const method = modal === "create" ? "POST" : "PUT";
      const res    = await fetch(url, { method, headers: authHeaders(), body: fd });
      const data   = await res.json();
      if (!data.success) throw new Error(data.error);
      closeModal(); fetchBlogs();
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/admin/blogs/${selected.id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      closeModal(); fetchBlogs();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  // ── Toggle status ──────────────────────────────────────────
  const handleToggleStatus = async (blog) => {
    try {
      const res  = await fetch(`${API_BASE_URL}/admin/blogs/${blog.id}/status`, { method: "PATCH", headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      fetchBlogs();
    } catch (e) { alert(e.message); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <View className="text-orange-500" /> Contributions
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">Manage donation types & pricing</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
          + Naya Blog
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatTile icon="📝" iconBg="rgba(249,115,22,0.2)"  value={stats.total       || 0} label="Total Blogs"  />
        <StatTile icon="✅" iconBg="rgba(34,197,94,0.2)"   value={stats.published   || 0} label="Published"    />
        <StatTile icon="🗂" iconBg="rgba(234,179,8,0.2)"   value={stats.drafts      || 0} label="Drafts"       />
        <StatTile icon="👁" iconBg="rgba(59,130,246,0.2)"  value={stats.total_views || 0} label="Total Views"  />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search Blogs..."
          className="bg-[#161b27] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 w-64"
        />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          className="bg-[#161b27] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-orange-500/50">
          <option value="">Sab Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">⚠️ {error}</div>
      )}

      {/* ── Table ── */}
      <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full inline-block" />
            <span className="text-gray-500 text-sm">Loading...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-gray-500 text-sm">No blogs found.</p>
            <button onClick={openCreate} className="mt-3 text-orange-400 text-sm hover:underline bg-transparent border-none cursor-pointer">
              Create your first blog.
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Blog", "Category", "Author", "Status", "Views", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">

                    {/* Blog */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-orange-900/20 shrink-0 flex items-center justify-center">
                          {buildImageUrl(blog.image_url)
                            ? <img src={buildImageUrl(blog.image_url)} alt="" className="w-full h-full object-cover" />
                            : <span className="text-base">🛕</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-100 font-medium text-[13px] truncate max-w-[200px]">{blog.title}</p>
                          <p className="text-gray-600 text-xs">{blog.read_time}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      {blog.category && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {blog.category}
                        </span>
                      )}
                    </td>

                    {/* Author */}
                    <td className="px-4 py-3 text-gray-500 text-[13px]">{blog.author || "—"}</td>

                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleStatus(blog)}
                        className={`text-[11px] font-semibold px-3 py-1 rounded-full border cursor-pointer transition-all hover:opacity-80
                          ${blog.status === "published"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                        {blog.status === "published" ? "✅ Published" : "📝 Draft"}
                      </button>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-gray-500 text-[13px]">👁 {blog.views || 0}</td>

                    {/* Date */}
                    <td className="px-4 py-3 text-gray-500 text-[13px]">
                      {new Date(blog.created_at).toLocaleDateString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(blog)}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border-none cursor-pointer text-xs"
                          title="Edit">✏️
                        </button>
                        <button onClick={() => openDelete(blog)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border-none cursor-pointer text-xs"
                          title="Delete">🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-gray-600 text-xs">{total} blogs · Page {page}/{totalPages}</p>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 rounded-lg text-xs bg-white/[0.04] text-gray-400 disabled:opacity-30 hover:bg-white/[0.08] border-none cursor-pointer">
                ←
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-xs border-none cursor-pointer transition-all
                    ${page === i + 1 ? "text-white font-semibold" : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"}`}
                  style={page === i + 1 ? { background: "linear-gradient(135deg,#f97316,#ea580c)" } : {}}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg text-xs bg-white/[0.04] text-gray-400 disabled:opacity-30 hover:bg-white/[0.08] border-none cursor-pointer">
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════
          CREATE / EDIT MODAL
      ══════════════════════════════════ */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 overflow-y-auto py-6 px-4">
          <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl w-full max-w-2xl shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-gray-100 font-bold text-lg m-0">
                {modal === "create" ? "+ Naya Blog" : "✏️ Blog Edit"}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-200 text-xl bg-transparent border-none cursor-pointer leading-none">✕</button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-red-400 text-sm">⚠️ {formError}</div>
              )}

              {/* Title */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Blog ka title..."
                  className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50"/>
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  rows={2} placeholder="2-3 line mein blog ka summary..."
                  className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50 resize-none"/>
              </div>

              {/* Content */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">
                  Content * <span className="normal-case text-gray-600 font-normal">(## Heading · - Bullet · 1. Number)</span>
                </label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  rows={10} placeholder={"## Pehla Heading\n\nYahan content likhein...\n\n- Point 1\n- Point 2"}
                  className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50 resize-y font-mono"/>
              </div>

              {/* Category + Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50">
                    <option value="">Select...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Tag</label>
                  <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                    placeholder="e.g. Dosha, Upay"
                    className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50"/>
                </div>
              </div>

              {/* Author + Read Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                    placeholder="Pt. Ramesh Sharma"
                    className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50"/>
                </div>
                <div>
                  <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Read Time</label>
                  <input value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: e.target.value }))}
                    placeholder="5 min"
                    className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-orange-500/50"/>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Status</label>
                <div className="flex gap-3">
                  {["draft", "published"].map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all
                        ${form.status === s
                          ? s === "published"
                            ? "bg-green-500/20 border-green-500/40 text-green-400"
                            : "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                          : "bg-white/[0.04] border-white/[0.08] text-gray-500 hover:border-white/20"}`}>
                      {s === "published" ? "✅ Published" : "📝 Draft"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-gray-500 text-xs uppercase tracking-wider mb-1.5 block">Featured Image</label>
                <div onClick={() => fileRef.current?.click()}
                  className="border border-dashed border-white/[0.12] rounded-xl p-4 text-center cursor-pointer hover:border-orange-500/40 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-lg"/>
                  ) : (
                    <div className="py-5">
                      <p className="text-3xl mb-2">📸</p>
                      <p className="text-gray-500 text-sm">Click karke image choose karein</p>
                      <p className="text-gray-700 text-xs mt-1">JPG, PNG, WebP</p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                    }}/>
                </div>
                {imagePreview && (
                  <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-1.5 text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer">
                    ✕ Image hatao
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06]">
              <button onClick={closeModal} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 border border-white/[0.08] hover:border-white/20 transition-all bg-transparent cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all border-none cursor-pointer"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                {saving
                  ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"/> Saving...</>
                  : modal === "create" ? "+ Create Blog" : "✓ Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          DELETE MODAL
      ══════════════════════════════════ */}
      {modal === "delete" && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">🗑️</div>
              <h2 className="text-gray-100 font-bold text-lg m-0">Blog Delete Karein?</h2>
              <p className="text-gray-500 text-sm mt-2">
                "<span className="text-orange-400">{selected.title}</span>" permanently delete ho jayega.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={closeModal} disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-white/[0.08] text-gray-300 hover:border-white/20 transition-all bg-transparent cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                style={{ background: saving ? "#7f1d1d" : "#dc2626" }}>
                {saving
                  ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"/> Deleting...</>
                  : "🗑️ Yes, Delete Karo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adminblogs;