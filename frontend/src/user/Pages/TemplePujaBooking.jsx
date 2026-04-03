import React, { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Calendar,
  Heart,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Shirt,
  Coffee,
  Flame,
  UtensilsCrossed,
  Loader2,
  Users,
  Shield,
  Lock,
  Plus,
  CheckCircle,
  Ticket,
  Info,
  MessageSquare,
  Box,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Zap,
  Star,
  User,
  House,
  Gem,
  X,
  UserPlus,
  Check,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import HowItProcess from "../Components/HowItProcess";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ═══════════════════════════════════════════════════════════
// HELPER: Icon Mapper - Benefit names ke basis pe icons assign
// ═══════════════════════════════════════════════════════════
const getBenefitIcon = (benefitName, fallbackIndex = 0) => {
  const name = benefitName?.toLowerCase() || "";
  const iconMap = {
    peace: <Heart />,
    spiritual: <Heart />,
    calm: <Heart />,
    protection: <Shield />,
    divine: <Shield />,
    safety: <Shield />,
    prosperity: <Zap />,
    wealth: <Zap />,
    success: <Zap />,
    family: <Users />,
    bond: <Users />,
    unity: <Users />,
    harmony: <Users />,
    energy: <Sparkles />,
    positive: <Sparkles />,
    purify: <Sparkles />,
    karma: <Star />,
    balance: <Star />,
  };

  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) return icon;
  }

  const defaultIcons = [
    <Heart />,
    <Shield />,
    <Zap />,
    <Users />,
    <Sparkles />,
    <Star />,
  ];
  return defaultIcons[fallbackIndex % defaultIcons.length];
};
// ─── Member Selection Modal ───────────────────────────────────────────────────

const RELATIONS = [
  "Father",
  "Mother",
  "Spouse",
  "Wife",
  "Son",
  "Daughter",
  "Self",
];

