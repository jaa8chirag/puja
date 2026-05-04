import { useEffect, useState } from "react";
import { API } from "../../services/adminApi";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Star,
  Camera,
  MapPin,
  Briefcase,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Users as UsersIcon,
} from "lucide-react";

// --- HELPERS (Focus fix ke liye bahar rakhe hain) ---
const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-[#131e32] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-slate-700/50">
      {children}
    </div>
  </div>
);

const ModalField = ({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
}) => (
  <div className="relative mb-3">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-11 pr-4 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
    />
  </div>
);

const VerifiedPanditManager = () => {
  const [pandits, setPandits] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPandit, setEditingPandit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    rating: "4.8",
    location: "",
    experience: "",
  });
  const [image, setImage] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPandits = async () => {
    setLoading(true);
    try {
      const res = await API.get("/verify-pandit");
      setPandits(res.data);
    } catch {
      showToast("Failed to load records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPandits();
  }, []);

  const filteredPandits = pandits.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    // Basic Validation
    if (!formData.name || !formData.location)
      return showToast("Name & Location required", "error");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("rating", formData.rating);
    data.append("location", formData.location);
    data.append("experience", formData.experience);
    if (image) data.append("image", image);

    setActionLoading(editingPandit ? "edit" : "add");
    try {
      if (editingPandit) {
        await API.put(`/verify-pandit/${editingPandit.id}`, data);
        showToast("Update Successful");
      } else {
        if (!image) return showToast("Image is required", "error");
        await API.post("/verify-pandit", data);
        showToast("Pandit Verified");
      }
      handleClose();
      fetchPandits();
    } catch (error) {
      // ✅ Updated: Ab backend ka specific error message (like size issue) toast mein dikhega
      const errorMsg = error.response?.data?.message || "Action failed";
      showToast(errorMsg, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deletePandit = (pandit) => {
    setDeleteTarget({ id: pandit.id, name: pandit.name });
  };

  const confirmDeletePandit = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/verify-pandit/${deleteTarget.id}`);
      setPandits((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast("Deleted successfully");
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleClose = () => {
    setShowAddModal(false);
    setEditingPandit(null);
    setFormData({ name: "", rating: "4.8", location: "", experience: "" });
    setImage(null);
  };

  return (
    <div className="bg-transparent min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[110] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border animate-in slide-in-from-right-5 ${toast.type === "error" ? "bg-rose-950/40 text-rose-400 border-rose-800/50 backdrop-blur-md" : "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 backdrop-blur-md"}`}
        >
          {toast.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="text-orange-500" /> Verified Pandits
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Scholar Database
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition shadow-lg"
        >
          <Plus size={16} /> Add Pandit
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-[#131e32] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/50 bg-[#0f172a]/30">
          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search scholars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-[#0f172a] text-white focus:outline-none focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <span className="text-[10px] uppercase font-bold tracking-widest">
                Loading Scholars...
              </span>
            </div>
          ) : filteredPandits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <UsersIcon size={48} className="mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No Records Found
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-5 py-4 font-bold">Identity</th>
                  <th className="px-5 py-4 font-bold">Exp & Location</th>
                  <th className="px-5 py-4 font-bold">Rating</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredPandits.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-[#1a2744] ${i % 2 !== 0 ? "bg-[#0f172a]/30" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                          <img
                            src={`${API_BASE_URL}/${p.image}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <span className="font-bold text-slate-200">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-300 flex items-center gap-1">
                          <MapPin size={10} className="text-orange-500" />{" "}
                          {p.location}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          {p.experience || 0} Years Experience
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 w-fit">
                        <Star
                          size={10}
                          className="text-orange-500 fill-orange-500"
                        />
                        <span className="font-black text-orange-200">
                          {p.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPandit(p);
                            setFormData({
                              name: p.name,
                              rating: p.rating,
                              location: p.location,
                              experience: p.experience,
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-orange-500 transition"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deletePandit(p)}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Section */}
      {(showAddModal || editingPandit) && (
        <ModalWrapper onClose={handleClose}>
          <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/50">
            <h3 className="text-sm font-black text-white uppercase">
              {editingPandit ? "Edit Identity" : "New Pandit"}
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6">
            <ModalField
              icon={User}
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <ModalField
              icon={MapPin}
              placeholder="Location (e.g. Haridwar, UK) *"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-3">
              <ModalField
                icon={Star}
                placeholder="Rating"
                type="number"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: e.target.value })
                }
              />
              <ModalField
                icon={Briefcase}
                placeholder="Exp (Years)"
                type="number"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
            </div>

            <label className="flex flex-col items-center justify-center w-full h-24 bg-[#0f172a] border border-dashed border-slate-800 rounded-2xl cursor-pointer hover:border-orange-500/50 transition-all overflow-hidden">
              {image ? (
                <span className="text-[10px] text-emerald-500 font-bold uppercase p-2 text-center">
                  {image.name}
                </span>
              ) : editingPandit ? (
                <div className="relative w-full h-full group">
                  <img
                    src={`${API_BASE_URL}/${editingPandit.image}`}
                    className="w-full h-full object-cover opacity-40"
                    alt="current"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Camera size={18} className="text-white mb-1" />
                    <span className="text-[8px] text-white font-bold uppercase">
                      Change Photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera size={18} className="text-slate-600 mb-1" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase">
                    Profile Photo (Max 5MB)
                  </span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 5 * 1024 * 1024) {
                    showToast("Use Photo Less than 5MB!", "error");
                    return;
                  }
                  setImage(file);
                }}
              />
            </label>
          </div>
          <div className="px-6 py-5 bg-[#0f172a]/50 border-t border-slate-800 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 text-[10px] font-black uppercase rounded-2xl border border-slate-700 text-slate-400"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 text-[10px] font-black uppercase rounded-2xl bg-orange-500 text-white flex items-center justify-center gap-2"
            >
              {actionLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Commit
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md px-4">
          <div className="w-full max-w-sm bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
              <Trash2 size={32} className="text-rose-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Record?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <span className="text-rose-400 font-black">"{deleteTarget.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePandit}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-500 transition shadow-lg shadow-rose-900/20 flex items-center justify-center disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedPanditManager;
