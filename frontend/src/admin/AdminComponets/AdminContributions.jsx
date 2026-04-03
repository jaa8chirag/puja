import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  Loader2
} from "lucide-react";
import { API } from "../../services/adminApi";

const AdminContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    is_active: 1,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await API.get("/contributions");
      const result = response.data;
      if (result && result.success && Array.isArray(result.data)) {
        setContributions(result.data);
      } else if (Array.isArray(result)) {
        setContributions(result);
      } else {
        setContributions([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setContributions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editData) {
        await API.put(`/contributions/${editData.id}`, formData);
      } else {
        await API.post("/createContribution", formData);
      }
      setOpenModal(false);
      fetchContributions();
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Error saving data. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/contributions/${deleteTarget.id}`);
      setDeleteModal(false);
      fetchContributions();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-0">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <HeartHandshake className="text-orange-500" /> Contributions
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage donation types, pricing & descriptions
          </p>
        </div>
        <button
          onClick={() => {
            setEditData(null);
            setFormData({ name: "", price: "", is_active: 1, description: "" });
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-orange-900/20"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#131e32] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[10px]">
              <th className="px-6 py-4 text-left font-bold">Name</th>
              <th className="px-6 py-4 text-left font-bold">Description</th>
              <th className="px-6 py-4 text-center font-bold">Price</th>
              {/* <th className="px-6 py-4 text-center font-bold">Status</th> */}
              <th className="px-6 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Loader2
                    className="animate-spin inline-block text-orange-500 mb-2"
                    size={30}
                  />
                  <p className="text-slate-500">Loading...</p>
                </td>
              </tr>
            ) : contributions.length > 0 ? (
              contributions.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#1a2744] transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-200 text-sm">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs max-w-[220px]">
                    <p className="line-clamp-2 leading-relaxed">
                      {item.description || (
                        <span className="italic text-slate-600">
                          No description
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-emerald-400 font-bold text-sm">
                    ₹{item.price}
                  </td>
                  {/* <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-[10px] uppercase ${
                        item.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {item.is_active ? (
                        <CheckCircle2 size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td> */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditData(item);
                          setFormData({
                            name: item.name,
                            price: item.price,
                            is_active: item.is_active,
                            description: item.description || "",
                          });
                          setOpenModal(true);
                        }}
                        className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteTarget(item);
                          setDeleteModal(true);
                        }}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-slate-500 font-medium italic"
                >
                  No data found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-white mb-6">
              {editData ? "Edit Contribution" : "Add New Contribution"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                  Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="e.g. Donate clothes to the needy"
                  className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1 resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                  Price (₹)
                </label>
                <input
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="w-full bg-[#131e32] border border-slate-800 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all mt-1"
                />
              </div>

              <div className="flex items-center gap-3 bg-[#131e32] p-4 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={Boolean(formData.is_active)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked ? 1 : 0,
                    })
                  }
                  className="w-4 h-4 accent-orange-500 cursor-pointer"
                  id="is_active"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm text-slate-300 font-bold cursor-pointer"
                >
                  Show as Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Save Details"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#0f1117] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-2">🗑️</div>
            <h2 className="text-white font-bold mb-2">
              Delete {deleteTarget?.name}?
            </h2>
            <p className="text-slate-500 text-xs mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="flex-1 py-2 text-slate-400 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContributions;