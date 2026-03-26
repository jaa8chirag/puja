import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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

/* ── COMPONENTS ── */
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

// ── CHANGE 1: onRefresh prop add kiya, pending/accepted logic update kiya ──
const PujaCard = ({ puja, onComplete, onRefresh }) => {
  const st = statusStyle(puja.status);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const token = localStorage.getItem("token");

  const handleNavigate = () => {
    const address = puja.address || puja.city;
    if (address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
    }
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
      if (res.data.success) {
        // OTP verify hone par list refresh karo → status accepted aayega DB se
        onRefresh();
      }
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
                <ShoppingBag size={12} />
                Samagri Kit Included
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
          {/* pending = OTP input dikhao */}
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

          {/* accepted = Complete button dikhao */}
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
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/partnerSignIn");
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
      if (res.data.success) {
        setIsOnline(pendingStatus);
      }
    } catch (e) {
      console.error("Status update failed", e);
    } finally {
      setShowStatusConfirm(false);
      setPendingStatus(null);
    }
  };
  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/partner/update-profile`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      alert("Profile Updated Successfully");
    } catch (e) {
      console.error(e);
    }
  };

  // ── UPDATED LOGIC FOR EARNINGS ──
  // Sirf 'completed' status wali pujas ka paisa jodenge
  const totalEarnings = pujas
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (Number(p.price) || 0), 0);

  // Sirf Pending/Accepted/Confirmed pujas ko 'Upcoming' mein gineinge
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
      <div className="bg-[#FDFAF4] border-b border-[#EDE8DC] sticky top-0 px-4 sm:px-6 pt-4 pb-4 z-40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowProfile(true)}
              className="relative flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center"
            >
              <User size={22} className="text-orange-500" />
              <span
                className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
              />
            </button>
            <div className="min-w-0">
              <p className="text-[15px] sm:text-base font-bold text-[#1a1208] truncate leading-tight">
                {profile?.name || "Partner"}
              </p>
              <p className="text-[12px] text-[#a89880] flex items-center gap-1 truncate font-medium">
                <MapPin size={12} /> {profile?.city || "India"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[13px] font-bold ${isOnline ? "text-green-600" : "text-gray-400"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              <button
                onClick={handleToggleClick}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isOnline ? "bg-green-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isOnline ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>
            <div
              onClick={() => {
                localStorage.clear();
                navigate("/partnerSignIn");
              }}
              className="group flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-300 hover:bg-red-50 hover:border-red-200 shadow-sm active:scale-[0.98]"
            >
              <LogOut
                size={18}
                className="text-gray-500 group-hover:text-red-600 transition-colors"
                strokeWidth={2}
              />
              <span className="text-[14px] font-bold text-gray-600 group-hover:text-red-600 transition-colors">
                Logout
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6">
        {/* STATS */}
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

        {/* TABS */}
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

        {/* CONTENT */}
        <div className="mt-6 space-y-4">
          {activeTab === "schedule" &&
            (pujas.length === 0 ? (
              <div className="text-center py-20 text-[#a89880]">
                <Calendar size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-base font-bold">No bookings yet</p>
              </div>
            ) : (
              pujas.map((puja) => (
                // ── CHANGE 3: onRefresh prop pass kiya ──
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
              {/* Hero Earnings Card */}
              <div
                className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #F97316 0%, #FBBF24 100%)",
                }}
              >
                <p className="text-[13px] font-bold text-white/80 uppercase tracking-widest">
                  Total Earnings ()
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
                    <Star size={13} fill="white" />
                    {profile?.rating || "4.9"}
                  </span>
                </div>
              </div>

              {/* Completed Pujas List */}
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

      {/* PROFILE POPUP */}
      {showProfile && profile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-[#FDFAF4] w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh] border border-[#EDE8DC]">
            <button
              onClick={() => {
                setShowProfile(false);
                setEditing(false);
              }}
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-[#F0EBE1] hover:bg-red-50 transition"
            >
              <X size={20} className="text-[#6b5840]" />
            </button>
            <h2 className="text-lg font-bold text-[#1a1208] mb-6">
              My Profile
            </h2>
            {["name", "phone", "email", "gotra"].map((f) => (
              <div key={f} className="mb-4">
                <label className="text-[12px] uppercase tracking-wider font-bold text-[#a89880]">
                  {f}
                </label>
                <input
                  value={profile[f] || ""}
                  disabled={!editing || f === "phone"}
                  onChange={(e) =>
                    setProfile({ ...profile, [f]: e.target.value })
                  }
                  className={`w-full border border-[#EDE8DC] rounded-xl px-4 py-3 mt-1.5 text-base ${!editing ? "bg-[#F5F0E8] cursor-not-allowed" : "bg-white"} font-medium`}
                />
              </div>
            ))}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-orange-400 text-white font-bold py-3.5 rounded-xl mt-5 shadow-md"
              >
                Edit Profile
              </button>
            ) : (
              <button
                onClick={handleUpdate}
                className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl mt-5 shadow-md"
              >
                Save Changes
              </button>
            )}
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
