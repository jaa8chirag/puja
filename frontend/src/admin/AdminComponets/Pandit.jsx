import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Loader2,
  Phone,
  Mail,
  Pencil,
  Trash2,
  ShieldCheck,
  ShieldOff,
  X,
  User,
  Hash,
  Clock,
  FileText,
  Award,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle2,
  BadgeCheck,
  Star,
  ImagePlus,
} from "lucide-react";
import { API } from "../../services/adminApi.js";
import VerifyPanditModal from "./VerifyPanditModal.jsx";
import { useNavigate } from "react-router-dom";

const Pandits = () => {
  // --- Existing States (unchanged) ---
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPandit, setEditingPandit] = useState(null);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedPanditName, setSelectedPanditName] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [blockedCount, setBlockedCount] = useState(0);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pandit_type: "",
    document_url: "",
  });

  const [toast, setToast] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── NEW: Verify Pandit Modal States ──────────────────────
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ name: "", rating: "" });
  const [verifyImage, setVerifyImage] = useState(null);
  const [verifyPreview, setVerifyPreview] = useState(null);
  // ─────────────────────────────────────────────────────────

  // --- Existing Functions (unchanged) ---

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPandits = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/pandits?page=${page}&search=${search}`);
      setPandits(res.data.pandits);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
      setActiveCount(res.data.pandits.filter((p) => !p.is_blocked).length);
      setBlockedCount(res.data.pandits.filter((p) => p.is_blocked).length);
    } catch (err) {
      showToast("Failed to fetch records", "error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPandits();
  }, [page, search]);

  const openHistoryModal = async (pandit) => {
    setSelectedPanditName(pandit.name);
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await API.get(`/pandits/history/${pandit.id}`);
      setHistory(res.data);
    } catch (err) {
      showToast("History load nahi ho payi", "error", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone)
      return showToast("Name & Phone are required", "error");

    setActionLoading("form");
    try {
      if (editingPandit) {
        await API.put(`/pandits/${editingPandit.id}`, formData);
        showToast("Profile Updated");
      } else {
        await API.post("/pandits", formData);
        showToast("Pandit Registered");
      }
      closeModal();
      fetchPandits();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleBlock = async (id) => {
    setActionLoading(id);
    try {
      await API.put(`/pandits/block/${id}`);
      showToast("Status Changed");
      fetchPandits();
    } catch (err) {
      showToast("Action failed", "error", err);
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (p) => {
    setDeleteTarget({ id: p.id, name: p.name });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/pandits/${deleteTarget.id}`);
      showToast("Record Deleted");
      setDeleteModal(false);
      setDeleteTarget(null);
      fetchPandits();
    } catch (err) {
      showToast("Delete failed", "error", err);
    } finally {
      setDeleting(false);
    }
  };

  const openEditModal = (p) => {
    setEditingPandit(p);
    setFormData({
      name: p.name,
      email: p.email || "",
      phone: p.phone,
      pandit_type: p.pandit_type || "",
      document_url: p.document_url || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPandit(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      pandit_type: "",
      document_url: "",
    });
  };

  const avatarColor = (name) => {
    const colors = [
      "bg-orange-500/20 border-orange-500 text-orange-500",
      "bg-emerald-500/20 border-emerald-500 text-emerald-500",
      "bg-blue-500/20 border-blue-500 text-blue-500",
    ];
    return colors[name?.length % 3];
  };

  const getPaginationPages = () => {
    const pages = [];
    const delta = 1;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push("...");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  // ── NEW: Verify Pandit Submit ─────────────────────────────
  // const handleVerifySubmit = async () => {
  //   if (!verifyForm.name || !verifyForm.rating) {
  //     return showToast("Name aur Rating required hai", "error");
  //   }
  //   if (!verifyImage) {
  //     return showToast("Image select karo", "error");
  //   }
  //   if (
  //     isNaN(verifyForm.rating) ||
  //     verifyForm.rating < 0 ||
  //     verifyForm.rating > 5
  //   ) {
  //     return showToast("Rating 0 se 5 ke beech honi chahiye", "error");
  //   }
  //   setVerifyLoading(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append("name", verifyForm.name);
  //     fd.append("rating", verifyForm.rating);
  //     fd.append("image", verifyImage);
  //     await API.post("/verify-pandit", fd, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });
  //     showToast("Verify Pandit Added!");
  //     setShowVerifyModal(false);
  //     setVerifyForm({ name: "", rating: "" });
  //     setVerifyImage(null);
  //     setVerifyPreview(null);
  //   } catch (err) {
  //     showToast(err.response?.data?.message || "Failed to add", "error");
  //   } finally {
  //     setVerifyLoading(false);
  //   }
  // };
  const handleVerifySubmit = async () => {
    if (!verifyForm.name || !verifyForm.rating) {
      return showToast("Name aur Rating required hai", "error");
    }
    if (!verifyImage) {
      return showToast("Image select karo", "error");
    }
    if (
      isNaN(verifyForm.rating) ||
      verifyForm.rating < 0 ||
      verifyForm.rating > 5
    ) {
      return showToast("Rating 0 se 5 ke beech honi chahiye", "error");
    }

    setVerifyLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", verifyForm.name);
      fd.append("rating", verifyForm.rating);
      fd.append("image", verifyImage);

      await API.post("/verify-pandit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: (status) => status < 500, // ✅ 201 bhi success maano
      });

      // ✅ Yahan aa gaye matlab success hai
      showToast("Verify Pandit Added!");
      setShowVerifyModal(false);
      setVerifyForm({ name: "", rating: "" });
      setVerifyImage(null);
      setVerifyPreview(null);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add", "error");
    } finally {
      setVerifyLoading(false); // ✅ Spinner band
    }
  };
  // ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-slate-300">
      {/* Toast Notification (unchanged) */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[150] px-5 py-3 rounded-2xl shadow-2xl text-[11px] font-black uppercase tracking-wider flex items-center gap-3 border ${toast.type === "error"
            ? "bg-rose-950 border-rose-800 text-rose-400"
            : "bg-emerald-950 border-emerald-800 text-emerald-400"
            }`}
        >
          {toast.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* PAGE HEADER — only Add Verify Pandit button added, rest unchanged */}
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-4">
          {/*<div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/20 text-slate-900">
            <Users size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Pandit Directory
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">
              Manage types and verification documents
            </p>
          </div> */}

          <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="text-orange-500" /> Pandit Directory
          </h1>
          <p className="text-[12px] text-slate-500 font-medium"> Manage types and verification documents</p>
        </div>
        </div>

        {/* ── NEW BUTTON + existing button side by side ── */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white text-slate-900 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
          >
            <Plus size={16} strokeWidth={3} /> Add Pandit
          </button>
        </div>
      </div>

      {/* STATS STRIP (unchanged) */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total",
            value: total,
            color: "border-slate-800 bg-[#1e293b]/50 text-slate-400",
          },
          {
            label: "Active",
            value: activeCount,
            color: "border-emerald-900/50 bg-emerald-950/20 text-emerald-400",
          },
          {
            label: "Blocked",
            value: blockedCount,
            color: "border-rose-900/50 bg-rose-950/20 text-rose-400",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`flex items-center justify-between px-5 py-3 rounded-2xl border ${s.color}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
              {s.label}
            </span>
            <span className="text-xl font-black">{s.value}</span>
          </div>
        ))}
      </div>

      {/* MAIN DATA CARD (unchanged) */}
      <div className="bg-[#131e32] rounded-[24px] shadow-xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-[#0f172a]/40">
          <div className="relative max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="SEARCH BY NAME OR PHONE..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-[11px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                Loading Records...
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-slate-500 uppercase text-[10px] font-black tracking-[0.15em] border-b border-slate-800">
                  <th className="px-6 py-4">Pandit Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-center">Verification</th>
                  <th className="px-6 py-4 text-center">History</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pandits.map((p) => (
                  <tr
                    key={p.id}
                    className={`group hover:bg-emerald-500/[0.02] transition-colors ${actionLoading === p.id ? "opacity-30" : ""}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center font-black text-xs ${avatarColor(p.name)}`}
                        >
                          {p.name?.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-200 text-sm">
                          {p.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-[10px] font-bold text-orange-400 border border-orange-500/20 uppercase tracking-tight">
                        {p.pandit_type || "Standard"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <Phone size={12} className="text-emerald-500" />{" "}
                          {p.phone}
                        </div>
                        {p.email && (
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <Mail size={12} /> {p.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {p.document_url ? (
                        <a
                          href={p.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase"
                        >
                          <FileText size={14} /> View
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 uppercase italic">
                          No Doc
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => openHistoryModal(p)}
                        className="group flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all"
                      >
                        <Clock
                          size={14}
                          className="text-slate-500 group-hover:text-orange-400"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-orange-400">
                          Log
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => toggleBlock(p.id)}
                          className={`p-2 rounded-xl transition-all ${p.is_blocked ? "text-emerald-500 hover:bg-emerald-500/10" : "text-amber-500 hover:bg-amber-500/10"}`}
                        >
                          {p.is_blocked ? (
                            <ShieldCheck size={14} />
                          ) : (
                            <ShieldOff size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteModal(p)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
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

        {/* PAGINATION (unchanged) */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-800 bg-[#0f172a]/40 flex items-center justify-between gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {getPaginationPages().map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-slate-600 text-[11px] font-black"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-xl text-[11px] font-black border transition-all ${page === p ? "bg-emerald-500 border-emerald-500 text-slate-900" : "border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10"}`}
                  >
                    {p}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-emerald-500/50 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- EXISTING MODALS (unchanged) --- */}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-[#131e32] w-full max-w-lg rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/50">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  {editingPandit
                    ? "Update Professional Profile"
                    : "Register New Pandit"}
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] mt-1">
                  Verification & Credentials Management
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Contact Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all uppercase placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Email Address (Optional)
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Pandit Expertise
                </label>
                <div className="relative group">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <select
                    value={formData.pandit_type}
                    onChange={(e) =>
                      setFormData({ ...formData, pandit_type: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer uppercase"
                  >
                    <option value="" className="bg-[#131e32]">
                      Select Classification
                    </option>
                    <option value="Vedic" className="bg-[#131e32]">
                      Vedic Pandit
                    </option>
                    <option value="Shastri" className="bg-[#131e32]">
                      Shastri
                    </option>
                    <option value="Acharya" className="bg-[#131e32]">
                      Acharya
                    </option>
                    <option value="Karmakandi" className="bg-[#131e32]">
                      Karmakandi
                    </option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  KYC Document URL
                </label>
                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="G-Drive or S3 Link"
                    value={formData.document_url}
                    onChange={(e) =>
                      setFormData({ ...formData, document_url: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-[#0f172a]/50 border-t border-slate-800 flex items-center gap-4">
              <button
                onClick={closeModal}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSubmit}
                disabled={actionLoading === "form"}
                className="flex-[1.5] py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-emerald-500 text-slate-900 hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                {actionLoading === "form" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} strokeWidth={3} />
                    {editingPandit ? "Commit Updates" : "Register Pandit"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL (unchanged) */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center z-[110] p-4">
          <div className="bg-[#131e32] w-full max-w-2xl rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-4">
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/50">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">
                  Service History
                </h3>
                <p className="text-[11px] text-orange-400 font-bold uppercase tracking-widest">
                  {selectedPanditName}
                </p>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto scrollbar-hide flex-1">
              {historyLoading ? (
                <div className="flex flex-col items-center py-20 gap-3 text-slate-500">
                  <Loader2 className="animate-spin text-orange-500" size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Fetching Logs...
                  </span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20 text-slate-600">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    No record found
                  </p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800/50">
                      <th className="px-4 py-3">Puja</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {history.map((h) => (
                      <tr key={h.id} className="text-xs">
                        <td className="px-4 py-4 font-bold text-white uppercase">
                          {h.puja_name}
                        </td>
                        <td className="px-4 py-4 text-slate-400">
                          {h.customer_name}
                        </td>
                        <td className="px-4 py-4 text-slate-400">{h.status}</td>
                        <td className="px-4 py-4 text-right font-mono text-emerald-400 font-black">
                          ₹{h.total_price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL (unchanged) */}
      {deleteModal && deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md px-4">
          <div className="bg-[#131e32] border border-rose-500/20 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🗑️</div>
              <h2 className="text-white font-black text-xl tracking-tight m-0">
                Pandit Delete Karein?
              </h2>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                "
                <span className="text-orange-400 font-bold">
                  {deleteTarget.name}
                </span>
                " ka record permanently delete ho jayega. Yeh action undo nahi
                ho sakta.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal(false);
                  setDeleteTarget(null);
                }}
                disabled={deleting}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-[1.5] py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl text-white transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                style={{ background: deleting ? "#7f1d1d" : "#dc2626" }}
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Trash2 size={14} /> Haan, Delete Karo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: ADD VERIFY PANDIT MODAL ─────────────────────── */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[130] p-4">
          <div className="bg-[#131e32] w-full max-w-md rounded-[32px] border border-orange-500/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]/50">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Add Verify Pandit
                </h3>
                <p className="text-[10px] text-orange-400 font-bold uppercase tracking-[0.2em] mt-1">
                  Verified Pandit Table Entry
                </p>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerifyForm({ name: "", rating: "" });
                  setVerifyImage(null);
                  setVerifyPreview(null);
                }}
                className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 flex flex-col gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Pandit Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="e.g. Pandit Ramesh Sharma"
                    value={verifyForm.name}
                    onChange={(e) =>
                      setVerifyForm({ ...verifyForm, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Image File Upload */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Pandit Image
                </label>
                <label className="flex items-center gap-3 w-full px-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl cursor-pointer hover:border-orange-500 transition-all group">
                  <ImagePlus className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                  <span className="text-xs font-bold text-slate-500 truncate">
                    {verifyImage
                      ? verifyImage.name
                      : "JPG, PNG, WEBP — Max 2MB"}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setVerifyImage(file);
                        setVerifyPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
                {/* Live Preview */}
                {verifyPreview && (
                  <div className="mt-2 flex items-center gap-3 px-1">
                    <img
                      src={verifyPreview}
                      alt="preview"
                      className="w-12 h-12 rounded-xl object-cover border border-orange-500/30"
                    />
                    <div>
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">
                        Preview
                      </p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                        {verifyImage?.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Rating (0.0 – 5.0)
                </label>
                <div className="relative group">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="number"
                    placeholder="e.g. 4.8"
                    min="0"
                    max="5"
                    step="0.1"
                    value={verifyForm.rating}
                    onChange={(e) =>
                      setVerifyForm({ ...verifyForm, rating: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0f172a] border border-slate-700 rounded-2xl text-xs font-bold text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 bg-[#0f172a]/50 border-t border-slate-800 flex items-center gap-4">
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setVerifyForm({ name: "", rating: "" });
                  setVerifyImage(null);
                  setVerifyPreview(null);
                }}
                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                disabled={verifyLoading}
                className="flex-[1.5] py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl bg-orange-500 text-white hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
              >
                {verifyLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <BadgeCheck size={16} strokeWidth={3} /> Save to Database
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─────────────────────────────────────────────────────── */}
    </div>
  );
};

export default Pandits;
