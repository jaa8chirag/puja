import React, { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Calendar,
  Phone,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  X,
  Eye,
  Globe,
  Loader2,
  Info,
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AdminKundliRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/admin/kundli-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${API_BASE_URL}/admin/kundli-requests/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert("Failed to delete request");
    } finally {
      setDeleting(false);
    }
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile.includes(searchTerm) ||
      r.pob.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight">
            🔮 Kundli Insights Log
          </h2>
          <p className="text-slate-500 text-[12px] font-medium mt-1">
            Auditing user birth details and portal engagement
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search identity or city..."
            className="w-full bg-[#131e32] border border-slate-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-[11px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#131e32] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-600">
                Syncing Logs...
              </span>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Birth Profile</th>
                  <th className="px-6 py-4 font-bold">Origin Point</th>
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                  <th className="px-6 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[#1a2744] transition-colors group cursor-pointer"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-white font-black text-[13px]">
                              {req.name}
                            </p>
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold mt-0.5">
                              <Phone size={10} /> {req.mobile}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                            <Calendar size={12} className="text-slate-500" />
                            {new Date(req.dob).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={12} className="text-slate-500" />
                            {req.tob}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={14}
                            className="text-orange-500/60 mt-0.5 shrink-0"
                          />
                          <div>
                            <p className="text-slate-300 font-bold">{req.pob}</p>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 uppercase font-black tracking-tighter mt-1 inline-block">
                              {req.gender}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-500 font-bold text-[10px] uppercase">
                          {new Date(req.created_at).toLocaleString("en-IN", {
                            dateStyle: "medium",
                          })}
                        </p>
                        <p className="text-slate-600 text-[9px] mt-1">
                          {new Date(req.created_at).toLocaleString("en-IN", {
                            timeStyle: "short",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(req);
                            }}
                            className="p-2.5 bg-slate-800 text-slate-400 hover:text-orange-500 rounded-xl transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(req.id);
                            }}
                            className="p-2.5 bg-slate-800 text-slate-400 hover:text-rose-500 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-16 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]"
                    >
                      No audit logs discovered
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Service Window: Detail View */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#131e32] w-full max-w-xl rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-[#0f172a]/50">
              <div>
                <h2 className="text-lg font-black text-white">Log Details</h2>
                <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                  Kundli Generation Insight
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-8 py-8 space-y-8 scrollbar-hide">
              {/* Profile Card */}
              <div className="p-6 bg-[#0b1120] rounded-3xl border border-slate-800 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0">
                  <User size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {selectedRequest.name}
                  </h3>
                  <p className="text-orange-500 font-black text-[12px] mt-1 flex items-center gap-1.5">
                    <Phone size={14} /> {selectedRequest.mobile}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon={Calendar}
                  label="Date of Birth"
                  value={new Date(selectedRequest.dob).toLocaleDateString(
                    "en-IN",
                    { dateStyle: "long" },
                  )}
                />
                <DetailCard
                  icon={Clock}
                  label="Time of Birth"
                  value={selectedRequest.tob}
                />
                <DetailCard
                  icon={MapPin}
                  label="Place of Birth"
                  value={selectedRequest.pob}
                />
                <DetailCard
                  icon={Info}
                  label="Gender / Identity"
                  value={selectedRequest.gender}
                />
              </div>

              {/* Geo Info Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  <Globe size={12} /> Geolocation Metadata
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <GeoBadge label="Latitude" value={selectedRequest.latitude} />
                  <GeoBadge
                    label="Longitude"
                    value={selectedRequest.longitude}
                  />
                  <GeoBadge
                    label="Timezone"
                    value={selectedRequest.timezone_offset}
                  />
                </div>
              </div>

              {/* Submission Status */}
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-emerald-500/60 uppercase">
                    Audit Status
                  </p>
                  <p className="text-emerald-400 font-bold text-sm">
                    Verified Submission
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">
                    Received
                  </p>
                  <p className="text-slate-400 font-bold text-[11px]">
                    {new Date(selectedRequest.created_at).toLocaleString(
                      "en-IN",
                      { dateStyle: "medium", timeStyle: "short" },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-800 bg-[#0f172a]/50">
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-full py-4 text-[11px] font-black uppercase text-slate-400 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all"
              >
                Close Audit Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Service Style) */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[110] p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#131e32] border border-slate-700/50 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 ring-1 ring-rose-500/20">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">
                Purge Record?
              </h3>
              <p className="text-slate-400 text-[12px] font-medium leading-relaxed">
                This action will permanently delete this Kundli log. This
                operation cannot be reversed once executed.
              </p>
            </div>
            <div className="flex gap-px bg-slate-800">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-5 bg-[#131e32] text-slate-400 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-5 bg-[#131e32] text-rose-500 hover:bg-rose-500/5 transition-all text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="animate-spin mx-auto" size={16} />
                ) : (
                  "Delete Log"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-[#0b1120] border border-slate-800 rounded-2xl space-y-1">
    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
      <Icon size={12} className="text-orange-500/50" /> {label}
    </div>
    <p className="text-white font-bold text-sm">{value || "N/A"}</p>
  </div>
);

const GeoBadge = ({ label, value }) => (
  <div className="px-4 py-2.5 bg-[#0b1120] border border-slate-800 rounded-xl">
    <p className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">
      {label}
    </p>
    <p className="text-slate-300 font-mono text-xs">{value || "0.00"}</p>
  </div>
);

export default AdminKundliRequests;

