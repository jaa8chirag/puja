import { useState, useEffect, useRef } from "react";
import { Star, MessageSquare, Trash2, Edit2, Plus } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const EMPTY_FORM = {
  name: "",
  date: "",
  rating: 5,
  comment: "",
  status: "published",
};

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/img/")) return url;
  if (url.startsWith("/uploads/")) return `${API_BASE_URL.replace("/api", "")}${url}`;
  return `${API_BASE_URL}/uploads/${url}`;
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/admin`, { headers: authHeaders() });
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setModal("create");
  };

  const openEdit = (rev) => {
    setForm({
      name: rev.name,
      date: rev.date,
      rating: rev.rating,
      comment: rev.comment,
      status: rev.status,
    });
    setImagePreview(rev.avatar ? buildImageUrl(rev.avatar) : null);
    setImageFile(null);
    setSelected(rev);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      const url = modal === "create" ? `${API_BASE_URL}/reviews/admin` : `${API_BASE_URL}/reviews/admin/${selected.id}`;
      const method = modal === "create" ? "POST" : "PUT";
      
      const res = await fetch(url, { method, headers: authHeaders(), body: fd });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchReviews();
      } else alert(data.error);
    } catch (e) {
      alert("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/admin/${selected.id}`, { method: "DELETE", headers: authHeaders() });
      const data = await res.json();
      if (data.success) {
        closeModal();
        fetchReviews();
      }
    } catch (e) {
      alert("Failed to delete review");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (rev) => {
    try {
      await fetch(`${API_BASE_URL}/reviews/admin/${rev.id}/status`, { method: "PATCH", headers: authHeaders() });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="text-orange-500" /> User Reviews
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">Manage testimonials on the website</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity border-none cursor-pointer"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <Plus size={16} /> New Review
        </button>
      </div>

      <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
           <div className="flex justify-center p-10"><span className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No reviews found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-gray-500 uppercase text-[11px]">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(rev => (
                  <tr key={rev.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-900/20 flex shrink-0">
                        {rev.avatar ? <img src={buildImageUrl(rev.avatar)} alt="" className="w-full h-full object-cover"/> : <span className="m-auto text-lg">👤</span>}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">{rev.name}</div>
                        <div className="text-xs text-gray-500">{rev.date}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex text-yellow-500 text-xs gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < rev.rating ? "currentColor" : "none"} strokeWidth={1}/>)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">{rev.comment}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(rev)} className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${rev.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {rev.status === 'published' ? '✅ Published' : '📝 Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(rev)} className="text-blue-400 hover:bg-blue-500/20 p-1.5 rounded mr-2"><Edit2 size={14}/></button>
                      <button onClick={() => { setSelected(rev); setModal('delete'); }} className="text-red-400 hover:bg-red-500/20 p-1.5 rounded"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-white font-bold">{modal === 'create' ? 'New Review' : 'Edit Review'}</h2>
              <button onClick={closeModal} className="text-gray-500 text-xl cursor-pointer">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase block mb-1">Date</label>
                  <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} placeholder="e.g. Jan 12, 2024" className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase block mb-1">Rating</label>
                  <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2 text-white" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1">Comment</label>
                <textarea rows="3" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full bg-[#161b27] border border-white/[0.08] rounded-xl px-4 py-2 text-white resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1">Avatar / Image</label>
                <div onClick={() => fileRef.current?.click()} className="border border-dashed border-white/[0.12] rounded-xl p-4 text-center cursor-pointer">
                  {imagePreview ? <img src={imagePreview} className="h-16 mx-auto rounded-full"/> : <p className="text-xs text-gray-400">Click to upload avatar</p>}
                </div>
                <input type="file" ref={fileRef} className="hidden" onChange={e => {
                  const f = e.target.files[0];
                  if(f){ setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                }}/>
              </div>
            </div>
            <div className="flex px-6 py-4 border-t border-white/[0.06] justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg font-bold text-white bg-orange-600">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
           <div className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 max-w-sm text-center">
             <div className="text-4xl mb-3">🗑️</div>
             <h2 className="text-white font-bold mb-4">Delete Review?</h2>
             <div className="flex gap-3">
               <button onClick={closeModal} className="flex-1 py-2 rounded border border-white/[0.08] text-white">Cancel</button>
               <button onClick={handleDelete} className="flex-1 py-2 rounded bg-red-600 text-white font-bold">Delete</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
