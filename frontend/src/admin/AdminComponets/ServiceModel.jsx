import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Image,
  Tag,
  AlignLeft,
  IndianRupee,
  MapPin,
  Info,
  Clock,
  Activity,
  Plus,
  Sparkles,
  Edit,
  Layers,
  Star,
} from "lucide-react";
import {
  API,
  createBenefit,
  getBenefitsByService,
  updateBenefit,
  deleteBenefit,
} from "../../services/adminApi";
import RichTextEditor from "../../Components/RichTextEditor";

const ServiceModal = ({ close, editData, refresh }) => {
  const [form, setForm] = useState({
    puja_name: "",
    puja_type: "home_puja",
    description: "",
    status: "",
    address: "",
    about: "",
    dateOfStart: "",
    priority: 0,
    is_featured: 0,
    prices: [{ pricing_type: "standard", price: "" }],
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // Benefits State
  const [benefits, setBenefits] = useState([]);
  const [newBenefits, setNewBenefits] = useState([
    { name: "", description: "" },
  ]);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [showBenefitForm, setShowBenefitForm] = useState(false);

  const isTempleType = ["temple_puja", "pind_dan"].includes(form.puja_type);

  const handleTypeChange = (newType) => {
    const temple = ["temple_puja"].includes(newType);
    setForm({
      ...form,
      puja_type: newType,
      prices: temple
        ? [
            { pricing_type: "single", price: "" },
            { pricing_type: "couple", price: "" },
            { pricing_type: "family", price: "" },
          ]
        : [{ pricing_type: "standard", price: "" }],
    });
  };

  useEffect(() => {
    if (editData) {
      let formattedDateTime = "";
      if (editData.dateOfStart) {
        formattedDateTime = editData.dateOfStart
          .replace(" ", "T")
          .substring(0, 16);
      }

      setForm({
        puja_name: editData.puja_name || "",
        puja_type: editData.puja_type || "home_puja",
        description: editData.description || "",
        status: editData.status || "",
        address: editData.address || "",
        about: editData.about || "",
        dateOfStart: formattedDateTime,
        priority: editData.priority || 0,
        is_featured: editData.is_featured || 0,
        prices:
          editData.prices?.length > 0
            ? editData.prices
            : [{ pricing_type: "standard", price: "" }],
      });

      if (editData.image_url) {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        setPreview(`${baseUrl}${editData.image_url}`);
      }
      loadBenefits(editData.id);
    }
  }, [editData]);

  const loadBenefits = async (serviceId) => {
    try {
      const response = await getBenefitsByService(serviceId);
      if (response.data.success) {
        setBenefits(response.data.benefits || []);
      }
    } catch (error) {
      console.error("Error loading benefits:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.keys(form).forEach((key) => {
      if (key === "prices") {
        const validPrices = form.prices.filter(
          (p) => p.pricing_type && p.price,
        );
        formData.append(key, JSON.stringify(validPrices));
      } else if (key === "status") {
        // ✅ Featured OFF hai to status empty bhejo
        formData.append("status", form.is_featured === 1 ? form.status : "");
      } else {
        formData.append(key, form[key]);
      }
    });

    if (image) formData.append("image", image);

    try {
      let serviceId;
      if (editData) {
        await API.put(`/services/${editData.id}`, formData);
        serviceId = editData.id;
      } else {
        const response = await API.post(`/services`, formData);
        serviceId = response.data.serviceId;

        const validBenefits = newBenefits.filter((b) => b.name.trim() !== "");
        if (validBenefits.length > 0 && serviceId) {
          for (const benefit of validBenefits) {
            await createBenefit(serviceId, benefit);
          }
        }
      }
      refresh();
      close();
    } catch (err) {
      console.error("Error saving service:", err);
      alert("Error saving service");
    }
  };

  // --- Benefit Handlers ---
  const handleAddBenefitRow = () =>
    setNewBenefits([...newBenefits, { name: "", description: "" }]);

  const handleRemoveBenefitRow = (index) => {
    const updated = newBenefits.filter((_, i) => i !== index);
    setNewBenefits(
      updated.length > 0 ? updated : [{ name: "", description: "" }],
    );
  };

  const handleBenefitChange = (index, field, value) => {
    const updated = [...newBenefits];
    updated[index][field] = value;
    setNewBenefits(updated);
  };

  const handleSaveAllBenefits = async () => {
    const validBenefits = newBenefits.filter((b) => b.name.trim() !== "");
    if (validBenefits.length === 0) {
      alert("Kam se kam ek benefit ka naam zaroori hai");
      return;
    }
    if (!editData) {
      // ✅ For new service: just close the form — benefits will be saved on form submit
      setShowBenefitForm(false);
      return;
    }
    try {
      for (const benefit of validBenefits) {
        await createBenefit(editData.id, benefit);
      }
      await loadBenefits(editData.id);
      setNewBenefits([{ name: "", description: "" }]);
      setShowBenefitForm(false);
      alert("Benefits saved successfully!");
    } catch (error) {
      alert("Error saving benefits");
    }
  };

  const handleUpdateBenefit = async () => {
    if (!editingBenefit || !editingBenefit.name.trim()) return;
    try {
      const response = await updateBenefit(editingBenefit.id, {
        name: editingBenefit.name,
        description: editingBenefit.description,
      });
      if (response.data.success) {
        await loadBenefits(editData.id);
        setEditingBenefit(null);
      }
    } catch (error) {
      alert("Error updating benefit");
    }
  };

  const handleDeleteBenefit = async (benefitId) => {
    if (!confirm("Delete this benefit?")) return;
    try {
      const response = await deleteBenefit(benefitId);
      if (response.data.success) await loadBenefits(editData.id);
    } catch (error) {
      alert("Error deleting benefit");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-center items-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-[#131e32] w-full max-w-2xl rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-slate-800 bg-[#0f172a]/50">
          <div>
            <h2 className="text-lg font-black text-white">
              {editData ? "Edit Service" : "Create New Service"}
            </h2>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
              Service Management
            </p>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-8 py-6 space-y-6 scrollbar-hide"
        >
          {/* Row 1: Service Name + Featured Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Name */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block px-1">
                Service Name
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={form.puja_name}
                  onChange={(e) =>
                    setForm({ ...form, puja_name: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-[#0b1120] border border-slate-700 rounded-2xl text-sm text-white focus:border-orange-500 outline-none"
                  placeholder="e.g. Navratri Special Puja"
                />
              </div>
            </div>

            {/* Featured Toggle + Status */}
            <div className="space-y-3">
              {/* ✅ Featured Toggle */}
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block px-1">
                Featured Status
              </label>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setForm({
                    ...form,
                    is_featured: form.is_featured === 1 ? 0 : 1,
                    status: form.is_featured === 1 ? "" : form.status,
                  });
                }}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                  form.is_featured === 1
                    ? "bg-orange-500/20 border-orange-500 text-orange-400"
                    : "bg-[#0b1120] border-slate-700 text-slate-500"
                }`}
              >
                <div
                  className={`w-9 h-5 rounded-full transition-all duration-300 flex items-center px-1 ${
                    form.is_featured === 1 ? "bg-orange-500" : "bg-slate-600"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-all duration-300 ${
                      form.is_featured === 1 ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
                <Star
                  size={14}
                  fill={form.is_featured === 1 ? "currentColor" : "none"}
                />
                <span className="text-[10px] font-black uppercase">
                  {form.is_featured === 1 ? "Featured ON" : "Featured OFF"}
                </span>
              </div>

              {/* ✅ Status input — sirf Featured ON hone pe dikhe */}
              {form.is_featured === 1 && (
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                  <input
                    type="text"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full pl-8 pr-3 py-3 bg-[#0b1120] border border-slate-700 rounded-2xl text-[10px] text-white focus:border-orange-500 outline-none"
                    placeholder="Label (e.g. 10% Off)"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Category Type + Sorting Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Type */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block px-1">
                Category Type
              </label>
              <select
                value={form.puja_type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1120] border border-slate-700 rounded-2xl text-sm text-white outline-none focus:border-orange-500"
              >
                <option value="home_puja">Home Puja</option>
                <option value="katha">Katha</option>
                <option value="temple_puja">Temple Puja</option>
                <option value="pind_dan">Temple Pind Dan</option>
                <option value="online_pind_dan">Online Pind Dan</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block px-1 flex items-center gap-2">
                <Layers size={12} /> Sorting Priority
              </label>
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                  className="w-full pl-11 pr-4 py-3 bg-[#0b1120] border border-slate-700 rounded-2xl text-sm text-white focus:border-orange-500 outline-none"
                  placeholder="Higher number = Top position"
                />
              </div>
            </div>
          </div>

          {/* Description - Full Width - Auto Height */}
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase mb-1.5 block px-1">
              Description
            </label>
            <div className="relative pt-2">
              <RichTextEditor
                value={form.description}
                onChange={(val) => setForm({ ...form, description: val })}
                placeholder="Enter service description..."
              />
            </div>
          </div>

          {/* Temple Schedule - Full Width with Auto Height */}
          {isTempleType && (
            <div className="p-6 bg-[#0f172a] rounded-3xl border border-orange-500/20 space-y-4">
              <div className="flex items-center gap-2 text-orange-400 font-black text-[10px] uppercase tracking-tighter mb-2">
                <MapPin size={14} /> Schedule & Location
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0b1120] border border-slate-800 rounded-2xl text-sm text-white outline-none focus:border-orange-400"
                  placeholder="Address"
                />
                <input
                  type="datetime-local"
                  value={form.dateOfStart}
                  onChange={(e) =>
                    setForm({ ...form, dateOfStart: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#0b1120] border border-slate-800 rounded-2xl text-sm text-white outline-none focus:border-orange-400"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="pt-2">
                <RichTextEditor
                  value={form.about}
                  onChange={(val) => setForm({ ...form, about: val })}
                  placeholder="About significance..."
                />
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 px-1">
              <IndianRupee size={12} /> Pricing Configurations
            </label>
            <div className="grid grid-cols-1 gap-3">
              {form.prices.map((p, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#0b1120] p-2 rounded-2xl border border-slate-700"
                >
                  <span className="text-xs text-orange-400 font-bold px-2 capitalize shrink-0 w-20">
                    {p.pricing_type}
                  </span>
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => {
                      const up = [...form.prices];
                      up[index].price = e.target.value;
                      setForm({ ...form, prices: up });
                    }}
                    className="bg-transparent flex-1 min-w-0 text-sm text-white outline-none"
                    placeholder="Price"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="p-6 bg-gradient-to-br from-purple-950/30 to-blue-950/20 rounded-3xl border border-purple-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-black text-[10px] uppercase tracking-tighter">
                <Sparkles size={14} /> Service Benefits
              </div>
              <button
                type="button"
                onClick={() => setShowBenefitForm(!showBenefitForm)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-xl text-[10px] font-bold text-purple-300 transition hover:bg-purple-500/30"
              >
                <Plus size={12} />{" "}
                {showBenefitForm ? "Hide Form" : "Add Benefits"}
              </button>
            </div>

            {showBenefitForm && (
              <div className="p-4 bg-[#0b1120] rounded-2xl border border-purple-500/20 space-y-3">
                {newBenefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="p-3 bg-[#0f172a] rounded-xl border border-slate-700 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-500">
                        Benefit #{index + 1}
                      </span>
                      {newBenefits.length > 1 && (
                        <X
                          size={12}
                          className="text-red-400 cursor-pointer"
                          onClick={() => handleRemoveBenefitRow(index)}
                        />
                      )}
                    </div>
                    <input
                      type="text"
                      value={benefit.name}
                      onChange={(e) =>
                        handleBenefitChange(index, "name", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-[#0b1120] border border-slate-700 rounded-xl text-sm text-white outline-none"
                      placeholder="Benefit name (e.g. Peace of Mind)"
                    />
                    <textarea
                      value={benefit.description}
                      onChange={(e) => {
                        handleBenefitChange(
                          index,
                          "description",
                          e.target.value,
                        );
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                      className="w-full px-4 py-2 bg-[#0b1120] border border-slate-700 rounded-xl text-sm text-white outline-none resize-none overflow-hidden min-h-[60px]"
                      placeholder="Description (optional)"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddBenefitRow}
                  className="w-full py-2 border border-dashed border-purple-500/30 rounded-xl text-[11px] font-bold text-purple-400 hover:bg-purple-500/10 transition"
                >
                  + Add Another Benefit
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllBenefits}
                  className="w-full py-2.5 bg-purple-500 rounded-xl text-[11px] font-bold text-white uppercase"
                >
                  {editData ? "Save Benefits Now" : "✓ Confirm Benefits (saved on Deploy)"}
                </button>
                {!editData && (
                  <p className="text-[10px] text-center text-purple-300/60 italic">
                    Benefits will be saved automatically when you click "Deploy Service"
                  </p>
                )}
              </div>
            )}

            {/* Existing/Preview Benefits List */}
            <div className="space-y-2">
              {(editData ? benefits : newBenefits.filter((b) => b.name)).map(
                (b, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#0b1120] rounded-xl border border-slate-700 flex justify-between items-center group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.name}</h4>
                      <p className="text-xs text-slate-400">{b.description}</p>
                    </div>
                    {editData && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        {/* <Edit
                          size={14}
                          className="text-purple-400 cursor-pointer"
                          onClick={() => setEditingBenefit(b)}
                        /> */}
                        <Trash2
                          size={14}
                          className="text-red-400 cursor-pointer"
                          onClick={() => handleDeleteBenefit(b.id)}
                        />
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="pt-2">
            <label className="block group cursor-pointer">
              <div
                className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                  preview
                    ? "border-orange-500/50 bg-orange-500/5"
                    : "border-slate-800 hover:border-slate-600"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    className="h-32 mx-auto rounded-2xl shadow-lg"
                    alt="preview"
                  />
                ) : (
                  <div className="text-slate-600 flex flex-col items-center gap-2">
                    <Image size={32} className="opacity-30" />
                    <span className="text-[11px] font-bold uppercase">
                      Upload Banner
                    </span>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-800 flex gap-4 bg-[#0f172a]/50">
          <button
            onClick={close}
            className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400 border border-slate-800 rounded-2xl hover:bg-slate-800"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            className="flex-[2] py-4 text-[11px] font-black uppercase text-white bg-orange-500 rounded-2xl hover:bg-orange-600 shadow-xl shadow-orange-900/40 active:scale-95 transition-all"
          >
            {editData ? "Update Service" : "Deploy Service"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