const RASHI_OPTIONS = [
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

const MemberSelectModal = ({
  isOpen,
  onClose,
  ticketType,
  familyMembers,
  selectedMembers,
  onToggleMember,
  onConfirm,
  loadingMembers,
  onMemberAdded,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    relation: "",
    gotra: "",
    dob: "",
    rashi: "",
  });
  const [formError, setFormError] = useState("");
  const [isRashiOpen, setIsRashiOpen] = useState(false);

  if (!isOpen) return null;

  const maxAllowed = ticketType === "Couple" ? 2 : 5;
  const remaining = maxAllowed - selectedMembers.length;

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError("");
  };

  const handleAddMember = async () => {
    if (!form.name.trim() || !form.relation) {
      setFormError("Name aur Relation zaroori hai!");
      return;
    }
    const token = localStorage.getItem("token");
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/add-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ name: "", relation: "", gotra: "", dob: "", rashi: "" });
        setShowAddForm(false);
        onMemberAdded();
      } else {
        setFormError(data.message || "Something went wrong");
      }
    } catch (err) {
      setFormError("Server error. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-[#FFF9F2] border border-orange-100 focus:border-orange-400 focus:bg-white rounded-2xl p-3.5 text-gray-800 text-[14px] outline-none transition-all";
  const labelClass =
    "text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-0 md:px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 flex items-start justify-between"
          style={{ background: "linear-gradient(135deg, #E8601C, #f5a623)" }}
        >
          <div>
            {showAddForm ? (
              <>
                <h2 className="text-white font-black text-[17px] uppercase tracking-widest">
                  Add Family Member
                </h2>
                <p className="text-white/80 text-[12px] font-medium mt-1">
                  Fill details to add a new member
                </p>
              </>
            ) : (
              <>
                <h2 className="text-white font-black text-[17px] uppercase tracking-widest">
                  {ticketType === "Couple"
                    ? "Select 2 Members"
                    : "Select Members"}
                </h2>
                <p className="text-white/80 text-[12px] font-medium mt-1">
                  {ticketType === "Couple"
                    ? "Choose 2 family members for this booking"
                    : "Choose up to 5 family members"}
                </p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showAddForm && (
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormError("");
                  setIsRashiOpen(false);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all text-[12px] font-bold"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Counter pill — only list view */}
        {!showAddForm && (
          <div className="px-6 py-3 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              Selected
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-[13px] font-black ${selectedMembers.length === maxAllowed ? "text-green-600" : "text-orange-600"}`}
              >
                {selectedMembers.length} / {maxAllowed}
              </span>
              {remaining > 0 && (
                <span className="text-[11px] text-gray-400 font-medium">
                  ({remaining} more)
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── ADD MEMBER FORM ── */}
        {showAddForm ? (
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Relation */}
            <div>
              <label className={labelClass}>Relation *</label>
              <select
                name="relation"
                value={form.relation}
                onChange={handleFormChange}
                className={inputClass}
              >
                <option value="">Select relation</option>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter full name"
                className={inputClass}
              />
            </div>

            {/* DOB */}
            <div>
              <label className={labelClass}>Date of Birth</label>
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleFormChange}
                  className={inputClass}
                />
                <Calendar
                  size={16}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none"
                />
              </div>
            </div>

            {/* Rashi & Gotra */}
            <div className="grid grid-cols-2 gap-3">
              {/* Rashi dropdown */}
              <div className="relative">
                <label className={labelClass}>Rashi</label>
                <div
                  onClick={() => setIsRashiOpen(!isRashiOpen)}
                  className={`${inputClass} cursor-pointer flex justify-between items-center`}
                >
                  <span className="truncate">
                    {form.rashi ? (
                      <span className="flex items-center gap-2">
                        <span>
                          {
                            RASHI_OPTIONS.find((r) => r.name === form.rashi)
                              ?.icon
                          }
                        </span>
                        <span>{form.rashi}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">Select Rashi</span>
                    )}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-orange-300 transition-transform shrink-0 ml-1 ${isRashiOpen ? "rotate-180" : ""}`}
                  />
                </div>

                {isRashiOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsRashiOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-orange-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                      {RASHI_OPTIONS.map((r) => (
                        <div
                          key={r.name}
                          onClick={() => {
                            handleFormChange({
                              target: { name: "rashi", value: r.name },
                            });
                            setIsRashiOpen(false);
                          }}
                          className="p-3 text-sm hover:bg-orange-50 flex items-center gap-3 cursor-pointer border-b border-orange-50 last:border-none group"
                        >
                          <span className="text-xl">{r.icon}</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-800 group-hover:text-orange-600 text-[13px]">
                              {r.hindi} ({r.name})
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-medium">
                              {r.eng}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Gotra */}
              <div>
                <label className={labelClass}>Gotra</label>
                <input
                  name="gotra"
                  value={form.gotra}
                  onChange={handleFormChange}
                  placeholder="Bhardwaj"
                  className={inputClass}
                />
              </div>
            </div>

            {formError && (
              <p className="text-[12px] text-red-500 font-medium">
                {formError}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleAddMember}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl font-black text-[15px] uppercase tracking-wider bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <UserPlus size={18} /> Save Member
                </>
              )}
            </button>
          </div>
        ) : (
          /* ── MEMBERS LIST ── */
          <>
            <div className="px-6 py-4 max-h-[50vh] overflow-y-auto space-y-3">
              {loadingMembers ? (
                <div className="flex flex-col items-center py-10 gap-3">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-[13px] text-gray-400 font-medium">
                    Loading members...
                  </p>
                </div>
              ) : familyMembers.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                    <Users size={28} className="text-orange-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] font-bold text-gray-700">
                      No family members found
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1">
                      Add members to continue with {ticketType} booking
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-orange-500 text-white font-bold text-[13px] px-5 py-2.5 rounded-xl shadow-md hover:bg-orange-600 transition-all active:scale-95"
                  >
                    <UserPlus size={16} /> Add Family Member
                  </button>
                </div>
              ) : (
                <>
                  {familyMembers.map((member) => {
                    const isSelected = selectedMembers.includes(member.id);
                    const isDisabled =
                      !isSelected && selectedMembers.length >= maxAllowed;
                    return (
                      <button
                        key={member.id}
                        onClick={() => !isDisabled && onToggleMember(member.id)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left
                          ${isSelected
                            ? "border-orange-400 bg-orange-50 shadow-sm"
                            : isDisabled
                              ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                              : "border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[15px] shrink-0 transition-all
                          ${isSelected ? "bg-orange-500 text-white shadow-md" : "bg-orange-100 text-orange-500"}`}
                        >
                          {member.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-bold text-[14px] truncate ${isSelected ? "text-orange-700" : "text-gray-800"}`}
                          >
                            {member.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {member.relation && (
                              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wide">
                                {member.relation}
                              </span>
                            )}
                            {member.gotra && (
                              <span className="text-[11px] text-gray-400 font-medium">
                                • {member.gotra} gotra
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all
                          ${isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300 bg-white"}`}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-white"
                              strokeWidth={3}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-orange-200 text-orange-500 font-bold text-[13px] hover:border-orange-400 hover:bg-orange-50 transition-all"
                  >
                    <UserPlus size={15} /> Add Another Member
                  </button>
                </>
              )}
            </div>

            {familyMembers.length > 0 && (
              <div className="px-6 pb-6 pt-2 border-t border-orange-100">
                <button
                  onClick={onConfirm}
                  disabled={selectedMembers.length === 0}
                  className={`w-full py-3.5 rounded-2xl font-black text-[15px] uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2
                    ${selectedMembers.length > 0
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  <Ticket size={18} />
                  Confirm {selectedMembers.length} Member
                  {selectedMembers.length !== 1 ? "s" : ""}
                </button>
                {selectedMembers.length > 0 &&
                  selectedMembers.length < maxAllowed && (
                    <p className="text-center text-[11px] text-gray-400 mt-2 font-medium">
                      You can select up to {maxAllowed} members
                    </p>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const TemplePujaBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("Single");
  const [activeTab, setActiveTab] = useState("about");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [contributionOptions, setContributionOptions] = useState("");
  const [donations, setDonations] = useState({
    "Vastra Dan": false,
    "Anna Dan": false,
    "Deep Dan": false,
    "Brahmin Dan": false,
    "Gau Seva": false,
    "Temple Donation": false,
  });

  // ── Member Modal State ──
  const [modalOpen, setModalOpen] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  // pendingTicket = ticket user clicked but not confirmed yet
  const [pendingTicket, setPendingTicket] = useState(null);

  const sections = {
    about: useRef(null),
    benefits: useRef(null),
    contributions: useRef(null),
    process: useRef(null),
    faqs: useRef(null),
  };

  useEffect(() => {
    const fetchService = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/puja/temple-puja/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) setService(data.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/contributions/${id}`);
        const data = await res.json();
        if (data.success) {
          setContributionOptions(data.data);
        }
      } catch (err) {
        console.error("Error fetching contributions", err);
      }
    };
    if (id) fetchContributions();
  }, [id]);
  // console.log("Services---", service);
  // ── Fetch family members ──
  const fetchFamilyMembers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingMembers(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/user/get-members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFamilyMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching family members", err);
      setFamilyMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // ── Ticket click handler ──
  const handleTicketClick = (ticketLabel) => {
    if (ticketLabel === "Single") {
      setSelectedTicket("Single");
      setSelectedMemberIds([]);
      return;
    }
    // Couple or Family → pehle loading set karo, phir modal kholo
    setPendingTicket(ticketLabel);
    setSelectedMemberIds([]);
    setLoadingMembers(true); // pehle loading true
    setModalOpen(true); // phir modal open
    fetchFamilyMembers(); // data fetch
  };

  // ── Toggle member selection ──
  const handleToggleMember = (memberId) => {
    const max = pendingTicket === "Couple" ? 2 : 5;
    setSelectedMemberIds((prev) => {
      if (prev.includes(memberId)) return prev.filter((id) => id !== memberId);
      if (prev.length >= max) return prev;
      return [...prev, memberId];
    });
  };

  // ── Confirm modal selection ──
  const handleConfirmMembers = () => {
    if (selectedMemberIds.length === 0) return;
    setSelectedTicket(pendingTicket);
    setModalOpen(false);
  };

  // ── Close modal without confirming ──
  const handleCloseModal = () => {
    setModalOpen(false);
    setPendingTicket(null);
    setSelectedMemberIds([]);
  };

  // ── Navigate to add member page — no longer needed, handled inline in modal ──

  const handleTemplePayment = async () => {
    const token = localStorage.getItem("token");
    const currentBookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (!token) {
      navigate("/signin");
      return;
    }
    setIsBooking(true);

    const selectedDonationObjects = contributionList
      .filter((item) => donations[item.id])
      .map((item) => {
        const dbContribution = contributionOptions.find(
          (c) => c.name === item.title,
        );
        return {
          contribution_type_id: dbContribution?.id,
          amount: Number(item.price),
        };
      })
      .filter((d) => d.contribution_type_id);

    if (donations["Temple Donation"]) {
      const templeDonation = contributionOptions.find(
        (c) => c.name === "Temple Donation",
      );
      if (templeDonation) {
        selectedDonationObjects.push({
          contribution_type_id: templeDonation.id,
          amount: Number(templeDonation.price),
        });
      }
    }
    // const generateOTP = () => {
    //   return Math.floor(100000 + Math.random() * 900000).toString();
    // };
    // const otp = generateOTP();

    const bookingData = {
      bookingId: currentBookingId,
      // otp,
      puja_id: id,
      date: service?.dateOfStart
        ? new Date(service.dateOfStart).toLocaleDateString("en-CA")
        : new Date().toISOString().split("T")[0],
      time: service?.dateOfStart
        ? new Date(service.dateOfStart).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "10:00 AM",
      address: service?.address || "N/A",
      // city: "default city",
      city: service?.address?.split(",").at(-2)?.trim() ?? "N/A",
      // state: service?.address.split(",")[service.address.split(",").length - 1],
      state: service?.address?.split(",").at(-1) ?? "N/A",
      devoteeName: token
        ? JSON.parse(atob(token.split(".")[1])).name
        : "Guest User",
      ticket_type: selectedTicket,
      member_ids: selectedMemberIds, // ← selected members pass karo
      donations: selectedDonationObjects,
      total_price: calculateTotal(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/puja/bookingDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Server crashed");
      }

      const result = await response.json();
      // if (result.success) navigate("/my-booking");
      if (result.success) {
        if (selectedMemberIds.length > 0) {
          await fetch(`${API_BASE_URL}/puja/save-members`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              request_id: result.bookingId,
              member_ids: selectedMemberIds,
            }),
          });
        }
        navigate("/my-booking");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed: " + error.message);
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const [key, ref] of Object.entries(sections)) {
        if (
          ref.current &&
          scrollPosition >= ref.current.offsetTop &&
          scrollPosition < ref.current.offsetTop + ref.current.offsetHeight
        ) {
          setActiveTab(key);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = sections[sectionId].current;
    if (element) {
      const offset = 140;
      window.scrollTo({ top: element.offsetTop - offset, behavior: "smooth" });
    }
  };

  const getPrice = (title) => {
    const daan = Array.from(contributionOptions).filter((c) => c.name == title);
    return Number(daan[0]?.price);
  };

  const getDescription = (name) => {
    const item = Array.from(contributionOptions).find((c) => c.name === name);
    return item?.description || "";
  };

  const contributionList = [
    { id: "Vastra Dan", title: "Vastra Dan", price: getPrice("Vastra Dan"), icon: <Shirt size={16} />, sub: getDescription("Vastra Dan") || "Donate clothes to the needy" },
    { id: "Anna Dan", title: "Anna Dan", price: getPrice("Anna Dan"), icon: <Coffee size={16} />, sub: getDescription("Anna Dan") || "Provide meals to the hungry" },
    { id: "Deep Dan", title: "Deep Dan", price: getPrice("Deep Dan"), icon: <Flame size={16} />, sub: getDescription("Deep Dan") || "Light lamps at sacred temples" },
    { id: "Brahmin Dan", title: "Brahmin Dan", price: getPrice("Brahmin Dan"), icon: <UtensilsCrossed size={16} />, sub: getDescription("Brahmin Dan") || "Feed Brahmins after ceremony" },
    { id: "Gau Seva", title: "Gau Seva", price: getPrice("Gau Seva"), icon: <span className="text-xl">🐄</span>, sub: getDescription("Gau Seva") || "Feed the Gau Mata" },
  ];

  const tickets = [
    {
      label: "Single",
      person: "1 person",
      price: Number(service?.single_price || 251),
      icon: <User size={18} />,
    },
    {
      label: "Couple",
      person: "2 persons",
      price: Number(service?.couple_price || 452),
      icon: <Heart size={18} />,
    },
    {
      label: "Family",
      person: "Up to 5",
      price: Number(service?.family_price || 628),
      icon: <House size={18} />,
    },
  ];

  const calculateTotal = () => {
    const base = tickets.find((t) => t.label === selectedTicket)?.price || 0;
    const extra = contributionList.reduce(
      (acc, item) => (donations[item.id] ? acc + item.price : acc),
      0,
    );
    return (
      base +
      extra +
      (donations["Temple Donation"]
        ? Number(
          Array.from(contributionOptions).filter(
            (c) => c.name == "Temple Donation",
          )[0].price,
        )
        : 0)
    );
  };

  const selectedContributionsTotal =
    contributionList.reduce(
      (acc, item) => (donations[item.id] ? acc + item.price : acc),
      0,
    ) +
    (donations["Temple Donation"]
      ? Number(getPrice("Temple Donation") || 0)
      : 0);

  // ── Selected members names for display ──
  const selectedMemberNames = familyMembers
    .filter((m) => selectedMemberIds.includes(m.id))
    .map((m) => m.name);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
          <p className="text-orange-900 font-serif italic tracking-widest uppercase text-xs">
            Preparing Divine Experience
          </p>
        </div>
      </div>
    );

  return (
    <>
      {/* ── Member Selection Modal ── */}
      <MemberSelectModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        ticketType={pendingTicket}
        familyMembers={familyMembers}
        selectedMembers={selectedMemberIds}
        onToggleMember={handleToggleMember}
        onConfirm={handleConfirmMembers}
        loadingMembers={loadingMembers}
        onMemberAdded={fetchFamilyMembers}
      />

      {/* pb-32 on mobile so sticky CTA doesn't cover content */}
      <div className="min-h-screen bg-[#FFF4E1] p-4 md:p-6 text-gray-800 pb-32 md:pb-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-orange-700 mb-5 hover:opacity-70 transition-all"
          >
            <ChevronLeft size={18} /> Back to Selection
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
              {/* 1. HERO SECTION */}
              <div className="bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-sm">
                <div className="relative h-64 md:h-80">
                  <img
                    src={`${API_BASE_URL}/uploads/${service?.image_url}`}
                    className="w-full h-full object-cover"
                    alt="Puja"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight">
                      {service?.puja_name}
                    </h1>
                    <span className="text-white text-[13px] font-bold uppercase tracking-wider">
                      Certified Temple Ritual
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. STICKY TAB HEADER */}
              <nav className="sticky top-[76px] z-40 bg-white border border-orange-200 rounded-xl shadow-md">
                <div className="flex overflow-x-auto no-scrollbar">
                  {[
                    "about",
                    "benefits",
                    "contributions",
                    "process",
                    "faqs",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => scrollToSection(tab)}
                      className={`flex-1 px-4 md:px-6 py-4 text-[12px] md:text-[13px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] transition-all relative whitespace-nowrap ${activeTab === tab
                          ? "text-orange-600 bg-orange-50/50"
                          : "text-gray-400"
                        }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-full" />
                      )}
                    </button>
                  ))}
                </div>
              </nav>

              {/* 3. ABOUT & BENEFITS BLOCK */}
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-7">
                  <section
                    ref={sections.about}
                    className="scroll-mt-44 space-y-4"
                  >
                    <div className="flex flex-col gap-4 mb-6">
                      <span className="flex items-center gap-2 text-[14px] font-medium text-gray-500">
                        <MapPin size={16} className="text-orange-500" />{" "}
                        {service?.address}
                      </span>
                      <span className="flex items-center gap-2 text-[13px] font-medium text-gray-500">
                        <Calendar size={16} className="text-orange-500" />{" "}
                        {service?.dateOfStart &&
                          new Date(service.dateOfStart).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                      <Info size={20} /> About The Ritual
                    </div>
                    <div>
                      <p
                        className={`text-[16px] text-gray-600 leading-relaxed text-justify transition-all ${!aboutExpanded ? "line-clamp-4 md:line-clamp-none" : ""}`}
                      >
                        {service?.description}
                      </p>
                      <button
                        onClick={() => setAboutExpanded(!aboutExpanded)}
                        className="mt-2 text-orange-600 font-bold text-[13px] uppercase tracking-wider flex items-center gap-1 md:hidden"
                      >
                        {aboutExpanded ? "Read Less" : "Read More"}
                        <ChevronRight
                          size={14}
                          className={`transition-transform ${aboutExpanded ? "rotate-90" : ""}`}
                        />
                      </button>
                    </div>
                  </section>
                </div>

                <div className="border-t border-orange-100" />

                {/* BENEFITS */}
                <div className="p-5 md:p-7 bg-[#FFFDF8]">
                  <section
                    ref={sections.benefits}
                    className="scroll-mt-44 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                      <Gem size={20} /> Benefits of {service?.puja_name}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Dynamic Benefits from Backend */}
                      {service?.benefits && service.benefits.length > 0 ? (
                        service.benefits.map((benefit, index) => (
                          <BenefitSmall
                            key={benefit.id || index}
                            icon={getBenefitIcon(benefit.name, index)}
                            title={benefit.name}
                            desc={benefit.description || "Divine blessing"}
                          />
                        ))
                      ) : (
                        // Fallback: Default benefits agar backend se nahi aaye
                        <>
                          <BenefitSmall
                            icon={<Heart />}
                            title="Spiritual Peace"
                            desc="Inner calm through sacred rituals"
                          />
                          <BenefitSmall
                            icon={<Shield />}
                            title="Protection"
                            desc="Divine protection for family"
                          />
                          <BenefitSmall
                            icon={<Zap />}
                            title="Prosperity"
                            desc="Remove obstacles from path"
                          />
                          <BenefitSmall
                            icon={<Users />}
                            title="Harmony"
                            desc="Strengthen family bonds"
                          />
                          <BenefitSmall
                            icon={<Sparkles />}
                            title="Positive Energy"
                            desc="Purify soul with mantras"
                          />
                          <BenefitSmall
                            icon={<Star />}
                            title="Karma"
                            desc="Balance spiritual energies"
                          />
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* 4. SACRED CONTRIBUTIONS */}
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-7">
                  <section
                    ref={sections.contributions}
                    className="scroll-mt-44 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                      <Sparkles size={20} /> Sacred Contributions
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contributionList.map((item) => (
                        <ContributionCard
                          key={item.id}
                          item={item}
                          selected={donations[item.id]}
                          onToggle={() =>
                            setDonations((p) => ({
                              ...p,
                              [item.id]: !p[item.id],
                            }))
                          }
                        />
                      ))}
                    </div>
                  </section>
                </div>

                <div className="border-t border-orange-100" />

                {/* WHATSAPP NOTE */}
                <div className="mx-5 md:mx-7 my-5 bg-[#FFFCEB] rounded-xl p-4 md:p-5 border border-yellow-200 flex items-start gap-4">
                  <div className="p-2.5 bg-yellow-400 text-white rounded-lg shadow-sm shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-800 leading-none">
                      Temple Ritual Updates
                    </h4>
                    <p className="text-[13px] text-gray-600 mt-2">
                      The photos and videos of your puja will be shared via{" "}
                      <span className="font-bold text-gray-900">WhatsApp</span>{" "}
                      after completion.
                    </p>
                  </div>
                </div>
              </div>

              {/* PROCESS */}
              <div
                ref={sections.process}
                className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden scroll-mt-44"
              >
                <HowItProcess />
              </div>

              {/* 5. BOOKING SUMMARY — mobile only */}
              <div
                id="mobile-summary"
                className="lg:hidden bg-white rounded-2xl border border-orange-200 shadow-sm p-5"
              >
                <MobileSummarySection
                  service={service}
                  tickets={tickets}
                  selectedTicket={selectedTicket}
                  setSelectedTicket={handleTicketClick}
                  donations={donations}
                  setDonations={setDonations}
                  contributionList={contributionList}
                  calculateTotal={calculateTotal}
                  selectedContributionsTotal={selectedContributionsTotal}
                  scrollToSection={scrollToSection}
                  getPrice={getPrice}
                  selectedMemberNames={selectedMemberNames}
                />
              </div>

              {/* 6. FAQ */}
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 md:p-7 mb-4">
                <section ref={sections.faqs} className="scroll-mt-44">
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest mb-6">
                    <HelpCircle size={20} /> Frequently Asked Questions
                  </div>
                  <div className="space-y-4">
                    <FAQItem
                      q="I don't know my Gotra, what should I do?"
                      a="Don't worry! If you don't know your Gotra, our Pandit will use 'Kashyap' Gotra during the Sankalp, as it is traditionally accepted in such cases."
                    />
                    <FAQItem
                      q="Who will perform the Puja?"
                      a="Experienced Temple Priests (Pujaris) who are well-versed in Vedic traditions will conduct the ritual in your name."
                    />
                    <FAQItem
                      q="How will I know the Puja has been done?"
                      a="You will receive a video recording of the Sankalp where the priest will mention your name and Gotra clearly."
                    />
                    <FAQItem
                      q="What is the significance of Dakshina?"
                      a="Dakshina is a symbolic offering to the temple and priests to complete the spiritual exchange of the ritual."
                    />
                  </div>
                </section>
              </div>
            </div>

            {/* ── DESKTOP SIDEBAR ── */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-[100px] self-start z-30">
              <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-xl shadow-orange-50/50 space-y-6">
                {/* Ticket Selector */}
                <div>
                  <h3 className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-4">
                    Select Ticket Type
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {tickets.map((t) => (
                      <button
                        key={t.label}
                        onClick={() => handleTicketClick(t.label)}
                        className={`relative flex flex-col items-center py-4 px-2 rounded-2xl border-2 transition-all duration-300 ${selectedTicket === t.label
                            ? "border-orange-500 bg-orange-50/30 ring-4 ring-orange-50"
                            : "border-gray-100 bg-white hover:border-orange-200"
                          }`}
                      >
                        <div
                          className={`mb-2 p-2.5 rounded-xl ${selectedTicket === t.label ? "bg-orange-500 text-white shadow-md" : "bg-gray-50 text-gray-400"}`}
                        >
                          {t.icon}
                        </div>
                        <span className="text-[11px] font-bold text-gray-800">
                          {t.label}
                        </span>
                        <span className="text-[9px] text-gray-500 font-medium">
                          {t.person}
                        </span>
                        <span className="text-[12px] font-black text-orange-600">
                          ₹{t.price}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Selected members chips — desktop */}
                  {selectedMemberNames.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedMemberNames.map((name) => (
                        <span
                          key={name}
                          className="flex items-center gap-1 bg-orange-100 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-full"
                        >
                          <Check size={10} strokeWidth={3} />
                          {name}
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          setPendingTicket(selectedTicket);
                          setModalOpen(true);
                          fetchFamilyMembers();
                        }}
                        className="text-[11px] text-orange-500 font-bold underline underline-offset-2"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* Pricing breakdown */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center text-[14px] px-1">
                    <span className="text-gray-500 font-medium">
                      {selectedTicket} Ticket
                    </span>
                    <span className="font-bold text-gray-800">
                      ₹{tickets.find((t) => t.label === selectedTicket)?.price}
                    </span>
                  </div>

                  <button
                    onClick={() => scrollToSection("contributions")}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100 hover:border-orange-300 transition-all group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 text-orange-600 text-[14px] font-bold">
                      <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-all">
                        <Heart
                          size={16}
                          fill="currentColor"
                          className="text-orange-500"
                        />
                      </div>
                      <span className="font-bold text-[13px]">
                        {selectedContributionsTotal > 0
                          ? "Edit Contributions"
                          : "Add Contributions"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedContributionsTotal > 0 ? (
                        <span className="text-[14px] font-bold text-orange-600">
                          +₹{selectedContributionsTotal}
                        </span>
                      ) : (
                        <ChevronRight
                          size={16}
                          className="text-orange-400 group-hover:translate-x-1 transition-transform"
                        />
                      )}
                    </div>
                  </button>

                  <div className="flex flex-col border-y border-orange-200 py-3 px-1">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={donations["Temple Donation"]}
                          onChange={(e) =>
                            setDonations((prev) => ({
                              ...prev,
                              "Temple Donation": e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                        />
                        <span className="text-[14px] text-gray-600 font-medium group-hover:text-orange-600 transition-colors">
                          Temple Donation
                        </span>
                      </label>
                      <span className="text-[14px] font-bold text-orange-500">
                        +₹{getPrice("Temple Donation")}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1 ml-7 leading-snug">
                      {Array.from(contributionOptions).find((c) => c.name === "Temple Donation")?.description || "Helps in temple upkeep, rituals, and serving the community."}
                    </p>
                  </div>
                </div>

                {/* Trust + Pay */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-yellow-50/60 px-4 py-3 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 uppercase">
                      <ShieldCheck size={14} className="text-yellow-600" /> 100%
                      Moneyback
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-700 uppercase">
                      <Lock size={12} className="text-yellow-600" /> Secure
                      Payment
                    </div>
                  </div>

                  <button
                    onClick={() => handleTemplePayment()}
                    disabled={isBooking}
                    className="group relative w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black py-3 rounded-2xl shadow-xl shadow-orange-200/50 transition-all active:scale-[0.98] overflow-hidden"
                  >
                    <span className="relative flex items-center justify-center gap-3 text-[18px] uppercase tracking-wider">
                      {isBooking ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Ticket size={20} fill="white" />
                          Pay ₹{calculateTotal().toLocaleString()}
                        </>
                      )}
                    </span>
                  </button>

                  <div className="flex flex-col items-center gap-1 opacity-50">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      PCI DSS Compliant
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── MOBILE STICKY BOTTOM BAR ── */}
        <div
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-orange-200 shadow-2xl shadow-orange-100 px-4 py-3 cursor-pointer active:bg-orange-50 transition-colors"
          onClick={(e) => {
            if (e.target.closest("#mobile-cta-btn")) return;
            const el = document.getElementById("mobile-summary");
            if (el)
              window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                Total Amount{" "}
                <ChevronRight size={11} className="text-orange-400" />
              </p>
              <p className="text-xl font-black text-orange-600 leading-tight">
                ₹{calculateTotal().toLocaleString("en-IN")}
              </p>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-medium">
                  {selectedTicket} Ticket
                </span>
              </div>
            </div>
            <button
              id="mobile-cta-btn"
              onClick={() => handleTemplePayment()}
              disabled={isBooking}
              className="flex-1 max-w-[200px] bg-gradient-to-r from-orange-500 to-orange-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-[14px] uppercase tracking-[0.08em]"
            >
              {isBooking ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>Proceed to Pay</span>
                  <ChevronRight size={16} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   MOBILE INLINE SUMMARY
───────────────────────────────────────────── */
const MobileSummarySection = ({
  service,
  tickets,
  selectedTicket,
  setSelectedTicket, // now = handleTicketClick
  donations,
  setDonations,
  contributionList,
  calculateTotal,
  selectedContributionsTotal,
  scrollToSection,
  getPrice,
  selectedMemberNames,
}) => (
  <div className="space-y-5">
    <div>
      <h3 className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-2">
        Booking Summary
      </h3>
      <div className="flex gap-1">
        <div className="h-1 w-12 bg-orange-500 rounded-full" />
        <div className="h-1 w-4 bg-orange-100 rounded-full" />
      </div>
    </div>

    <div>
      <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        Select Ticket
      </p>
      <div className="grid grid-cols-3 gap-2">
        {tickets.map((t) => (
          <button
            key={t.label}
            onClick={() => setSelectedTicket(t.label)}
            className={`flex flex-col items-center py-2 px-2 rounded-2xl border-2 transition-all ${selectedTicket === t.label
                ? "border-orange-500 bg-orange-50 ring-2 ring-orange-100"
                : "border-gray-100 bg-white hover:border-orange-200"
              }`}
          >
            <div
              className={`mb-1.5 p-2 rounded-xl ${selectedTicket === t.label ? "bg-orange-500 text-white" : "bg-gray-50 text-gray-400"}`}
            >
              {t.icon}
            </div>
            <span className="text-[11px] font-bold text-gray-800">
              {t.label}
            </span>
            <span className="text-[9px] text-gray-500">{t.person}</span>
            <span className="text-[12px] font-black text-orange-600">
              ₹{t.price}
            </span>
          </button>
        ))}
      </div>

      {/* Selected member chips — mobile */}
      {selectedMemberNames?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {selectedMemberNames.map((name) => (
            <span
              key={name}
              className="flex items-center gap-1 bg-orange-100 text-orange-700 text-[11px] font-bold px-2.5 py-1 rounded-full"
            >
              <Check size={10} strokeWidth={3} />
              {name}
            </span>
          ))}
        </div>
      )}
    </div>

    <div className="space-y-3 pt-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-[13px] font-bold text-slate-500 tracking-wider">
          {selectedTicket} Ticket
        </span>
        <span className="text-[14px] font-bold text-slate-800">
          ₹{tickets.find((t) => t.label === selectedTicket)?.price}
        </span>
      </div>

      <button
        onClick={() => scrollToSection("contributions")}
        className="w-full flex items-center justify-between p-2 rounded-2xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 text-orange-600 text-[13px] font-bold">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <Heart size={14} fill="currentColor" className="text-orange-500" />
          </div>
          <span className="font-bold text-[13px]">
            {selectedContributionsTotal > 0
              ? "Edit Contributions"
              : "Add Contributions"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {selectedContributionsTotal > 0 ? (
            <span className="text-[13px] font-bold text-orange-600">
              +₹{selectedContributionsTotal.toLocaleString("en-IN")}
            </span>
          ) : (
            <ChevronRight size={14} className="text-orange-400" />
          )}
        </div>
      </button>

      <div className="flex flex-col border-y border-orange-200 pt-3">
        <div className="flex items-center justify-between py-1 px-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={donations["Temple Donation"]}
              onChange={(e) =>
                setDonations((prev) => ({
                  ...prev,
                  "Temple Donation": e.target.checked,
                }))
              }
              className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
            />
            <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">
              Temple Donation
            </span>
          </label>
          <span className="text-[13px] font-black text-orange-500">
            +₹{getPrice("Temple Donation")}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 mt-1 ml-7 leading-snug">
          Helps in temple upkeep, rituals, and serving the community.
        </p>
      </div>

      <div className="border-t border-dashed border-gray-300 w-full" />

      <div className="flex justify-between items-center pt-1 px-1">
        <div>
          <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
            Total Amount
          </span>
          <div className="flex items-center gap-1 text-emerald-600 mt-0.5">
            <ShieldCheck size={11} />
            <span className="text-[10px] font-bold">
              Inclusive of all taxes
            </span>
          </div>
        </div>
        <span className="text-xl font-black text-orange-600">
          ₹{calculateTotal().toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   CONTRIBUTION CARD
───────────────────────────────────────────── */
const ContributionCard = ({ item, selected, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center justify-between p-3 md:p-5 rounded-xl border transition-all shadow-sm w-full gap-2 ${selected
        ? "border-orange-400 bg-orange-50"
        : "border-orange-200 bg-white hover:border-orange-300"
      }`}
  >
    <div className="flex items-center gap-3 text-left">
      <div
        className={`hidden md:flex p-2.5 rounded-lg shrink-0 transition-all ${selected ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-500"}`}
      >
        {item.icon}
      </div>
      <div>
        <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 leading-tight">
          {item.title}
        </h4>
        <p className="text-[11px] md:text-[12px] text-gray-500 mt-0.5">
          {item.sub}
        </p>
      </div>
    </div>
    <span className="text-[13px] md:text-[16px] font-black text-orange-600 whitespace-nowrap shrink-0">
      ₹{item.price}
    </span>
  </button>
);

/* ─────────────────────────────────────────────
   BENEFIT SMALL
───────────────────────────────────────────── */
const BenefitSmall = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 bg-white p-3 md:p-5 rounded-xl border border-orange-200 transition-all shadow-sm hover:border-orange-400">
    <div className="hidden md:flex p-2.5 bg-orange-50 text-orange-500 rounded-xl shadow-sm shrink-0">
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div>
      <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 tracking-tight leading-none">
        {title}
      </h4>
      <p className="text-[11px] md:text-[13px] text-gray-500 mt-1 leading-tight font-medium">
        {desc}
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   FAQ ITEM
───────────────────────────────────────────── */
const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="py-2 cursor-pointer border-b border-orange-50 last:border-none"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="text-[14px] md:text-[15px] text-gray-700 font-bold leading-tight pr-5">
          {q}
        </span>
        <ChevronRight
          size={18}
          className={`text-orange-400 transition-transform duration-300 shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed font-medium">
          {a}
        </p>
      </div>
    </div>
  );
};

export default TemplePujaBooking;
