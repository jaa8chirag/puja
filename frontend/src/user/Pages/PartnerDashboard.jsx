import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  LogOut,
  X,
  Navigation,
  ShoppingBag,
  IndianRupee,
  Star,
  CheckCircle,
  Mail,
  Home,
  ChevronDown,
  Building2,
  CreditCard,
  Hash,
  Smartphone,
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
];

/* ── HELPERS ── */
const fmtDate = (d) => {
  if (!d) return "N/A";
  const date = new Date(d);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(/ /g, "-");
};

const formatTime = (timeString) => {
  if (!timeString) return "09:00 AM";
  const [hour, minute] = timeString.split(":");
  let hh = parseInt(hour);
  const mm = minute;
  const suffix = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${hh.toString().padStart(2, "0")}:${mm} ${suffix}`;
};

const statusStyle = (s = "") => {
  const map = {
    accepted: { bg: "bg-blue-100", text: "text-blue-600", label: "Accepted" },
    confirmed: { bg: "bg-amber-400", text: "text-white", label: "Confirmed" },
    completed: {
      bg: "bg-green-100",
      text: "text-green-600",
      label: "Completed",
    },
    cancelled: { bg: "bg-red-100", text: "text-red-500", label: "Cancelled" },
    pending: { bg: "bg-gray-100", text: "text-gray-500", label: "Pending" },
  };
  return (
    map[s.toLowerCase()] || {
      bg: "bg-gray-100",
      text: "text-gray-500",
      label: s,
    }
  );
};

/* ── STEP INDICATOR (Clickable Fix) ── */
const ProfileStepIndicator = ({ currentStep, setStep }) => {
  const steps = [
    { label: "Personal", num: 1 },
    { label: "Payment", num: 2 },
  ];
  return (
    <div className="flex items-center justify-center w-full gap-0 mb-1">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center">
          <div
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setStep(step.num)}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300
              ${
                currentStep > step.num
                  ? "bg-orange-500 border-orange-500 text-white"
                  : currentStep === step.num
                    ? "bg-white border-orange-500 text-orange-500 shadow-md shadow-orange-100"
                    : "bg-white border-gray-200 text-gray-300"
              } group-hover:scale-110`}
            >
              {currentStep > step.num ? <CheckCircle2 size={14} /> : step.num}
            </div>
            <span
              className={`text-[9px] font-black uppercase tracking-wider mt-1 transition-colors ${currentStep === step.num ? "text-orange-500" : "text-gray-300 group-hover:text-gray-500"}`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-[2px] mb-4 mx-1 transition-all duration-500 ${currentStep > step.num ? "bg-orange-400" : "bg-gray-100"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── STAT CARD ── */
const StatCard = ({ icon, value, label }) => (
  <div className="flex-1 bg-[#FDFAF4] border border-[#EDE8DC] rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm min-w-0">
    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
      {icon}
    </div>
    <p className="text-2xl font-bold text-[#1a1208] tracking-tight leading-none">
      {value}
    </p>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#a89880]">
      {label}
    </p>
  </div>
);

/* ── PUJA CARD ── */
const PujaCard = ({ puja, onComplete, onRefresh }) => {
  const st = statusStyle(puja.status);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const token = localStorage.getItem("token");

  const handleNavigate = () => {
    const address = puja.address || puja.city;
    if (address)
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
  };

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) return;
    setVerifying(true);
    setOtpError("");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/partner/verify-otp`,
        { request_id: puja.request_id, otp: otpInput },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) onRefresh();
    } catch (e) {
      setOtpError(e.response?.data?.message || "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-[#FDFAF4] border border-[#EDE8DC] rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] sm:text-[18px] font-bold text-[#1a1208] leading-snug truncate">
            {puja.puja_name}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-[15px] text-[#7a6650] truncate">
              {puja.customer_name}
            </p>
            {Number(puja.samagrikit) === 1 && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                <ShoppingBag size={12} /> Samagri Kit Included
              </span>
            )}
          </div>
        </div>
        <span
          className={`flex-shrink-0 text-[12px] font-bold px-3 py-1 rounded-full ${st.bg} ${st.text}`}
        >
          {st.label}
        </span>
      </div>


      <div className="mt-4 p-3 bg-white/50 rounded-xl border border-[#EDE8DC] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-orange-400" />
          <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">Payment Status:</span>
          <span className={`text-[12px] font-bold px-3 py-0.5 rounded-full ${
            puja.payment_status === 'fully_paid' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
          }`}>
            {puja.payment_status === 'fully_paid' ? 'Fully Paid' : 'Partially Paid'}
          </span>
        </div>
        {puja.payment_status !== 'fully_paid' && (
          <div className="text-[12px] font-bold text-amber-700">
            Balance: ₹{(puja.total_price - puja.paid_amount).toLocaleString('en-IN')}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[14px] text-[#6b5840]">
        <span className="flex items-center gap-2">
          <Clock size={16} className="text-orange-400" />
          {fmtDate(puja.preferred_date)} · {formatTime(puja.preferred_time)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={16} className="text-orange-400" />
          {[puja.address, puja.city, puja.state].filter(Boolean).join(", ")}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#EDE8DC] pt-4 gap-3 flex-wrap">
        <button
          onClick={handleNavigate}
          className="flex items-center gap-2 text-[14px] font-bold text-orange-500 hover:text-orange-600 transition"
        >
          <Navigation size={15} /> Navigate
        </button>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {puja.status === "pending" && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value);
                    setOtpError("");
                  }}
                  placeholder="Enter OTP"
                  className="w-28 border border-[#EDE8DC] rounded-xl px-3 py-2 text-[13px] font-bold text-center tracking-widest outline-none focus:border-orange-400 bg-white"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={verifying}
                  className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-xl text-[13px] font-bold hover:bg-orange-600 transition"
                >
                  {verifying ? "..." : "Verify"}
                </button>
              </div>
              {otpError && (
                <span className="text-[11px] text-red-500 font-bold">
                  {otpError}
                </span>
              )}
            </div>
          )}
          {puja.status === "accepted" && (
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-green-700 transition shadow-md"
            >
              <CheckCircle size={15} /> Complete
            </button>
          )}
          <span
            className={`text-[16px] font-bold ${puja.status === "completed" ? "text-green-600" : "text-[#1a1208]"}`}
          >
            {puja.status === "completed" && "✓ "}₹{puja.price || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── MAIN DASHBOARD ── */
const PartnerDashboard = () => {
  const [pujas, setPujas] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isOnline, setIsOnline] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [profilePaymentMethod, setProfilePaymentMethod] = useState("bank");
  const [showProfileStateList, setShowProfileStateList] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileError, setProfileError] = useState("");
  const profileStateRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileStateRef.current &&
        !profileStateRef.current.contains(e.target)
      )
        setShowProfileStateList(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/partner-signin");
      return;
    }
    fetchMyPujas();
    fetchProfile();
  }, []);

  const fetchMyPujas = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/partner/my-pujas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const sorted = [...res.data.bookings].sort((a, b) => {
          const isDoneA = a.status === "completed" || a.status === "declined";
          const isDoneB = b.status === "completed" || b.status === "declined";
          if (isDoneA && !isDoneB) return 1;
          if (!isDoneA && isDoneB) return -1;
          return b.id - a.id;
        });
        setPujas(sorted);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
    }
  };

  const handleMarkAsComplete = async (id) => {
    if (!window.confirm("Is this puja completed?")) return;
    try {
      const res = await axios.put(
        `${API_BASE_URL}/partner/complete-puja/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) {
        alert("Puja marked as completed!");
        fetchMyPujas();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/partner/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProfile(res.data.user);
        setIsOnline(res.data.user.is_online === 1);
        if (res.data.user.payment_method)
          setProfilePaymentMethod(res.data.user.payment_method);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleClick = () => {
    setPendingStatus(!isOnline);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/partner/toggle-status`,
        { is_online: pendingStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.data.success) setIsOnline(pendingStatus);
    } catch (e) {
      console.error("Status update failed", e);
    } finally {
      setShowStatusConfirm(false);
      setPendingStatus(null);
    }
  };

  const handleNextToPayment = () => {
    if (!profile.name || !profile.city || !profile.state) {
      setProfileError("Kripya Name, City aur State bharen.");
      return;
    }
    if (profile.pincode && profile.pincode.length !== 6) {
      setProfileError("Pincode must be 6 digits.");
      return;
    }
    setProfileError("");
    setProfileStep(2);
    setEditing(true);
  };

  const handleUpdate = async () => {
    // Basic validation
    if (profilePaymentMethod === "upi") {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!profile.upiId || !upiRegex.test(profile.upiId)) {
        setProfileError("Invalid UPI ID. Example: name@bank");
        return;
      }
    } else if (profilePaymentMethod === "bank") {
      if (
        !profile.accountHolderName ||
        !profile.bankName ||
        !profile.bankAccountNumber
      ) {
        setProfileError("Please fill all bank details.");
        return;
      }
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!profile.ifscCode || !ifscRegex.test(profile.ifscCode)) {
        setProfileError("Invalid IFSC Code. Format: ABCD0123456");
        return;
      }
    }

    try {
      await axios.put(
        `${API_BASE_URL}/partner/update-profile`,
        { ...profile, paymentMethod: profilePaymentMethod },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEditing(false);
      setProfileError("");
      setProfileStep(1);
      alert("Profile Updated Successfully");
    } catch (e) {
      setProfileError(e.response?.data?.message || "Error updating profile");
    }
  };

  const closeProfile = () => {
    setShowProfile(false);
    setEditing(false);
    setProfileStep(1);
    setProfileError("");
  };

  const totalEarnings = pujas
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (Number(p.price) || 0), 0);
  const upcomingCount = pujas.filter(
    (p) =>
      p.status !== "completed" &&
      p.status !== "cancelled" &&
      p.status !== "declined",
  ).length;

  return (
    <div
      className="min-h-screen bg-[#FFF4E1] font-sans pb-28"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* HEADER */}
      <div className="bg-[#FDFAF4] border-b border-[#EDE8DC] sticky top-0 px-4 sm:px-6 pt-3 pb-3 z-40 shadow-sm">
        <div className="flex items-center justify-between gap-2 w-full">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shadow-sm">
              🕉
            </div>
            <h1 className="text-[17px] sm:text-xl font-black text-[#1a1208] tracking-tight">
              Pandit Dashboard
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
            {/* Status Toggle */}
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span
                className={`text-[9px] sm:text-[11px] font-black uppercase tracking-wider ${isOnline ? "text-green-600" : "text-gray-400"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              <button
                onClick={handleToggleClick}
                className={`relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-all duration-300 shadow-inner ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 left-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-white rounded-full shadow transition-all duration-300 ${isOnline ? "translate-x-4 sm:translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
            
            <div className="w-[1px] h-8 bg-[#EDE8DC] hidden sm:block"></div>

            {/* Clickable Profile (Moved to Right) */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2 min-w-0 p-1 rounded-2xl hover:bg-orange-50/50 transition-all active:scale-95 group border border-transparent hover:border-orange-100/50"
              >
                <div className="hidden sm:block min-w-0 flex-1 text-right mr-1">
                  <p className="text-[14px] font-bold text-[#1a1208] truncate leading-tight group-hover:text-orange-600 transition-colors">
                    {profile?.name || "Profile"}
                  </p>
                  <p className="text-[11px] text-[#a89880] truncate font-medium mt-0.5">
                    Settings <ChevronDown size={10} className={`inline transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`} />
                  </p>
                </div>
                <div className="relative flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-orange-100 flex items-center justify-center group-hover:shadow-md transition-all">
                  <User size={18} className="text-orange-500 sm:w-[20px] sm:h-[20px]" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#FDFAF4] ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                  />
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {showProfileDropdown && (
                <>
                  {/* Invisible Overlay for click-outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                  
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EDE8DC] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowProfile(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left group border-b border-[#EDE8DC]"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <User size={14} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1a1208]">Profile Settings</p>
                        <p className="text-[10px] text-gray-400 font-medium">Update details</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <LogOut size={14} className="text-red-600" strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-red-600">Logout</p>
                        <p className="text-[10px] text-red-400/70 font-medium">End session</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6">
        <div className="flex gap-3 mt-6">
          <StatCard
            icon={<IndianRupee size={22} />}
            value={`₹${totalEarnings.toLocaleString("en-IN")}`}
            label="Earnings"
          />
          <StatCard
            icon={<Calendar size={22} />}
            value={upcomingCount}
            label="Upcoming"
          />
          <StatCard
            icon={<Star size={22} />}
            value={profile?.rating || "4.9"}
            label="Rating"
          />
        </div>

        <div className="mt-6 bg-[#EDE8DC] rounded-2xl p-1.5 flex">
          {[
            {
              key: "schedule",
              label: "My Schedule",
              icon: <Calendar size={16} />,
            },
            {
              key: "earnings",
              label: "My Earnings",
              icon: <IndianRupee size={16} />,
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[14px] font-bold transition-all ${activeTab === t.key ? "bg-[#FDFAF4] shadow text-[#1a1208]" : "text-[#a89880] hover:text-[#6b5840]"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {activeTab === "schedule" &&
            (pujas.length === 0 ? (
              <div className="text-center py-20 text-[#a89880]">
                <Calendar size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-base font-bold">No bookings yet</p>
              </div>
            ) : (
              pujas.map((puja) => (
                <PujaCard
                  key={puja.id}
                  puja={puja}
                  onComplete={() => handleMarkAsComplete(puja.request_id)}
                  onRefresh={fetchMyPujas}
                />
              ))
            ))}
          {activeTab === "earnings" && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
                }}
              >
                <p className="text-[13px] font-bold text-white/80 uppercase tracking-widest">
                  Total Earnings
                </p>
                <p className="text-5xl font-bold text-white mt-2">
                  ₹{totalEarnings.toLocaleString("en-IN")}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-white/90 text-[13px] font-semibold">
                    <CheckCircle size={14} />
                    {pujas.filter((p) => p.status === "completed").length} Pujas
                    done
                  </span>
                  <span className="flex items-center gap-1 text-white/90 text-[13px] font-semibold">
                    <Star size={13} fill="white" /> {profile?.rating || "4.9"}
                  </span>
                </div>
              </div>
              <div className="bg-[#FDFAF4] border border-[#EDE8DC] rounded-2xl p-5 shadow-sm">
                <p className="text-[13px] font-bold uppercase tracking-widest text-[#a89880] mb-3">
                  Completed Pujas
                </p>
                {pujas.filter((p) => p.status === "completed").length === 0 ? (
                  <p className="text-center text-[#a89880] py-4">
                    No completed earnings yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pujas
                      .filter((p) => p.status === "completed")
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center border border-[#EDE8DC] rounded-xl px-4 py-3 bg-white"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                              <CheckCircle
                                size={15}
                                className="text-green-500"
                              />
                            </div>
                            <div>
                              <p className="text-[14px] font-bold text-[#1a1208]">
                                {p.puja_name}
                              </p>
                              <p className="text-[12px] text-[#a89880]">
                                {fmtDate(p.preferred_date)}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-[15px] text-green-600">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── PROFILE POPUP ── */}
      {showProfile && profile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#FDFAF4] w-full sm:max-w-[500px] rounded-t-3xl sm:rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-orange-50/50 relative overflow-y-auto max-h-[92vh]">
            <div className="sticky top-0 bg-[#FDFAF4] z-10 px-6 pt-6 pb-4 border-b border-[#EDE8DC]">
              <button
                onClick={closeProfile}
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-[#F0EBE1] hover:bg-red-50 transition"
              >
                <X size={18} className="text-[#6b5840]" />
              </button>
              <h2 className="text-xl font-serif font-black text-[#3D2B1D]">
                My Profile
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-0.5 mb-4">
                Partner Account Settings
              </p>

              {/* Profile Step Indicator Fixed */}
              <ProfileStepIndicator
                currentStep={profileStep}
                setStep={(s) => {
                  setProfileStep(s);
                  setEditing(true); // Auto-enable edit when clicking tabs
                }}
              />
            </div>

            <div className="px-6 py-5 space-y-5">
              {profileError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <p className="text-red-700 text-[10px] font-bold uppercase">
                    {profileError}
                  </p>
                </div>
              )}

              {profileStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider mb-3">
                      Personal Information
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          Full Name
                        </label>
                        <div
                          className={`flex h-12 bg-[#FBF9F7] border rounded-xl items-center transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                        >
                          <User
                            className="ml-3 text-gray-300 shrink-0"
                            size={16}
                          />
                          <input
                            disabled={!editing}
                            className="w-full px-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                            placeholder="Enter name"
                            value={profile.name || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          Gotra
                        </label>
                        <div
                          className={`flex h-12 bg-[#FBF9F7] border rounded-xl items-center transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                        >
                          <Fingerprint
                            className="ml-3 text-gray-300 shrink-0"
                            size={16}
                          />
                          <input
                            disabled={!editing}
                            className="w-full px-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                            placeholder="Optional"
                            value={profile.gotra || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, gotra: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          Mobile
                        </label>
                        <div className="flex h-12 bg-[#F5F0E8] border border-[#EDE8DC] rounded-xl items-center overflow-hidden cursor-not-allowed">
                          <span className="pl-3 text-gray-400 font-black text-xs border-r border-[#EDE8DC] pr-2 h-full flex items-center">
                            +91
                          </span>
                          <input
                            disabled
                            className="w-full px-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] cursor-not-allowed"
                            value={profile.phone || ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          Email
                        </label>
                        <div
                          className={`flex h-12 bg-[#FBF9F7] border rounded-xl items-center transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                        >
                          <Mail
                            className="ml-3 text-gray-300 shrink-0"
                            size={16}
                          />
                          <input
                            disabled={!editing}
                            className="w-full px-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                            placeholder="acharya@mail.com"
                            value={profile.email || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, email: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider mb-3">
                      Address
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          Street / Landmark
                        </label>
                        <div
                          className={`flex bg-[#FBF9F7] border rounded-xl transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                        >
                          <Home
                            className="ml-3 my-auto text-gray-300 shrink-0"
                            size={16}
                          />
                          <input
                            disabled={!editing}
                            className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                            placeholder="Street, Landmark"
                            value={profile.address || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                          className="space-y-1 relative"
                          ref={profileStateRef}
                        >
                          <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                            State
                          </label>
                          <div
                            onClick={() =>
                              editing &&
                              setShowProfileStateList(!showProfileStateList)
                            }
                            className={`flex h-12 bg-[#FBF9F7] border rounded-xl px-3 justify-between items-center transition-all ${editing ? "cursor-pointer border-gray-300 hover:border-orange-400" : "border-[#EDE8DC] cursor-not-allowed"}`}
                          >
                            <span className="text-sm font-bold text-[#3D2B1D] truncate">
                              {profile.state || "Select State"}
                            </span>
                            <ChevronDown
                              size={14}
                              className={`text-gray-300 transition-transform shrink-0 ${showProfileStateList ? "rotate-180" : ""}`}
                            />
                          </div>
                          {showProfileStateList && (
                            <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                              {INDIAN_STATES.map((s) => (
                                <div
                                  key={s}
                                  onClick={() => {
                                    setProfile({ ...profile, state: s });
                                    setShowProfileStateList(false);
                                  }}
                                  className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-xs font-bold text-[#3D2B1D] border-b border-gray-50 last:border-0"
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                            City
                          </label>
                          <div
                            className={`flex h-12 bg-[#FBF9F7] border rounded-xl px-3 items-center transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                          >
                            <input
                              disabled={!editing}
                              className="w-full bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                              placeholder="Enter City"
                              value={profile.city || ""}
                              onChange={(e) =>
                                setProfile({ ...profile, city: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                            Pincode
                          </label>
                          <div
                            className={`flex h-12 bg-[#FBF9F7] border rounded-xl px-3 items-center transition-all ${editing ? "border-gray-300 focus-within:border-orange-500" : "border-[#EDE8DC]"}`}
                          >
                            <input
                              disabled={!editing}
                              maxLength={6}
                              className="w-full bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 disabled:cursor-not-allowed"
                              placeholder="6 Digits"
                              value={profile.pincode || ""}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  pincode: e.target.value.replace(/\D/g, ""),
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 1 Buttons Navigation Fixed */}
                  <div className="flex gap-3">
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex-1 bg-white border border-orange-200 text-orange-500 font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] h-14 active:scale-[0.98] transition-all"
                      >
                        Edit Info
                      </button>
                    )}
                    <button
                      onClick={handleNextToPayment}
                      className={`${!editing ? "flex-[2]" : "w-full"} bg-orange-400 text-white font-black py-4 rounded-xl shadow-lg text-[10px] uppercase tracking-[0.2em] h-14 active:scale-[0.98] transition-all`}
                    >
                      Next: Payment Details →
                    </button>
                  </div>
                </div>
              )}

              {profileStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider mb-1">
                      Payment Details
                    </p>
                    <p className="text-[10px] text-gray-400 mb-4">
                      Payments will be sent to this account
                    </p>
                    <div className="flex bg-[#F6F3F0] p-1 rounded-xl mb-4">
                      <button
                        onClick={() => setProfilePaymentMethod("bank")}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${profilePaymentMethod === "bank" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400"}`}
                      >
                        <Building2 size={12} /> Bank Account
                      </button>
                      <button
                        onClick={() => setProfilePaymentMethod("upi")}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${profilePaymentMethod === "upi" ? "bg-white text-orange-600 shadow-sm" : "text-gray-400"}`}
                      >
                        <Smartphone size={12} /> UPI
                      </button>
                    </div>

                    {profilePaymentMethod === "bank" && (
                      <div className="space-y-4">
                        {[
                          {
                            label: "Account Holder Name",
                            field: "accountHolderName",
                            icon: (
                              <User
                                size={16}
                                className="ml-3 my-auto text-gray-300 shrink-0"
                              />
                            ),
                            placeholder: "As per bank records",
                            upper: false,
                          },
                          {
                            label: "Bank Name",
                            field: "bankName",
                            icon: (
                              <Building2
                                size={16}
                                className="ml-3 my-auto text-gray-300 shrink-0"
                              />
                            ),
                            placeholder: "e.g. State Bank of India",
                            upper: false,
                          },
                          {
                            label: "Account Number",
                            field: "bankAccountNumber",
                            icon: (
                              <CreditCard
                                size={16}
                                className="ml-3 my-auto text-gray-300 shrink-0"
                              />
                            ),
                            placeholder: "Enter account number",
                            upper: false,
                          },
                          {
                            label: "IFSC Code",
                            field: "ifscCode",
                            icon: (
                              <Hash
                                size={16}
                                className="ml-3 my-auto text-gray-300 shrink-0"
                              />
                            ),
                            placeholder: "e.g. SBIN0001234",
                            upper: true,
                          },
                        ].map(({ label, field, icon, placeholder, upper }) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                              {label}
                            </label>
                            <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                              {icon}
                              <input
                                className={`w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 ${upper ? "uppercase" : ""}`}
                                placeholder={placeholder}
                                maxLength={
                                  field === "ifscCode" ? 11 : undefined
                                }
                                value={profile[field] || ""}
                                onChange={(e) =>
                                  setProfile({
                                    ...profile,
                                    [field]: upper
                                      ? e.target.value.toUpperCase()
                                      : e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {profilePaymentMethod === "upi" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">
                          UPI ID
                        </label>
                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                          <Smartphone
                            className="ml-3 my-auto text-gray-300 shrink-0"
                            size={16}
                          />
                          <input
                            className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300"
                            placeholder="yourname@paytm / @gpay"
                            value={profile.upiId || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, upiId: e.target.value })
                            }
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 ml-1">
                          Supported: Google Pay, PhonePe, Paytm, BHIM, etc.
                        </p>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100 mt-4">
                      <ShieldCheck
                        size={14}
                        className="text-orange-400 mt-0.5 shrink-0"
                      />
                      <p className="text-[9px] text-orange-700 font-bold leading-relaxed">
                        Your payment details are end-to-end encrypted. They will
                        only be used for payment transfers.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setProfileStep(1);
                        setProfileError("");
                      }}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest h-14 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-[2] py-4 bg-green-600 text-white font-black rounded-xl shadow-lg text-[10px] uppercase tracking-[0.15em] h-14 active:scale-[0.98] transition-all"
                    >
                      Save Changes ✓
                    </button>
                  </div>
                </div>
              )}



              <div className="flex justify-center pb-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                  <ShieldCheck size={12} strokeWidth={3} /> SECURE PROFILE
                  UPDATE
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONLINE/OFFLINE CONFIRM POPUP */}
      {showStatusConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDFAF4] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#EDE8DC]">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${pendingStatus ? "bg-green-100" : "bg-gray-100"}`}
            >
              <span className="text-2xl">{pendingStatus ? "🟢" : "⚫"}</span>
            </div>
            <h3 className="text-[17px] font-bold text-[#1a1208] text-center">
              {pendingStatus ? "Go Online?" : "Go Offline?"}
            </h3>
            <p className="text-[13px] text-[#a89880] text-center mt-2 mb-6">
              {pendingStatus
                ? "You will go online and start receiving new bookings."
                : "You will go offline. New bookings will stop, but ongoing bookings will continue."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusConfirm(false);
                  setPendingStatus(null);
                }}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] bg-[#EDE8DC] text-[#6b5840] hover:bg-[#e3dcce] transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`flex-1 py-3 rounded-xl font-bold text-[14px] text-white transition shadow-md ${pendingStatus ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
              >
                {pendingStatus ? "Go Online" : "Go Offline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRM POPUP */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[#FDFAF4] w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-[#EDE8DC] text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <LogOut size={32} className="text-red-500" strokeWidth={2} />
            </div>
            <h3 className="text-[19px] font-black text-[#1a1208] mb-2">
              Logout Account?
            </h3>
            <p className="text-[13px] text-[#a89880] mb-6">
              Are you sure you want to log out of your Pandit account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] bg-[#EDE8DC] text-[#6b5840] hover:bg-[#e3dcce] transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/partner-signin");
                }}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-red-500 hover:bg-red-600 transition shadow-md"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F5F0E8] border-t border-[#EDE8DC] px-4 sm:px-6 py-4 z-40">
        <button className="w-full bg-[#EDE8DC] hover:bg-[#e3dcce] py-4 rounded-xl text-base font-bold text-[#6b5840] transition">
          🎧 Call Support
        </button>
      </div>
    </div>
  );
};

export default PartnerDashboard;
