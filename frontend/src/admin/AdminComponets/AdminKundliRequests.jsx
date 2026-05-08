
import React, { useState, useEffect } from "react";
import { Search, Trash2, Calendar, Phone, MapPin, User, Clock, AlertTriangle, X } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AdminKundliRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(`${API_BASE_URL}/admin/kundli-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      setError("Failed to fetch Kundli requests");
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
        headers: { Authorization: `Bearer ${token}` }
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
      r.pob.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🔮 Kundli Generation Logs
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Track user interest and birth details submitted via Kundli Portal
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile or city..."
            className="bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-full md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-12 text-center">
            <p className="text-slate-500">No requests found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left border-collapse bg-slate-900/40 backdrop-blur-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Birth Info</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Location</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Submitted At</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{req.name}</p>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                            <Phone size={12} /> {req.mobile}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                          <Calendar size={14} className="text-slate-500" />
                          {new Date(req.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                          <Clock size={14} className="text-slate-500" />
                          {req.tob}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase">{req.gender}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-slate-300 text-sm">{req.pob}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">
                            Lat: {req.latitude} | Lon: {req.longitude} | TZ: {req.timezone_offset}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-xs">
                        {new Date(req.created_at).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteId(req.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Log"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This action will permanently delete this Kundli request log. This cannot be undone.
              </p>
            </div>
            <div className="flex border-t border-slate-700">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-4 text-slate-400 hover:bg-slate-800 transition-colors font-semibold border-r border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-4 text-red-500 hover:bg-red-500/10 transition-colors font-bold disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKundliRequests;
