import { useEffect, useState } from "react";
import { API } from "../../services/adminApi";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  Mail,
  Info,
  Loader2,
  CheckCircle2,
  XCircle,
  Power,
  MessageSquare,
  FileUp,
} from "lucide-react";
import Pagination from "../../Components/Pagination";

// ✅ Modal Wrapper
const ModalWrapper = ({ children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-[#131e32] w-full max-w-sm rounded-3xl shadow-2xl border border-slate-800 overflow-hidden ring-1 ring-slate-700/50">
      {children}
    </div>
  </div>
);

// ✅ Input Field
const ModalField = ({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  isTextArea = false,
}) => (
  <div className="relative">
    <Icon className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
    {isTextArea ? (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full pl-11 pr-4 py-3 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600 transition-all"
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-11 pr-4 py-11 border border-slate-800 rounded-2xl text-xs bg-[#0f172a] text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-slate-600 transition-all"
        style={{ paddingTop: "12px", paddingBottom: "12px" }}
      />
    )}
  </div>
);

const PersonalInfo = () => {
  // ── PERSONAL INFO STATES ──
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({ phone_name: "", email: "" });
  const [formData, setFormData] = useState({ phone_name: "", email: "" });

  // ── FAQ STATES ──
  const [faqs, setFaqs] = useState([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [editingFaq, setEditingFaq] = useState(null);
  const [showAddFaqModal, setShowAddFaqModal] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [faqFormData, setFaqFormData] = useState({ question: "", answer: "" });

  // ── PDF STATES ──
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");
  const [pdfError, setPdfError] = useState("");

  // ── COMMON STATES ──
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const limit = 10;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── PERSONAL INFO FUNCTIONS ──
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/personal-info?page=${page}&limit=${limit}`);
      setRecords(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || 0);
    } catch {
      showToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── FAQ FUNCTIONS ──
  const fetchFaqs = async () => {
    setFaqLoading(true);
    try {
      const res = await API.get("/faq/get-all");
      if (res.data.success) setFaqs(res.data.faqs);
    } catch {
      showToast("Failed to fetch FAQs", "error");
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchFaqs();
  }, [page]);

  // ── FAQ CRUD ──
  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer)
      return showToast("Question and Answer are required", "error");
    setActionLoading("add-faq");
    try {
      await API.post("/faq/add", newFaq);
      showToast("FAQ created");
      setShowAddFaqModal(false);
      setNewFaq({ question: "", answer: "" });
      fetchFaqs();
    } catch {
      showToast("Failed to create FAQ", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const updateFaq = async () => {
    setActionLoading("edit-faq");
    try {
      await API.put(`/faq/update/${editingFaq.id}`, faqFormData);
      showToast("FAQ updated");
      setEditingFaq(null);
      fetchFaqs();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    setActionLoading(`del-faq-${id}`);
    try {
      await API.delete(`/faq/delete/${id}`);
      showToast("FAQ deleted");
      fetchFaqs();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── PERSONAL INFO ACTIONS ──
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setActionLoading(id);
    try {
      await API.delete(`/personal-info/${id}`);
      showToast("Record deleted");
      fetchRecords();
    } catch {
      showToast("Delete failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    setActionLoading(`status-${id}`);
    try {
      await API.put(`/personal-info/${id}/status`, {
        is_active: currentStatus === 1 ? 0 : 1,
      });
      showToast("Status updated");
      fetchRecords();
    } catch {
      showToast("Status update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const updateRecord = async () => {
    setActionLoading("edit");
    try {
      await API.put(`/personal-info/${editingRecord.id}`, formData);
      showToast("Record updated");
      setEditingRecord(null);
      fetchRecords();
    } catch {
      showToast("Update failed", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const addRecord = async () => {
    if (!newRecord.phone_name || !newRecord.email)
      return showToast("Phone name and email are required", "error");
    setActionLoading("add");
    try {
      await API.post(`/personal-info`, newRecord);
      showToast("Record created");
      setShowAddModal(false);
      setNewRecord({ phone_name: "", email: "" });
      fetchRecords();
    } catch {
      showToast("Failed to create record", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ── PDF REPLACE FUNCTION ──
  const handlePdfReplace = async () => {
    if (!pdfFile) return setPdfError("Pehle PDF select karo");

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    setPdfLoading(true);
    setPdfMessage("");
    setPdfError("");

    try {
      await API.post("/replace-checklist", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfMessage("Checklist successfully updated ✅");
      setPdfFile(null);
      document.getElementById("pdfInput").value = "";
    } catch (err) {
      setPdfError(err.response?.data?.error || "Something went wrong.");
    }
    setPdfLoading(false);
  };

  const avatarColor = (name) => {
    const colors = [
      "bg-orange-500/20 text-orange-500 border-orange-500/20",
      "bg-sky-500/20 text-sky-500 border-sky-500/20",
      "bg-amber-500/20 text-amber-500 border-amber-500/20",
      "bg-rose-500/20 text-rose-500 border-rose-500/20",
      "bg-emerald-500/20 text-emerald-500 border-emerald-500/20",
      "bg-violet-500/20 text-violet-500 border-violet-500/20",
    ];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  const filteredRecords = records.filter((r) =>
    `${r.phone_name} ${r.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredFaqs = faqs.filter((f) =>
    f.question.toLowerCase().includes(faqSearch.toLowerCase()),
  );

  return (
    <div className="bg-transparent min-h-screen space-y-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border ${toast.type === "error" ? "bg-rose-500/10 border-rose-500/30 text-rose-400" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"}`}
        >
          {toast.type === "error" ? (
            <XCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* ── SECTION 1: PERSONAL INFO ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <Info className="text-orange-500" /> Personal Info
            </h1>
            <p className="text-slate-500 text-xs mt-1">{total} total records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search info..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#131e32] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-all"
            >
              <Plus size={14} /> Add Record
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={24} />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-[#131e32]">
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-3">
                    Phone Name
                  </th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-3">
                    Email
                  </th>
                  <th className="text-center text-xs font-bold text-slate-400 px-5 py-3">
                    Status
                  </th>
                  <th className="text-right text-xs font-bold text-slate-400 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-black ${avatarColor(rec.phone_name)}`}
                        >
                          {rec.phone_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white text-xs font-semibold">
                          {rec.phone_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-slate-400 text-xs">
                        {rec.email}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${rec.is_active === 1 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border border-slate-500/30"}`}
                        >
                          {rec.is_active === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(rec.id, rec.is_active)}
                          disabled={actionLoading === `status-${rec.id}`}
                          className={`p-2 rounded-xl transition-all ${rec.is_active === 1 ? "bg-slate-800 text-slate-400" : "bg-slate-800 text-emerald-400"}`}
                        >
                          {actionLoading === `status-${rec.id}` ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Power size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRecord(rec);
                            setFormData({
                              phone_name: rec.phone_name,
                              email: rec.email,
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-orange-400"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteRecord(rec.id)}
                          disabled={actionLoading === rec.id}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          {actionLoading === rec.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ── SECTION 2: FAQs ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <MessageSquare className="text-orange-500" /> FAQ Management
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              {faqs.length} questions added
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#131e32] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowAddFaqModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-all"
            >
              <Plus size={14} /> Add FAQ
            </button>
          </div>
        </div>

        {faqLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-orange-500" size={24} />
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-[#131e32]">
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-3">
                    Question
                  </th>
                  <th className="text-left text-xs font-bold text-slate-400 px-5 py-3">
                    Answer Snippet
                  </th>
                  <th className="text-right text-xs font-bold text-slate-400 px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="text-white text-xs font-semibold">
                        {f.question}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-slate-400 text-xs truncate max-w-xs block">
                        {f.answer}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingFaq(f);
                            setFaqFormData({
                              question: f.question,
                              answer: f.answer,
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-orange-400"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteFaq(f.id)}
                          disabled={actionLoading === `del-faq-${f.id}`}
                          className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400"
                        >
                          {actionLoading === `del-faq-${f.id}` ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── SECTION 3: PDF REPLACE ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <FileUp className="text-orange-500" /> Puja Samagri Checklist
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              PDF replace karo — URL same rahega
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#131e32] p-6 max-w-lg">

          {/* Current File Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0f172a] border border-slate-800 mb-5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <FileUp size={16} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-semibold">
                Puja_Samagri_Checklist.pdf
              </p>
              <p className="text-slate-500 text-xs">Current file</p>
            </div>
            <a
              href="/pdf/Puja_Samagri_Checklist.pdf"
              target="_blank"
              className="text-orange-400 text-xs hover:underline"
            >
              Preview
            </a>
          </div>

          {/* File Input */}
          <div
            className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center mb-4 cursor-pointer hover:border-orange-500/50 transition-all"
            onClick={() => document.getElementById("pdfInput").click()}
          >
            <FileUp size={24} className="text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-xs">
              {pdfFile ? pdfFile.name : "Nai PDF yahan drop karo ya click karo"}
            </p>
            {pdfFile && (
              <p className="text-slate-500 text-xs mt-1">
                ({(pdfFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            <input
              id="pdfInput"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                setPdfFile(e.target.files[0]);
                setPdfError("");
                setPdfMessage("");
              }}
            />
          </div>

          {/* Replace Button */}
          <button
            onClick={handlePdfReplace}
            disabled={pdfLoading || !pdfFile}
            className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            {pdfLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileUp size={14} />
            )}
            {pdfLoading ? "Uploading..." : "Replace Karo"}
          </button>

          {/* Messages */}
          {pdfMessage && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
              <CheckCircle2 size={14} /> {pdfMessage}
            </div>
          )}
          {pdfError && (
            <div className="mt-3 flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2">
              <XCircle size={14} /> {pdfError}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS (Personal Info) ── */}
      {showAddModal && (
        <ModalWrapper onClose={() => setShowAddModal(false)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-sm">Add New Record</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <ModalField
                icon={User}
                placeholder="Phone Name"
                value={newRecord.phone_name}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, phone_name: e.target.value })
                }
              />
              <ModalField
                icon={Mail}
                placeholder="Email"
                type="email"
                value={newRecord.email}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, email: e.target.value })
                }
              />
            </div>
            <button
              onClick={addRecord}
              disabled={actionLoading === "add"}
              className="mt-5 w-full py-3 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2"
            >
              {actionLoading === "add" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Create Record
            </button>
          </div>
        </ModalWrapper>
      )}

      {editingRecord && (
        <ModalWrapper onClose={() => setEditingRecord(null)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-sm">Edit Record</h2>
              <button onClick={() => setEditingRecord(null)}>
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <ModalField
                icon={User}
                placeholder="Phone Name"
                value={formData.phone_name}
                onChange={(e) =>
                  setFormData({ ...formData, phone_name: e.target.value })
                }
              />
              <ModalField
                icon={Mail}
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <button
              onClick={updateRecord}
              disabled={actionLoading === "edit"}
              className="mt-5 w-full py-3 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2"
            >
              {actionLoading === "edit" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Pencil size={14} />
              )}{" "}
              Update Record
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── MODALS (FAQs) ── */}
      {showAddFaqModal && (
        <ModalWrapper onClose={() => setShowAddFaqModal(false)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-sm">Add New FAQ</h2>
              <button onClick={() => setShowAddFaqModal(false)}>
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <ModalField
                icon={MessageSquare}
                placeholder="Question"
                value={newFaq.question}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, question: e.target.value })
                }
              />
              <ModalField
                icon={Info}
                placeholder="Answer"
                isTextArea={true}
                value={newFaq.answer}
                onChange={(e) =>
                  setNewFaq({ ...newFaq, answer: e.target.value })
                }
              />
            </div>
            <button
              onClick={addFaq}
              disabled={actionLoading === "add-faq"}
              className="mt-5 w-full py-3 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2"
            >
              {actionLoading === "add-faq" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Create FAQ
            </button>
          </div>
        </ModalWrapper>
      )}

      {editingFaq && (
        <ModalWrapper onClose={() => setEditingFaq(null)}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-black text-sm">Edit FAQ</h2>
              <button onClick={() => setEditingFaq(null)}>
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="space-y-3">
              <ModalField
                icon={MessageSquare}
                placeholder="Question"
                value={faqFormData.question}
                onChange={(e) =>
                  setFaqFormData({ ...faqFormData, question: e.target.value })
                }
              />
              <ModalField
                icon={Info}
                placeholder="Answer"
                isTextArea={true}
                value={faqFormData.answer}
                onChange={(e) =>
                  setFaqFormData({ ...faqFormData, answer: e.target.value })
                }
              />
            </div>
            <button
              onClick={updateFaq}
              disabled={actionLoading === "edit-faq"}
              className="mt-5 w-full py-3 bg-orange-500 hover:bg-orange-400 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2"
            >
              {actionLoading === "edit-faq" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Pencil size={14} />
              )}{" "}
              Update FAQ
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

export default PersonalInfo;