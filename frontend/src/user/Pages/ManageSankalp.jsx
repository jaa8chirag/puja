import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  Users,
  Plus,
  ShieldCheck,
  User,
  Trash2,
  X,
  Calendar,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ManageSankalp = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRashiOpen, setIsRashiOpen] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    gotra: "",
    dob: "",
    rashi: "",
  });

  const rashiOptions = [
    { name: "Mesh", hindi: "मेष", icon: "♈", eng: "Aries" },
    { name: "Vrish", hindi: "वृष", icon: "♉", eng: "Taurus" },
    { name: "Mithun", hindi: "मिथुन", icon: "♊", eng: "Gemini" },
    { name: "Karka", hindi: "कर्क", icon: "♋", eng: "Cancer" },
    { name: "Simha", hindi: "सिंह", icon: "♌", eng: "Leo" },
    { name: "Kanya", hindi: "कन्या", icon: "♍", eng: "Virgo" },
    { name: "Tula", hindi: "तुला", icon: "♎", eng: "Libra" },
    { name: "Vrishchik", hindi: "वृश्चिक", icon: "♏", eng: "Scorpio" },
    { name: "Dhanu", hindi: "धनु", icon: "♐", eng: "Sagittarius" },
    { name: "Makar", hindi: "मकर", icon: "♑", eng: "Capricorn" },
    { name: "Kumbh", hindi: "कुंभ", icon: "♒", eng: "Aquarius" },
    { name: "Meen", hindi: "मीन", icon: "♓", eng: "Pisces" },
  ];

  const rashiSymbols = {
    mesh: "♈",
    vrish: "♉",
    mithun: "♊",
    karka: "♋",
    simha: "♌",
    kanya: "♍",
    tula: "♎",
    vrishchik: "♏",
    dhanu: "♐",
    makar: "♑",
    kumbh: "♒",
    meen: "♓",
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/get-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", relation: "", gotra: "", dob: "", rashi: "" });
        fetchMembers();
      }
    } catch (error) {
      console.log("Add error:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this family member?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/delete-member/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMembers(members.filter((m) => m.id !== id));
      }
    } catch (error) {
      console.log("Delete error:", error);
    }
  };

  const inputClass =
    "w-full bg-[#FFF9F2] border border-orange-100 focus:border-orange-400 focus:bg-white rounded-2xl p-3.5 text-[#1A2B47] text-sm outline-none transition-all";
  const labelClass =
    "text-[10px] font-bold text-[#8E97A4] uppercase ml-1 mb-1.5 block tracking-wider";

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-6 font-sans antialiased">
      <div className="max-w-xl mx-auto">
        {/* Header Section */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 mb-8 text-[#1A2B47] font-bold hover:text-orange-500 transition-all"
        >
          <ChevronLeft size={20} strokeWidth={3} />
          <span className="text-sm">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
              Manage Sankalp
            </h1>
            <p className="text-[#8E97A4] text-[11px] font-bold tracking-[0.15em] uppercase mt-1">
              Family details for sacred rituals
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-4 bg-[#FF822D] text-white py-2 rounded-[12px] flex justify-center items-center gap-2 font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            <Plus
              size={16}
              strokeWidth={3}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* Members List */}
        {loading ? (
          <div className="py-20 text-center text-orange-400 animate-pulse font-bold italic">
            Connecting...
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white rounded-[32px] py-16 px-8 text-center shadow-sm border border-orange-200 mb-8">
            <Users size={40} className="text-orange-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#1A2B47] mb-3">
              No family members yet
            </h2>
          </div>
        ) : (
          <div className="space-y-4 mb-10">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white p-5 rounded-[28px] shadow-sm border border-orange-100 group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFF9F2] text-[#FF822D] rounded-2xl">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1A2B47] leading-none mb-1.5 capitalize">
                        {member.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 bg-orange-100 text-[#FF822D] text-[10px] font-extrabold uppercase rounded-lg">
                        {member.relation}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-orange-50">
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#8E97A4] font-bold uppercase mb-0.5">
                      Birthday
                    </span>
                    <div className="flex items-center gap-1 text-[#1A2B47]">
                      <Calendar size={15} className="text-orange-300" />
                      <span className="text-[14px] font-bold">
                        {member.dob
                          ? new Date(member.dob).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#8E97A4] font-bold uppercase mb-0.5">
                      Rashi
                    </span>
                    <div className="flex items-center gap-2 text-[#1A2B47]">
                      <span className="text-lg leading-none">
                        {member.rashi
                          ? rashiSymbols[member.rashi.toLowerCase().trim()] ||
                            "✨"
                          : "—"}
                      </span>
                      <span className="text-[14px] font-bold">
                        {member.rashi || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] text-[#8E97A4] font-bold uppercase mb-0.5">
                      Gotra
                    </span>
                    <div className="flex items-center gap-1 text-[#1A2B47]">
                      <Heart size={15} className="text-orange-300" />
                      <span className="text-[14px] font-bold truncate">
                        {member.gotra || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL POP-UP */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-t-[40px] md:rounded-[32px] p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#1A2B47]">
                    Add Member
                  </h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Ritual Details
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-gray-50 rounded-full text-gray-400"
                >
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Relation */}
                <div>
                  <label className={labelClass}>Relation *</label>
                  <select
                    name="relation"
                    required
                    value={formData.relation}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select relation</option>
                    <option value="Self">Self</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Wife">Wife</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    name="name"
                    required
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                    className={inputClass}
                  />
                </div>

                {/* DOB */}
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <div className="relative">
                    <input
                      name="dob"
                      type="date"
                      value={formData.dob}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <Calendar
                      size={16}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Rashi & Gotra Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className={labelClass}>Rashi</label>
                    <div
                      onClick={() => setIsRashiOpen(!isRashiOpen)}
                      className={`${inputClass} cursor-pointer flex justify-between items-center`}
                    >
                      <span className="truncate">
                        {formData.rashi ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {
                                rashiOptions.find(
                                  (r) => r.name === formData.rashi,
                                )?.icon
                              }
                            </span>
                            <span>{formData.rashi}</span>
                          </div>
                        ) : (
                          "Select Rashi"
                        )}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-orange-300 transition-transform ${isRashiOpen ? "rotate-180" : ""}`}
                      />
                    </div>

                    {isRashiOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsRashiOpen(false)}
                        ></div>
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-orange-100 rounded-2xl shadow-2xl z-50 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                          {rashiOptions.map((r) => (
                            <div
                              key={r.name}
                              onClick={() => {
                                handleChange({
                                  target: { name: "rashi", value: r.name },
                                });
                                setIsRashiOpen(false);
                              }}
                              className="p-3 text-sm hover:bg-orange-50 flex items-center justify-between cursor-pointer border-b border-orange-50 last:border-none group"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xl">{r.icon}</span>
                                <div className="flex flex-col">
                                  <span className="font-bold text-[#1A2B47] group-hover:text-orange-600">
                                    {r.hindi} ({r.name})
                                  </span>
                                  <span className="text-[10px] text-gray-400 uppercase font-medium">
                                    {r.eng}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Gotra</label>
                    <input
                      name="gotra"
                      type="text"
                      value={formData.gotra}
                      onChange={handleChange}
                      placeholder="Bhardwaj"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1A2B47] text-white py-4 rounded-2xl font-bold mt-4 shadow-lg active:scale-95 transition-all"
                >
                  Save Details
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-[#8E97A4] font-bold text-[10px] tracking-[0.15em] uppercase">
          <ShieldCheck size={14} className="text-emerald-500" />
          100% Secure & Private
        </div>
      </div>
    </div>
  );
};

export default ManageSankalp;
