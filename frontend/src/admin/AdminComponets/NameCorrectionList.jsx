import { useEffect, useState } from "react";
import { API } from "../../services/adminApi";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  RefreshCw,
} from "lucide-react";
import Pagination from "../../Components/Pagination";

const NameCorrectionList = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const limit = 10;

  const navigate = useNavigate();

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await API.get(
        `/name/name-correction/all?page=${page}&limit=${limit}`,
      );
      setRecords(res.data.data);
      setTotalPages(res.data.totalPages || 1);
      setTotal(res.data.total || res.data.data?.length || 0);
    } catch (err) {
      showToast("Failed to fetch records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page]);

  // ✅ Search covers requested name + user details
  const filteredRecords = records.filter((r) =>
    `${r.name} ${r.dob} ${r.user_name} ${r.user_email} ${r.user_phone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Format DOB → "15 Jan 2024"
  const formatDob = (dob) => {
    if (!dob) return "—";
    const date = new Date(dob);
    if (isNaN(date)) return dob;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  return (
    <div className="bg-transparent min-h-screen">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[60] px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-3 border animate-in slide-in-from-right-5 ${
            toast.type === "error"
              ? "bg-rose-950/40 text-rose-400 border-rose-800/50 backdrop-blur-md"
              : "bg-emerald-950/40 text-emerald-400 border-emerald-800/50 backdrop-blur-md"
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

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="text-orange-500" /> Name Correction Requests
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            All submitted name correction records
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl border bg-[#131e32] text-orange-500 border-orange-500/20 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Total
          </span>
          <span className="text-lg font-black">{total}</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl border bg-[#131e32] text-emerald-500 border-emerald-500/20 shadow-xl">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">
            Showing
          </span>
          <span className="text-lg font-black">{filteredRecords.length}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-[#131e32] rounded-3xl shadow-2xl border border-slate-800 overflow-hidden">
        {/* Search */}
        <div className="px-5 py-4 border-b border-slate-800/50 bg-[#0f172a]/30">
          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 bg-[#0f172a] text-white placeholder:text-slate-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-orange-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold">
                Fetching Records...
              </span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-600">
              <FileText size={48} className="mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">
                No records found
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-5 py-4 font-bold">#</th>
                  <th className="px-5 py-4 font-bold">Requested Name</th>
                  <th className="px-5 py-4 font-bold">Date of Birth</th>
                  <th className="px-5 py-4 font-bold">User Details</th>
                  {/* ✅ Updated */}
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredRecords.map((rec, i) => (
                  <tr
                    key={rec.id}
                    className={`transition-colors ${
                      actionLoading === rec.id
                        ? "opacity-30 pointer-events-none"
                        : "hover:bg-[#1a2744]"
                    } ${i % 2 !== 0 ? "bg-[#0f172a]/30" : ""}`}
                  >
                    {/* ID */}
                    <td className="px-5 py-4">
                      <span className="text-slate-500 font-mono text-[10px]">
                        #{rec.id}
                      </span>
                    </td>

                    {/* Requested Name with Avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${avatarColor(rec.name)}`}
                        >
                          {rec.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-200">
                          {rec.name}
                        </span>
                      </div>
                    </td>

                    {/* DOB */}
                    <td className="px-5 py-4">
                      <span className="text-amber-400/80 font-mono text-[11px]">
                        {formatDob(rec.dob)}
                      </span>
                    </td>

                    {/* ✅ User Details from JOIN */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="text-slate-200 font-bold">
                          {rec.user_name || "—"}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {rec.user_email || "No Email"}
                        </p>
                        <p className="text-orange-500/80 font-mono text-[10px]">
                          {rec.user_phone || "No Phone"}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate("/nameCorrect")}
                          disabled={actionLoading === rec.id}
                          title="Generate Name"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 border border-orange-500/20 transition-all text-[10px] font-black uppercase tracking-wide disabled:opacity-50"
                        >
                          {actionLoading === rec.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Sparkles size={12} />
                          )}
                          Generate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && records.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>
    </div>
  );
};

export default NameCorrectionList;
