import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  User,
  Mail,
  Phone,
  Save,
  MapPin,
  Check,
  Copy,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { COUNTRY_CODES } from "../../utils/countryCodes";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ProfileSection = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ✅ Securely decode or use fallbacks
  let decoded = {};
  try {
    if (token) decoded = jwtDecode(token);
  } catch (err) {
    console.error("Token decoding failed", err);
  }

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const [personalData, setPersonalData] = useState({
    name: decoded.name || "",
    email: decoded.email || "",
    phone: "",
    country_code: "+91",
    gotra: "",
    referral_code: "",
    pending_referral_discounts: 0,
  });
  const [referralPercent, setReferralPercent] = useState(10);
  const [referralMaxAmount, setReferralMaxAmount] = useState(null);
  const [referralRewards, setReferralRewards] = useState([]);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/signin");
    }
  }, [token, navigate]);

  const copyToClipboard = () => {
    const codeToCopy = personalData.referral_code || "Generating...";
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [addressData, setAddressData] = useState({
    address_line1: "",
    city: "",
    state: "",
    pincode: "",
    address_type: "home",
    is_default: true,
    addressId: null,
  });

  // ─── Fetch current profile on mount ───
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/user/get-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Check if data.user exists
        if (data && data.user) {
          setPersonalData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            country_code: data.user.country_code || "+91",
            gotra: data.user.gotra || "",
            referral_code: data.user.referral_code || "",
            pending_referral_discounts: data.user.pending_referral_discounts || 0,
          });
        }

        if (data && data.defaultAddress) {
          setAddressData({
            address_line1: data.defaultAddress.address_line1 || "",
            city: data.defaultAddress.city || "",
            state: data.defaultAddress.state || "",
            pincode: data.defaultAddress.pincode || "",
            address_type: data.defaultAddress.address_type || "home",
            is_default: true,
            addressId: data.defaultAddress.id,
          });
        }
      } catch (err) {
        console.error(
          "Profile fetch error:",
          err.response?.data || err.message,
        );
      } finally {
        setFetchLoading(false);
      }
    };
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/settings/referral_reward_referrer`);
        if (data.success) setReferralPercent(data.value);

        const maxRes = await axios.get(`${API_BASE_URL}/settings/referral_reward_max_discount`);
        if (maxRes.data.success) setReferralMaxAmount(maxRes.data.value ? Number(maxRes.data.value) : null);
      } catch (err) {
        console.error("Settings fetch error:", err);
      }
    };

    const fetchRewards = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/user/referral-rewards`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) setReferralRewards(data.rewards);
      } catch (err) {
        console.error("Rewards fetch error:", err);
      }
    };

    fetchProfile();
    fetchSettings();
    fetchRewards();
  }, []);
  // ─── Step 1 Submit: Update personal details ───
  const handlePersonalSubmit = async () => {
    if (!personalData.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!personalData.email?.trim()) {
      alert("Email is required for all users");
      return;
    }
    if (personalData.phone && personalData.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/user/update-profile`, personalData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2 Submit: Update or Add default address ───
  const handleAddressSubmit = async () => {
    const { address_line1, city, state, pincode, address_type, addressId } =
      addressData;
    if (!address_line1 || !city || !state || !pincode) {
      alert("All address fields are required");
      return;
    }
    setLoading(true);
    try {
      if (addressId) {
        // Update existing address
        await axios.put(
          `${API_BASE_URL}/user/update-address/${addressId}`,
          {
            address_line1,
            city,
            state,
            pincode,
            address_type,
            is_default: true,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        // Add new default address
        await axios.post(
          `${API_BASE_URL}/user/add-address`,
          {
            address_line1,
            city,
            state,
            pincode,
            address_type,
            is_default: true,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setSuccessMsg("Profile updated successfully!");
      setStep(1);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  // ─── Reusable styles ───
  const labelStyle =
    "text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5 block ml-1";
  const inputStyle =
    "w-full bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-orange-400 transition-all";
  const disabledStyle =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed";

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D2D2D] font-sans antialiased">
      <main className="px-4 py-10">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition-colors group"
          >
            <ChevronLeft
              className="group-hover:-translate-x-0.5 transition-transform"
              size={16}
            />
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="mb-6 px-1">
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              My Profile
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
              {step === 1 ? "Personal Details" : "Address Details"}
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <Check size={14} className="text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                {successMsg}
              </span>
            </div>
          )}

          {/* ── Step Indicator ── */}
          <div className="flex items-center mb-8 px-1">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === 1
                    ? "bg-orange-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                {step > 1 ? <Check size={14} /> : "1"}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${step === 1 ? "text-orange-500" : "text-green-500"}`}
              >
                Personal
              </span>
            </div>
            {/* Line */}
            <div
              className={`flex-1 h-[1px] mx-2 mb-4 transition-all ${step > 1 ? "bg-green-400" : "bg-gray-200"}`}
            />
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === 2
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${step === 2 ? "text-orange-500" : "text-gray-400"}`}
              >
                Address
              </span>
            </div>
          </div>

          {/* ── STEP 1: Personal Details ── */}
          {step === 1 && (
            <div className="bg-white rounded-[1.6rem] border border-orange-200 shadow-sm p-7 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={personalData.name}
                      onChange={(e) =>
                        setPersonalData({ ...personalData, name: e.target.value })
                      }
                      className={inputStyle}
                      placeholder="Your full name"
                    />
                    <User
                      size={16}
                      className="absolute right-4 top-3 text-orange-300"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Gotra</label>
                  <input
                    type="text"
                    value={personalData.gotra}
                    onChange={(e) =>
                      setPersonalData({ ...personalData, gotra: e.target.value })
                    }
                    className={inputStyle}
                    placeholder="e.g. Kashyap"
                  />
                </div>
              </div>

              <div>
                <label className={labelStyle}>Mobile Number</label>
                <div className="flex gap-2">
                  <div className="w-[80px] bg-orange-50/30 border border-orange-100 rounded-xl px-4 py-2.5 text-sm font-bold flex items-center justify-center">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={personalData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPersonalData({ ...personalData, phone: val });
                      }}
                      className={inputStyle}
                      placeholder="Phone number"
                    />
                    <Phone
                      size={16}
                      className="absolute right-4 top-3 text-orange-300"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelStyle}>Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={personalData.email}
                    onChange={(e) =>
                      setPersonalData({
                        ...personalData,
                        email: e.target.value,
                      })
                    }
                    className={inputStyle}
                    placeholder="name@example.com"
                  />
                  <Mail
                    size={16}
                    className="absolute right-4 top-3 text-orange-300"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePersonalSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      Next: Address{" "}
                      <ChevronLeft size={16} className="rotate-180" />
                    </>
                  )}
                </button>
              </div>

              {/* Referral Section */}
              <div className="mt-6 pt-6 border-t border-orange-100">
                <label className={labelStyle}>My Referral Program</label>
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-600">Referral Code</span>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-orange-600 tracking-wider">
                        {personalData.referral_code || "Generating..."}
                      </span>
                      <button 
                        type="button"
                        onClick={copyToClipboard}
                        className="p-1.5 bg-white rounded-lg border border-orange-200 text-orange-500 hover:bg-orange-600 hover:text-white transition-all active:scale-95"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-600">Available Rewards</span>
                    <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {referralRewards.length} Rewards
                    </span>
                  </div>

                  {referralRewards.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {referralRewards.map((reward) => (
                        <div key={reward.id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-orange-100">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-700">{reward.discount_percentage}% OFF Reward</span>
                            {referralMaxAmount && (
                              <span className="text-[8px] text-gray-400 font-medium">Max Discount: ₹{referralMaxAmount}</span>
                            )}
                          </div>
                          <span className="text-[9px] text-emerald-500 font-black uppercase">Pending</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[9px] text-gray-400 mt-3 leading-relaxed">
                    * Share your code with friends. Once they complete their first puja, 
                    you'll earn a reward (Current: {referralPercent}%) for your next booking!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Address Details ── */}
          {step === 2 && (
            <div className="bg-white rounded-[1.6rem] border border-orange-200 shadow-sm p-7 space-y-4">
              <div>
                <label className={labelStyle}>Address Line</label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressData.address_line1}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        address_line1: e.target.value,
                      })
                    }
                    className={inputStyle}
                    placeholder="House no, Street, Landmark"
                  />
                  <MapPin
                    size={16}
                    className="absolute right-4 top-3 text-orange-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) =>
                      setAddressData({ ...addressData, city: e.target.value })
                    }
                    className={inputStyle}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className={labelStyle}>State</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) =>
                      setAddressData({ ...addressData, state: e.target.value })
                    }
                    className={inputStyle}
                    placeholder="State"
                  />
                </div>
              </div>


              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Pincode</label>
                  <input
                    type="text"
                    value={addressData.pincode}
                    onChange={(e) =>
                      setAddressData({
                        ...addressData,
                        pincode: e.target.value,
                      })
                    }
                    className={inputStyle}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className={labelStyle}>Type</label>
                  <div className="relative">
                    <select
                      value={addressData.address_type}
                      onChange={(e) =>
                        setAddressData({
                          ...addressData,
                          address_type: e.target.value,
                        })
                      }
                      className={`${inputStyle} appearance-none pr-10 cursor-pointer`}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-300 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  onClick={handleAddressSubmit}
                  disabled={loading}
                  className="flex-2 flex-grow bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60"
                >
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfileSection;
