import React, { useEffect, useState } from 'react';
import { ChevronLeft, MapPin, Plus, Trash2, Edit2, X, ShieldCheck, Home, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SavedAddresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;


  // Modal aur Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "Home",
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/get-addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAddresses(data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // Modal opening logic (for both Add and Edit)
  const openModal = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        ...address,
        is_default: address.is_default === 1 // DB ka 1 yahan true ban jayega
      });
    } else {
      setEditingId(null);
      setFormData({ address_line1: "", city: "", state: "", pincode: "", address_type: "Home", is_default: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    // Data conversion: Backend expects 1/0 for checkbox values
    const dataToSend = {
      ...formData,
      is_default: formData.is_default ? 1 : 0
    };

    const url = editingId
      ? `${API_BASE_URL}/user/update-address/${editingId}`
      : `${API_BASE_URL}/user/add-address`;

    try {
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchAddresses(); // List refresh
      } else {
        alert("Failed to save address. Please try again.");
      }
    } catch (error) {
      console.log("Submit error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/delete-address/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchAddresses();
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const inputClass = "w-full bg-[#FFF9F2] border border-orange-100 rounded-2xl p-4 text-sm outline-none focus:border-orange-400 transition-all";
  const labelClass = "text-[10px] font-bold text-[#8E97A4] uppercase ml-1 mb-1.5 block tracking-wider";

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-6 font-sans antialiased">
      <div className="max-w-xl mx-auto">

        <button onClick={() => navigate(-1)} className="flex items-center gap-1 mb-8 text-[#1A2B47] font-bold hover:text-orange-500 transition-all">
          <ChevronLeft size={20} strokeWidth={3} /> <span className="text-sm">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          {/* Left Side: Heading and Subtext */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
              Saved Addresses
            </h1>
            <p className="text-[#8E97A4] text-[11px] font-bold uppercase tracking-widest mt-1">
              Manage your delivery locations
            </p>
          </div>

          {/* Right Side: Add Button */}
          <button
            onClick={() => openModal()}
            className="w-full md:w-auto px-4 bg-[#FF822D] text-white py-2 rounded-[12px] flex justify-center items-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> Add New Address
          </button>
        </div>

        {/* List of Addresses */}
        {loading ? (
          <div className="py-20 text-center text-orange-400 animate-pulse font-bold">Loading addresses...</div>
        ) : (
          <div className="space-y-4 mb-10">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-6 rounded-[28px] border border-orange-100 shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFF9F2] text-[#FF822D] rounded-2xl">
                      {addr.address_type === "Home" ? <Home size={20} /> : <Briefcase size={20} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1A2B47] flex items-center gap-2">
                        {addr.address_type}
                        {addr.is_default === 1 && <span className="text-[9px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase">Default</span>}
                      </h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(addr)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"><Edit2 size={20} /></button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 px-1">{addr.address_line1}</p>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-orange-50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">City</span>
                    <span className="text-xs font-bold text-[#1A2B47]">{addr.city}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">State</span>
                    <span className="text-xs font-bold text-[#1A2B47]">{addr.state}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-400 font-bold uppercase">Pincode</span>
                    <span className="text-xs font-bold text-[#1A2B47]">{addr.pincode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}



        {/* --- MODAL POP-UP --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1A2B47]">{editingId ? "Edit" : "Add"} Address</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Full Address</label>
                  <textarea
                    required className={`${inputClass} h-20 resize-none`}
                    value={formData.address_line1}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input required className={inputClass} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input required className={inputClass} value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Pincode</label>
                  <input required maxLength={6} className={inputClass} value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                </div>

                <div className="flex gap-2">
                  {["Home", "Office", "Other"].map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setFormData({ ...formData, address_type: t })}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${formData.address_type === t ? "bg-[#1A2B47] text-white shadow-md" : "bg-orange-50 text-gray-400"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-3 px-1 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 accent-orange-500 rounded-lg"
                  />
                  <span className="text-sm font-bold text-gray-600">Set as default address</span>
                </label>

                <button type="submit" className="w-full bg-[#FF822D] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all mt-4">
                  {editingId ? "Update Address" : "Save Address"}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-[#8E97A4] font-bold text-[10px] tracking-widest uppercase">
          <ShieldCheck size={14} className="text-emerald-500" /> 100% Secure Storage
        </div>
      </div>
    </div>
  );
};

export default SavedAddresses;