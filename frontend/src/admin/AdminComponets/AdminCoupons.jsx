import React, { useState, useEffect } from "react";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Calendar, 
  Users, 
  Percent, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  X 
} from "lucide-react";
import { adminGetCoupons, adminCreateCoupon, adminDeleteCoupon } from "../../services/adminApi";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_percentage: "",
    usage_limit: "",
    expiry_date: ""
  });

  const fetchData = async () => {
    try {
      const res = await adminGetCoupons();
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error("Fetch Coupons Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await adminCreateCoupon(formData);
      if (res.data.success) {
        setShowModal(false);
        setFormData({ code: "", discount_percentage: "", usage_limit: "", expiry_date: "" });
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await adminDeleteCoupon(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete coupon");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="text-orange-500" />
            Coupon Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Create and track discount coupons for your rituals and services.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} />
          Create New Coupon
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Ticket size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{coupons.length}</div>
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Coupons</div>
          </div>
        </div>
        <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {coupons.filter(c => c.is_active).length}
            </div>
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active Coupons</div>
          </div>
        </div>
        <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {coupons.reduce((acc, c) => acc + (c.used_count || 0), 0)}
            </div>
            <div className="text-gray-500 text-xs font-medium uppercase tracking-wider">Total Redemptions</div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#161b27] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Usage</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Expiry</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-bold border border-orange-500/20 text-sm">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-white font-black text-base">
                      <Percent size={14} className="text-orange-500" />
                      {coupon.discount_percentage}%
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                        <span>Redeemed</span>
                        <span>{coupon.used_count}/{coupon.usage_limit}</span>
                      </div>
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-orange-500 transition-all duration-500"
                          style={{ width: `${Math.min((coupon.used_count / coupon.usage_limit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar size={14} className="opacity-50" />
                      {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString("en-IN") : "No Limit"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {coupon.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                    No coupons found. Create your first discount offer!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#0f1117] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06]">
              <h3 className="text-xl font-bold text-white">Create Coupon</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-500 text-sm font-medium">
                  <AlertCircle size={18} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Coupon Code</label>
                  <input 
                    type="text"
                    placeholder="e.g. WELCOME10"
                    required
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all font-bold uppercase"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Discount %</label>
                    <div className="relative">
                      <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input 
                        type="number"
                        placeholder="10"
                        required
                        min="1"
                        max="100"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all font-bold"
                        value={formData.discount_percentage}
                        onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Usage Limit</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input 
                        type="number"
                        placeholder="100"
                        required
                        min="1"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500 transition-all font-bold"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 block ml-1">Expiry Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type="date"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all font-medium"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/[0.04] text-gray-300 font-bold py-3.5 rounded-xl hover:bg-white/[0.08] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
