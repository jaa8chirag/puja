import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  MessageCircle,
  Heart,
  ChevronRight,
  ChevronLeft,
  Shirt,
  Flame,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Coffee,
  Activity,
  Droplets,
  Leaf,
  Home,
  Bird,
  BookOpen,
  ShieldCheck,
  CheckCircle,
  X,
} from "lucide-react";
import CouponSelector from "../Components/CouponSelector";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const KathaPujaPaymentDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [puja, setPuja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const dharmicRef = useRef(null);

  const isSamagriSelected = location.state?.isSamagriSelected || false;
  const [contributionOptions2, setContributionOptions2] = useState([]);
  
  // 🎟️ Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const generateBookingId = () =>
    `BK-${Math.random().toString(36).substring(2, 8)}`;
  const token = localStorage.getItem("token");
  const userName = token ? JSON.parse(atob(token.split(".")[1])).name : "Guest";
  const bookingId = generateBookingId();
  // const generateOTP = () => {
  //   return Math.floor(100000 + Math.random() * 900000).toString();
  // };
  // const otp = generateOTP();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    state: "",
    city: "",
    pincode: "",
    devoteeName: userName,
    gotra: "",
  });

  const [donations, setDonations] = useState({
    "Vastra Dan": false,
    "Anna Dan": false,
    "Deep Dan": false,
    "Brahmin Dan": false,
    "Vidya Dan": false,
    "Aushadhi Dan": false,
    "Jal Dan": false,
    "Vriksh Dan": false,
    "Aashray Dan": false,
    "Jeev Daya": false,
    "Gau Seva": false,
    "Temple Donation": false,
  });

  const getPrice = (title) => {
    const daan = contributionOptions2.find((c) => c.name === title);
    return Number(daan?.price || 0);
  };

  const getDescription = (name) => {
    const item = contributionOptions2.find((c) => c.name === name);
    return item?.description || "";
  };

  const iconMap = {
    "Vastra Dan": <Shirt size={16} />,
    "Anna Dan": <Coffee size={16} />,
    "Deep Dan": <Flame size={16} />,
    "Brahmin Dan": <UtensilsCrossed size={16} />,
    "Vidya Dan": <BookOpen size={16} />,
    "Aushadhi Dan": <Activity size={16} />,
    "Jal Dan": <Droplets size={16} />,
    "Vriksh Dan": <Leaf size={16} />,
    "Aashray Dan": <Home size={16} />,
    "Jeev Daya": <Bird size={16} />,
  };

  const contributionList = [
    { id: "Vastra Dan", name: "Vastra Dan", price: getPrice("Vastra Dan"), icon: iconMap["Vastra Dan"], desc: getDescription("Vastra Dan") || "Donate clothes to the needy" },
    { id: "Anna Dan", name: "Anna Dan", price: getPrice("Anna Dan"), icon: iconMap["Anna Dan"], desc: getDescription("Anna Dan") || "Provide meals to the hungry" },
    { id: "Deep Dan", name: "Deep Dan", price: getPrice("Deep Dan"), icon: iconMap["Deep Dan"], desc: getDescription("Deep Dan") || "Light lamps at sacred temples" },
    { id: "Brahmin Dan", name: "Brahmin Dan", price: getPrice("Brahmin Dan"), icon: iconMap["Brahmin Dan"], desc: getDescription("Brahmin Dan") || "Feed Brahmins after ceremony" },
    { id: "Vidya Dan", name: "Vidya Dan", price: getPrice("Vidya Dan"), icon: iconMap["Vidya Dan"], desc: getDescription("Vidya Dan") || "Support education for children" },
    { id: "Aushadhi Dan", name: "Aushadhi Dan", price: getPrice("Aushadhi Dan"), icon: iconMap["Aushadhi Dan"], desc: getDescription("Aushadhi Dan") || "Donate medicines to the sick" },
    { id: "Jal Dan", name: "Jal Dan", price: getPrice("Jal Dan"), icon: iconMap["Jal Dan"], desc: getDescription("Jal Dan") || "Provide clean water to those in need" },
    { id: "Vriksh Dan", name: "Vriksh Dan", price: getPrice("Vriksh Dan"), icon: iconMap["Vriksh Dan"], desc: getDescription("Vriksh Dan") || "Plant trees for a greener future" },
    { id: "Aashray Dan", name: "Aashray Dan", price: getPrice("Aashray Dan"), icon: iconMap["Aashray Dan"], desc: getDescription("Aashray Dan") || "Support shelter for the homeless" },
    { id: "Jeev Daya", name: "Jeev Daya", price: getPrice("Jeev Daya"), icon: iconMap["Jeev Daya"], desc: getDescription("Jeev Daya") || "Feed and care for animals" },
  ];

  const selectedDonations = Object.keys(donations)
    .filter((key) => donations[key])
    .join(", ");
  const handlePayment = async () => {
    if (!formData.date || !formData.devoteeName || !formData.city) {
      setErrorMsg("Please fill all mandatory fields (Date, Name, City)");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    const token = localStorage.getItem("token");
    const payload = {
      puja_id: id,
      date: formData.date,
      time: formData.time,
      location: `${formData.location} - ${formData.pincode}`,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      devoteeName: formData.devoteeName,
      bookingId,
      // otp,
      donations: selectedDonations,
      total_price: grandTotal,
      samagriKit: isSamagriSelected,
      coupon_code: appliedCoupon ? appliedCoupon.code : null,
      discount_amount: discountAmount,
    };
    try {
      const response = await fetch(
        `${API_BASE_URL}/puja/home_KathaPujaBookingDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (data.success) navigate("/my-booking");
      else alert("Error: " + data.message);
    } catch (error) {
      console.error("Booking submission failed:", error);
      alert("Server error. Please check if backend is running.");
    }
  };

  useEffect(() => {
    const bookPuja = async (id) => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/puja/bookPuja/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setPuja(Array.isArray(data) ? data[0] : data);

        const res = await fetch(`${API_BASE_URL}/contributions/${id}`);
        const data2 = await res.json();
        if (data2.success) {
          setContributionOptions2(data2.data);
        }

        const addressRes = await fetch(`${API_BASE_URL}/user/default-address`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const addressData = await addressRes.json();
        if (addressData) {
          setFormData((prev) => ({
            ...prev,
            location: addressData.address_line1 || "",
            city: addressData.city || "",
            state: addressData.state || "",
            pincode: addressData.pincode || "",
          }));
        }

        // Fetch public coupons
        const publicCouponsRes = await fetch(`${API_BASE_URL}/coupons/public-coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const publicCouponsData = await publicCouponsRes.json();
        if (publicCouponsData.success) {
          setPublicCoupons(publicCouponsData.data);
        }
      } catch (error) {
        console.error("Error booking puja:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) bookPuja(id);
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDonation = (id) =>
    setDonations((prev) => ({ ...prev, [id]: !prev[id] }));

  // 🎟️ Coupon Logic
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError("");
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponInput }),
      });
      const data = await response.json();
      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponInput("");
      } else {
        setCouponError(data.message);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // const getDharmicTotal = () => {
  //   let sum = contributionOptions.reduce(
  //     (acc, opt) => (donations[opt.id] ? acc + opt.price : acc),
  //     0,
  //   );
  //   if (donations["Gau Seva"]) sum += getPrice("Gau Seva");
  //   return sum;
  // };
  const getDharmicTotal = () => {
    let sum = contributionList.reduce(
      (acc, opt) => (donations[opt.id] ? acc + opt.price : acc),
      0,
    );

    if (donations["Gau Seva"]) {
      sum += getPrice("Gau Seva") || 0;
    }

    if (donations["Temple Donation"]) {
      sum += getPrice("Temple Donation") || 0;
    }

    return sum;
  };
  const basePrice = Number(puja?.standard_price || 0);
  const samagriPrice = isSamagriSelected ? getPrice("Samagri Kit") : 0;
  const dharmicTotal = getDharmicTotal();
  // const templeDonation = donations["Temple Donation"]
  //   ? Number(
  //       Array.from(contributionOptions2).filter(
  //         (c) => c.name == "Temple Donation",
  //       )[0].price,
  //     )
  //   : 0;

  const today = new Date().toISOString().split("T")[0];
  
  const grandTotalBeforeDiscount = basePrice + samagriPrice + dharmicTotal;
  const discountAmount = appliedCoupon 
    ? Math.floor((grandTotalBeforeDiscount * appliedCoupon.discount_percentage) / 100)
    : 0;
  const grandTotal = grandTotalBeforeDiscount - discountAmount;

  const inputBaseClass =
    "w-full bg-gray-50 border border-orange-200 rounded-xl px-3 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition-all font-medium text-sm";
  const labelClass =
    "flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-700 mb-1.5 ml-1";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
        <p className="text-orange-600 font-bold animate-pulse">
          Loading Sacred Details...
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Error Alert */}
      {errorMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-white">
            <span className="text-xl">⚠️</span>
            <p className="font-bold text-sm tracking-wide">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#FFF4E1] font-sans text-[#2D2D2D] antialiased pb-28 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-orange-700 mb-5 hover:opacity-70 transition-all"
          >
            <ChevronLeft size={18} /> Back to Puja
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-8 items-start">
            <div className="lg:col-span-8 space-y-4 md:space-y-6">
              {/* 1. E-SANKALP FORM */}
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 md:p-8">
                <div className="flex items-center gap-3 mb-5 md:mb-8">
                  <div className="bg-orange-500 p-2 rounded-full text-white shadow-md">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900">
                      E-Sankalp
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                      Complete your sacred booking
                    </p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  {/* Date & Time */}
                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3 md:gap-6">
                    <div className="space-y-1">
                      <label className={labelClass}>
                        <Calendar size={12} /> Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        min={today}
                        value={formData.date}
                        onChange={handleInputChange}
                        className={inputBaseClass}
                      />
                    </div>

                    {/* ✅ Sirf yeh line badli */}
                    <HourDropdown
                      value={formData.time}
                      onChange={handleInputChange}
                      inputBaseClass={inputBaseClass}
                      labelClass={labelClass}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <label className={labelClass}>
                      <MapPin size={12} /> Full Address{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter complete address with landmarks..."
                      rows="2"
                      className={inputBaseClass}
                    />
                  </div>

                  {/* State / City / Pincode */}
                  <div className="grid grid-cols-3 gap-2 md:gap-6">
                    <div className="space-y-1">
                      <label className={labelClass}>
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className={inputBaseClass}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelClass}>PINCODE</label>
                      <input
                        type="text"
                        name="pincode"
                        maxLength="6"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        className={inputBaseClass}
                        onKeyPress={(e) =>
                          !/[0-9]/.test(e.key) && e.preventDefault()
                        }
                      />
                    </div>
                  </div>

                  {/* Sankalp Details */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold mb-0.5 flex items-center gap-2">
                      <User size={14} className="text-orange-500" /> Sankalp
                      Details
                    </h3>
                    <p className="text-[11px] text-gray-500 mb-3 font-medium">
                      These details will be used during the sacred ritual pledge
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                      <div className="space-y-1">
                        <label className={labelClass}>Devotee Name *</label>
                        <input
                          type="text"
                          name="devoteeName"
                          value={formData.devoteeName}
                          onChange={handleInputChange}
                          placeholder="Full name as per tradition"
                          className={inputBaseClass}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={labelClass}>Gotra (Lineage)</label>
                        <input
                          type="text"
                          name="gotra"
                          value={formData.gotra}
                          onChange={handleInputChange}
                          placeholder="e.g., Kashyap, Bharadwaj"
                          className={inputBaseClass}
                        />
                        <p className="text-[10px] text-gray-400 mt-1 ml-1 italic">
                          Optional — ask family elders if unknown
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Help Box */}
                  <div className="border border-dashed border-orange-200 rounded-xl bg-orange-50/20 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg border border-orange-200 shrink-0">
                        <MessageCircle size={18} className="text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">
                          Have custom requirements?
                        </h4>
                        <p className="text-xs text-gray-500 font-medium">
                          Chat with us for special requests
                        </p>
                      </div>
                    </div>
                    <button className="w-full md:w-auto bg-white border border-green-400 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-50 active:scale-95 transition-all shadow-sm">
                      <FaWhatsapp className="text-green-600 text-lg" />
                      <span className="text-green-700">WhatsApp Us</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. DHARMIC CONTRIBUTIONS */}
              <div
                ref={dharmicRef}
                className="bg-white rounded-2xl border border-orange-200 shadow-sm p-5 md:p-8 space-y-4 md:space-y-6 scroll-mt-28"
              >
                <div>
                  <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
                    <div className="bg-orange-500 p-1.5 rounded-full text-white shadow-md">
                      <Heart size={13} fill="currentColor" />
                    </div>
                    Dharmic Contributions
                  </h3>
                  <p className="text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-widest">
                    Complete your Sankalp with sacred donations
                  </p>
                </div>

                {/* Cards Grid (Top 4) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contributionList.map((option) => (
                    <ContributionCard
                      key={option.id}
                      option={option}
                      selected={donations[option.id]}
                      onToggle={() => toggleDonation(option.id)}
                    />
                  ))}
                </div>

                {/* ✅ GAU SEVA - Now in a matching Box Style */}
                <div className="mt-3">
                  <div
                    onClick={() => toggleDonation("Gau Seva")}
                    className={`p-4 flex items-center gap-3 transition-all cursor-pointer rounded-xl border-2 ${
                      donations["Gau Seva"]
                        ? "border-orange-500 bg-orange-50/30 shadow-sm"
                        : "border-orange-200 bg-white hover:border-orange-300"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        donations["Gau Seva"]
                          ? "bg-orange-500 border-orange-500"
                          : "border-orange-200 bg-white"
                      }`}
                    >
                      {donations["Gau Seva"] && (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="4"
                          className="w-3.5 h-3.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Emoji/Icon */}
                    <span className="text-xl shrink-0 ml-1">🐄</span>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 leading-tight">
                        Complete your Sankalp with Gau Seva
                      </h4>
                      <p className="text-[10px] text-gray-500 font-medium">
                        {contributionOptions2.find((c) => c.name === "Gau Seva")
                          ?.description ||
                          "Feed a cow on your behalf as a sacred gesture"}
                      </p>
                    </div>

                    {/* Price */}
                    <span className="text-orange-600 font-black text-sm whitespace-nowrap">
                      +₹{getPrice("Gau Seva") || 0}
                    </span>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="space-y-3 pt-1">
                  <div className="bg-[#F8F1E7] py-2.5 rounded-lg text-center border border-orange-200/50">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                      🙏 Fee includes Dakshina — No cash tips needed
                    </p>
                  </div>
                </div>
              </div>

              {/* MOBILE INLINE SUMMARY */}
              <div
                id="mobile-summary"
                className="lg:hidden bg-white rounded-2xl border border-orange-200 shadow-sm p-5"
              >
                  <MobileSummaryInline
                    puja={puja}
                    isSamagriSelected={isSamagriSelected}
                    basePrice={basePrice}
                    samagriPrice={samagriPrice}
                    dharmicTotal={dharmicTotal}
                    grandTotal={grandTotal}
                    donations={donations}
                    toggleDonation={toggleDonation}
                    dharmicRef={dharmicRef}
                    getPrice={getPrice}
                    contributionOptions2={contributionOptions2}
                    couponInput={couponInput}
                    setCouponInput={setCouponInput}
                    appliedCoupon={appliedCoupon}
                    handleApplyCoupon={handleApplyCoupon}
                    removeCoupon={removeCoupon}
                    isApplying={isApplying}
                    couponError={couponError}
                    discountAmount={discountAmount}
                    publicCoupons={publicCoupons}
                  />
              </div>
            </div>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-8 self-start">
              <div className="bg-white rounded-[1.5rem] border border-orange-200 shadow-lg p-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  Booking Summary
                </h3>
                <div className="space-y-4">
                  <div className="pb-4 border-b border-orange-200">
                    <h4 className="text-sm font-black text-gray-900">
                      {puja?.puja_name}
                    </h4>
                    {/* <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-bold text-gray-700">
                        Samagri Kit
                      </span>
                      <span
                        className={`text-xs font-bold ${isSamagriSelected ? "text-green-600" : "text-gray-400"}`}
                      >
                        {isSamagriSelected ? "Included ✓" : "Not Selected"}
                      </span>
                    </div> */}
                  </div>

                  <div
                    onClick={() =>
                      dharmicRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className="cursor-pointer group flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-all"
                  >
                    <div className="flex items-center gap-2 text-orange-500 font-black uppercase text-[11px] tracking-widest">
                      <Heart
                        size={14}
                        fill="currentColor"
                        className="group-hover:scale-110 transition-transform"
                      />
                      Dharmic Total
                    </div>
                    <span className="text-orange-600 font-black text-sm">
                      ₹{dharmicTotal}
                    </span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 uppercase px-1">
                      <span>Base Price</span>
                      <span className="text-gray-900 font-black">
                        ₹{basePrice}
                      </span>
                    </div>

                    {/* Temple Donation Section */}
                    <div className="flex flex-col py-3 border-y border-orange-200 px-1">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer group">
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
                          <span className="text-[11px] font-bold text-gray-700 uppercase group-hover:text-orange-600 transition-colors">
                            Temple Donation
                          </span>
                        </label>
                        <span className="text-[11px] font-black text-orange-500">
                          +₹{getPrice("Temple Donation")}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 ml-6 leading-snug">
                        {contributionOptions2?.find(
                          (c) => c.name === "Temple Donation",
                        )?.description ||
                          "Helps in temple upkeep and daily rituals."}
                      </p>
                    </div>

                    {/* 🎟️ Premium Coupon Section */}
                    <div className="py-2 border-y border-dashed border-orange-100 my-2">
                       <CouponSelector 
                         couponInput={couponInput}
                         setCouponInput={setCouponInput}
                         appliedCoupon={appliedCoupon}
                         handleApplyCoupon={handleApplyCoupon}
                         removeCoupon={removeCoupon}
                         isApplying={isApplying}
                         couponError={couponError}
                         publicCoupons={publicCoupons}
                       />
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-[11px] font-bold text-green-600 uppercase tracking-widest px-1">
                        <span>Coupon Discount</span>
                        <span className="font-black">
                          -₹{discountAmount}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 mt-2 border-t border-orange-100">
                      <span className="text-lg font-bold text-gray-900 tracking-tight">
                        Final Total
                      </span>
                      <div className="text-right">
                        {discountAmount > 0 && (
                          <p className="text-[12px] font-bold text-gray-400 line-through mb-0.5">
                            ₹{grandTotal + discountAmount}
                          </p>
                        )}
                        <span className="text-2xl font-black text-orange-600">
                          ₹{grandTotal}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayment}
                      className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black py-4 rounded-xl shadow-xl shadow-orange-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all group overflow-hidden relative"
                    >
                      <span className="relative z-10 uppercase tracking-widest text-[14px]">Proceed to Pay</span>
                      <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="bg-orange-50/50 py-3 rounded-xl text-center border border-orange-100/50">
                      <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest leading-none">
                        🙏 No extra cash tips required
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-orange-200 shadow-2xl px-4 py-3 cursor-pointer active:bg-orange-50 transition-colors"
        onClick={(e) => {
          if (e.target.closest("#mobile-pay-btn")) return;
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
              ₹{grandTotal.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck size={10} /> Incl. all taxes
            </p>
          </div>
          <button
            id="mobile-pay-btn"
            onClick={handlePayment}
            className="flex-1 max-w-[200px] bg-gradient-to-r from-orange-500 to-orange-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 text-[14px] uppercase tracking-[0.08em] active:scale-[0.97] transition-all"
          >
            <ArrowRight size={16} /> Pay ₹{grandTotal}
          </button>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   MOBILE INLINE SUMMARY
───────────────────────────────────────────── */
const MobileSummaryInline = ({
  puja,
  isSamagriSelected,
  basePrice,
  samagriPrice,
  dharmicTotal,
  grandTotal,
  donations,
  toggleDonation,
  dharmicRef,
  getPrice,
  contributionOptions2,
  couponInput,
  setCouponInput,
  appliedCoupon,
  handleApplyCoupon,
  discountAmount,
  publicCoupons
}) => (
  <div className="space-y-4">
    <div>
      <h3 className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-2">
        Booking Summary
      </h3>
      <div className="flex gap-1">
        <div className="h-1 w-12 bg-orange-500 rounded-full" />
        <div className="h-1 w-4 bg-orange-100 rounded-full" />
      </div>
    </div>

    <div className="pb-3 border-b border-orange-100">
      <h4 className="text-sm font-black text-gray-900">{puja?.puja_name}</h4>
      <div className="flex items-center justify-between mt-1.5">
        {/* <span className="text-xs font-bold text-gray-500">Samagri Kit</span>
        <span
          className={`text-xs font-bold ${isSamagriSelected ? "text-green-600" : "text-gray-400"}`}
        >
          {isSamagriSelected ? "Included ✓" : "Not Selected"}
        </span> */}
      </div>
    </div>

    <div className="space-y-2.5">
      <div className="flex justify-between items-center text-[13px] font-bold">
        <span className="text-gray-500">Base Price</span>
        <span className="text-gray-900">₹{basePrice}</span>
      </div>


      {/* <div className="flex justify-between items-center text-[13px] font-bold">
        <span className="text-gray-500">Samagri Kit</span>
        <span className="text-gray-900">+₹{samagriPrice}</span>
      </div> */}

      <button
        onClick={() =>
          dharmicRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
        className="w-full flex items-center justify-between p-3 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100 transition-all"
      >
        <div className="flex items-center gap-2 text-orange-600 text-[13px] font-bold">
          <Heart size={14} fill="currentColor" className="text-orange-500" />
          Dharmic Contributions
        </div>
        {dharmicTotal > 0 ? (
          <span className="text-[13px] font-bold text-orange-600">
            +₹{dharmicTotal}
          </span>
        ) : (
          <ChevronRight size={14} className="text-orange-400" />
        )}
      </button>

      <div className="flex flex-col border-y border-orange-200 pt-3">
        <div className="flex items-center justify-between py-1 px-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={donations["Temple Donation"]}
              onChange={() => toggleDonation("Temple Donation")}
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
            <span className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">
              Temple Donation
            </span>
          </label>
          <span className="text-[13px] font-black text-orange-500">
            +₹{getPrice("Temple Donation")}
          </span>
        </div>

        {/* ✅ Niche aayega */}
        <p className="text-[11px] text-gray-500 mt-1 ml-7 leading-snug">
          {contributionOptions2?.find((c) => c.name === "Temple Donation")
            ?.description ||
            "Helps in temple upkeep, rituals, and serving the community."}
        </p>
      </div>

      {/* 🎟️ Mobile Coupon Section */}
      <div className="py-2 border-y border-dashed border-orange-100">
        <CouponSelector 
          isMobile={true}
          couponInput={couponInput}
          setCouponInput={setCouponInput}
          appliedCoupon={appliedCoupon}
          handleApplyCoupon={handleApplyCoupon}
          removeCoupon={removeCoupon}
          isApplying={isApplying}
          couponError={couponError}
          publicCoupons={publicCoupons}
        />
      </div>

      <div className="border-t border-dashed border-gray-300 w-full" />

      <div className="flex justify-between items-center pt-1">
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
          ₹{grandTotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>

    <div className="bg-[#F8F1E7] py-2.5 rounded-lg text-center border border-orange-200/50">
      <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
        🙏 Fee includes Dakshina — No cash tips needed
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   CONTRIBUTION CARD — icon + desc on all sizes
───────────────────────────────────────────── */
const ContributionCard = ({ option, selected, onToggle }) => (
  <div
    onClick={onToggle}
    className={`flex items-center gap-3 p-4 transition-all cursor-pointer rounded-xl border-2 ${
      selected
        ? "border-orange-500 bg-orange-50/30 shadow-sm"
        : "border-orange-200 hover:border-orange-300 bg-white"
    }`}
  >
    {/* ✅ CHECKBOX STYLE (Radio dot ki jagah) */}
    <div
      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
        selected
          ? "bg-orange-500 border-orange-500"
          : "border-orange-200 bg-white"
      }`}
    >
      {selected && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="4"
          className="w-3.5 h-3.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>

    {/* Icon */}
    <div className="text-orange-500 shrink-0 opacity-80">{option.icon}</div>

    {/* Text */}
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm text-gray-900 leading-tight">
        {option.name}
      </h4>
      <p className="text-[10px] text-gray-500 font-medium line-clamp-1">
        {option.desc}
      </p>
    </div>

    {/* Price */}
    <span className="text-orange-600 font-black text-sm whitespace-nowrap shrink-0">
      ₹{option.price || 0}
    </span>
  </div>
);

export default KathaPujaPaymentDetails;

export const HourDropdown = ({
  value,
  onChange,
  inputBaseClass,
  labelClass,
}) => {
  // 7 AM se 5 PM tak ke hours generate karne ke liye
  const generateHours = () => {
    const hours = [];
    for (let i = 7; i <= 17; i++) {
      const period = i < 12 ? "AM" : "PM";
      const displayHour = i <= 12 ? i : i - 12; // 13 becomes 1 PM

      // Select value format: "07:00 AM", "01:00 PM", etc.
      const timeString = `${displayHour < 10 ? "0" + displayHour : displayHour}:00 ${period}`;
      hours.push(timeString);
    }
    return hours;
  };

  const timeOptions = generateHours();

  return (
    <div className="space-y-1">
      <label className={labelClass}>
        <Clock size={12} /> Time <span className="text-red-500">*</span>
      </label>
      <select
        name="time"
        value={value}
        onChange={onChange}
        className={`${inputBaseClass} cursor-pointer appearance-none`}
      >
        <option value="">Select Time</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
};
