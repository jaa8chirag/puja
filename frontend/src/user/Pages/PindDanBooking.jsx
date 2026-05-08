import React, { useEffect, useState, useRef } from "react";
import { handleRazorpayPayment } from "../utils/razorpay";
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
  Gem,
  Plus,
  CheckCircle,
  Ticket,
  Info,
  MessageSquare,
  Box,
  HelpCircle,
  ChevronRight,
  Zap,
  Star,
  Activity,
  Droplets,
  Leaf,
  Home,
  Bird,
  BookOpen,
  X,
} from "lucide-react";
import CouponSelector from "../Components/CouponSelector";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import HTMLContent from "../../Components/HTMLContent";
import SuccessModal from "../Components/SuccessModal";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { LotusIcon } from "../Components/Icons";

// ═══════════════════════════════════════════════════════════
// HELPER: Icon Mapper - Benefit names ke basis pe icons assign
// ═══════════════════════════════════════════════════════════
const getBenefitIcon = (benefitName, fallbackIndex = 0) => {
  return <LotusIcon />;
};


const PaymentOptionSelector = ({ paymentOption, setPaymentOption, grandTotal, advancePercentage }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-orange-200 mt-4 px-2">
      <h4 className="text-[11px] font-black uppercase text-orange-600 tracking-[0.2em] mb-3">Choose Payment Mode</h4>
      <div className="grid grid-cols-1 gap-3">
        {/* Full Payment */}
        <div
          onClick={() => setPaymentOption("full")}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${paymentOption === "full" ? "border-orange-500 bg-orange-50/50 shadow-md" : "border-orange-100 hover:border-orange-200 bg-white"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "full" ? "border-orange-500 bg-orange-500" : "border-orange-200"
              }`}>
              {paymentOption === "full" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Full Payment</p>
              <p className="text-[10px] text-gray-500 mt-1">Pay 100% amount now</p>
            </div>
          </div>
          <span className="font-black text-orange-600">₹{grandTotal}</span>
        </div>

        {/* Advance Payment */}
        <div
          onClick={() => setPaymentOption("advance")}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${paymentOption === "advance" ? "border-orange-500 bg-orange-50/50 shadow-md" : "border-orange-100 hover:border-orange-200 bg-white"
            }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentOption === "advance" ? "border-orange-500 bg-orange-500" : "border-orange-200"
              }`}>
              {paymentOption === "advance" && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Advance Payment</p>
              <p className="text-[10px] text-gray-500 mt-1">Pay {advancePercentage}% now</p>
            </div>
          </div>
          <span className="font-black text-orange-600">₹{Math.round(grandTotal * advancePercentage / 100)}</span>
        </div>
      </div>
    </div>
  );
};

const PindDanBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState("Single");
  const [activeTab, setActiveTab] = useState("about");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [contributionOptions, setContributionOptions] = useState([]);
  const [donations, setDonations] = useState({
    "Vastra Dan": false,
    "Anna Dan": false,
    "Deep Dan": false,
    "Brahmin Dan": false,
    "Jeev Daya": false,
    "Gau Seva": false,
    "Temple Donation": false,
  });
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [publicCoupons, setPublicCoupons] = useState([]);
  const [paymentOption, setPaymentOption] = useState("full");
  const [advancePercentage, setAdvancePercentage] = useState(25);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [useReferralDiscount, setUseReferralDiscount] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sections = {
    about: useRef(null),
    benefits: useRef(null),
    contributions: useRef(null),
    faqs: useRef(null),
  };

  useEffect(() => {
    const fetchService = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/puja/pind-dan/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) setService(data.data);

        // Fetch public coupons
        const publicCouponsRes = await fetch(`${API_BASE_URL}/coupons/public-coupons`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const publicCouponsData = await publicCouponsRes.json();
        if (publicCouponsData.success) {
          setPublicCoupons(publicCouponsData.data);
        }

        const settingsRes = await fetch(`${API_BASE_URL}/settings/advance_payment_percentage`);
        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setAdvancePercentage(Number(settingsData.value));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/user/get-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data && data.user) {
          setPendingRewards(data.user.pending_referral_discounts || 0);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
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

  const handlePindDanPayment = async () => {
    const token = localStorage.getItem("token");
    const currentBookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (!token) {
      navigate("/signin");
      return;
    }

    const amountToPay = paymentOption === "full" ? finalTotal : Math.round((finalTotal * advancePercentage) / 100);

    try {
      // 1. Start Razorpay Payment
      await handleRazorpayPayment({
        amount: amountToPay,
        userName: token ? jwtDecode(token).name : "Guest User",
        userEmail: "",
        userPhone: "",
        onSuccess: async (razorpayResponse) => {
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
            });

          if (donations["Temple Donation"]) {
            const temple = contributionOptions.find(
              (c) => c.name === "Temple Donation",
            );
            if (temple) {
              selectedDonationObjects.push({
                contribution_type_id: temple.id,
                amount: Number(temple.price),
              });
            }
          }

          const formattedDateForBooking = service?.dateOfStart
            ? new Date(service.dateOfStart).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];

          const bookingData = {
            bookingId: currentBookingId,
            puja_id: id,
            date: formattedDateForBooking,
            time: service?.dateOfStart
              ? new Date(service.dateOfStart).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              : "10:00 AM",
            address: service?.address || "N/A",
            city: service?.address?.split(",")?.slice(-2, -1)[0]?.trim() || "N/A",
            state: service?.address?.split(",")?.pop()?.trim() || "N/A",
            devoteeName: token
              ? jwtDecode(token).name
              : "Guest User",
            ticket_type: selectedTicket,
            donations: selectedDonationObjects,
            total_price: finalTotal,
            coupon_code: appliedCoupon ? appliedCoupon.code : null,
            discount_amount: discountAmount,
            // Payment details
            paid_amount: amountToPay,
            payment_type: paymentOption,
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          };

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
          if (result.success) {
            setShowSuccess(true);
          } else {
            alert("Error: " + result.message);
          }
          setIsBooking(false);
        },
        onError: (error) => {
          alert("Payment failed: " + error);
          setIsBooking(false);
        },
      });
    } catch (err) {
      console.error("Payment initiation failed:", err);
      alert("Could not initiate payment. Please try again.");
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

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError("");
    const token = localStorage.getItem("token");
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
        setUseReferralDiscount(false);
      } else {
        setCouponError(data.message);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
    } finally {
      setIsApplying(false);
    }
  };

  const handleReferralToggle = () => {
    if (!useReferralDiscount && appliedCoupon) {
      setAppliedCoupon(null);
    }
    setUseReferralDiscount(!useReferralDiscount);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const getPrice = (title) => {
    const item = Array.isArray(contributionOptions) ? contributionOptions.find((c) => c.name.trim().toLowerCase() === title.trim().toLowerCase()) : null;
    return Number(item?.price || 0);
  };

  const getDescription = (name) => {
    const item = Array.isArray(contributionOptions) ? contributionOptions.find((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()) : null;
    return item?.description || "";
  };

  const contributionList = [
    { id: "Vastra Dan", title: "Vastra Dan", price: getPrice("Vastra Dan"), icon: <Shirt size={16} />, sub: getDescription("Vastra Dan") || "Donate clothes to the needy" },
    { id: "Anna Dan", title: "Anna Dan", price: getPrice("Anna Dan"), icon: <Coffee size={16} />, sub: getDescription("Anna Dan") || "Provide meals to the hungry" },
    { id: "Deep Dan", title: "Deep Dan", price: getPrice("Deep Dan"), icon: <Flame size={16} />, sub: getDescription("Deep Dan") || "Light lamps at sacred temples" },
    { id: "Brahmin Dan", title: "Brahmin Dan", price: getPrice("Brahmin Dan"), icon: <UtensilsCrossed size={16} />, sub: getDescription("Brahmin Dan") || "Feed Brahmins after ceremony" },
    { id: "Vidya Dan", title: "Vidya Dan", price: getPrice("Vidya Dan"), icon: <BookOpen size={16} />, sub: getDescription("Vidya Dan") || "Support student education" },
    { id: "Aushadhi Dan", title: "Aushadhi Dan", price: getPrice("Aushadhi Dan"), icon: <Activity size={16} />, sub: getDescription("Aushadhi Dan") || "Contribute to medical aid" },
    { id: "Jal Dan", title: "Jal Dan", price: getPrice("Jal Dan"), icon: <Droplets size={16} />, sub: getDescription("Jal Dan") || "Provide clean water" },
    { id: "Vriksh Dan", title: "Vriksh Dan", price: getPrice("Vriksh Dan"), icon: <Leaf size={16} />, sub: getDescription("Vriksh Dan") || "Plant trees for nature" },
    { id: "Aashray Dan", title: "Aashray Dan", price: getPrice("Aashray Dan"), icon: <Home size={16} />, sub: getDescription("Aashray Dan") || "Shelter for the homeless" },
    { id: "Jeev Daya", title: "Jeev Daya", price: getPrice("Jeev Daya"), icon: <Bird size={16} />, sub: getDescription("Jeev Daya") || "Compassion for all beings" },
    { id: "Gau Seva", title: "Gau Seva", price: getPrice("Gau Seva"), icon: <span className="text-xl">🐄</span>, sub: getDescription("Gau Seva") || "Feed the Gau Mata" },
  ];

  const calculateTotal = () => {
    const base = Number(service?.standard_price) || 0;
    const extra = contributionList.reduce(
      (acc, item) => (donations[item.id] ? acc + item.price : acc),
      0,
    );
    return (
      base +
      extra +
      (donations["Temple Donation"] ? getPrice("Temple Donation") : 0)
    );
  };

  const grandTotalBeforeDiscount = calculateTotal();
  const couponDiscount = appliedCoupon
    ? Math.floor((grandTotalBeforeDiscount * appliedCoupon.discount_percentage) / 100)
    : 0;

  const referralDiscount = useReferralDiscount
    ? Math.floor(((grandTotalBeforeDiscount - couponDiscount) * 10) / 100)
    : 0;

  const discountAmount = couponDiscount + referralDiscount;
  const finalTotal = grandTotalBeforeDiscount - discountAmount;

  const selectedContributionsTotal =
    contributionList.reduce(
      (acc, item) => (donations[item.id] ? acc + item.price : acc),
      0,
    ) + (donations["Temple Donation"] ? getPrice("Temple Donation") : 0);

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
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigate("/my-booking");
        }}
        title="Puja Booked!"
        message="Your puja has been booked successfully."
      />
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
                <div className="relative w-full aspect-[16/7]">
                  {service?.image_url ? (
                    <img
                      src={`${API_BASE_URL}/uploads/${service?.image_url}`}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="Puja"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-orange-50 flex items-center justify-center">
                      <Sparkles className="text-orange-200" size={60} />
                    </div>
                  )}
                  {/* Overlay - hidden on mobile */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent hidden md:block" />
                  <div className="absolute bottom-6 left-6 hidden md:block">
                    <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                      {service?.puja_name}
                    </h1>

                  </div>
                </div>

                {/* Mobile Title - visible only on mobile */}
                <div className="p-4 md:hidden border-t border-orange-100">
                  <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                    {service?.puja_name}
                  </h1>
                  <div className="flex items-center mt-1">

                  </div>
                </div>
              </div>

              {/* 2. STICKY TAB HEADER */}
              <nav className="sticky top-[76px] z-40 bg-white border border-orange-200 rounded-xl shadow-md">
                <div className="flex overflow-x-auto no-scrollbar">
                  {["about", "benefits", "contributions", "faqs"].map((tab) => (
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
                          new Date(service.dateOfStart).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                      <Info size={20} /> About The Ritual
                    </div>
                    <div>
                      <HTMLContent
                        content={service?.description}
                        className={`text-[16px] text-gray-600 leading-relaxed text-justify transition-all ${!aboutExpanded ? "line-clamp-4 md:line-clamp-none overflow-hidden" : ""}`}
                      />
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

                {/* BENEFITS - DYNAMIC */}
                <div className="p-5 md:p-7 bg-[#FFFDF8]">
                  <section
                    ref={sections.benefits}
                    className="scroll-mt-44 space-y-4"
                  >
                    <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                      <Gem size={20} /> Benefits of {service?.puja_name}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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
                            icon={<LotusIcon />}
                            title="Spiritual Peace"
                            desc="Inner calm through sacred rituals"
                          />
                          <BenefitSmall
                            icon={<LotusIcon />}
                            title="Protection"
                            desc="Divine protection for family"
                          />
                          <BenefitSmall
                            icon={<LotusIcon />}
                            title="Prosperity"
                            desc="Remove obstacles from path"
                          />
                          <BenefitSmall
                            icon={<LotusIcon />}
                            title="Harmony"
                            desc="Strengthen family bonds"
                          />
                          <BenefitSmall
                            icon={<LotusIcon />}
                            title="Positive Energy"
                            desc="Purify soul with mantras"
                          />
                          <BenefitSmall
                            icon={<LotusIcon />}
                            title="Karma"
                            desc="Balance spiritual energies"
                          />
                        </>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              {/* 4. SACRED CONTRIBUTIONS BLOCK */}
              <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
                <div className="p-5 md:p-7">
                  <section
                    ref={sections.contributions}
                    className="scroll-mt-44 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                        <Sparkles size={20} /> Sacred Contributions
                      </div>
                      <button
                        onClick={() => {
                          const allSelected = contributionList.every(
                            (option) => donations[option.id],
                          );
                          const newDonations = { ...donations };
                          contributionList.forEach((option) => {
                            newDonations[option.id] = !allSelected;
                          });
                          setDonations(newDonations);
                        }}
                        className="px-3 py-2 text-xs font-bold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
                      >
                        {contributionList.every((option) => donations[option.id])
                          ? "Deselect All"
                          : "Select All"}
                      </button>
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

              {/* 5. BOOKING SUMMARY — mobile only, above FAQ */}
              <div
                id="mobile-summary"
                className="lg:hidden bg-white rounded-2xl border border-orange-200 shadow-sm p-5"
              >
                <MobileSummarySection
                  service={service}
                  donations={donations}
                  setDonations={setDonations}
                  contributionList={contributionList}
                  calculateTotal={calculateTotal}
                  selectedContributionsTotal={selectedContributionsTotal}
                  scrollToSection={scrollToSection}
                  getPrice={getPrice}
                  contributionOptions={contributionOptions}
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  appliedCoupon={appliedCoupon}
                  handleApplyCoupon={handleApplyCoupon}
                  removeCoupon={removeCoupon}
                  isApplying={isApplying}
                  couponError={couponError}
                  discountAmount={discountAmount}
                  grandTotalBeforeDiscount={grandTotalBeforeDiscount}
                  finalTotal={finalTotal}
                  publicCoupons={publicCoupons}
                  paymentOption={paymentOption}
                  setPaymentOption={setPaymentOption}
                  grandTotal={finalTotal}
                  advancePercentage={advancePercentage}
                  handleBooking={handlePindDanPayment}
                  isBooking={isBooking}
                  pendingRewards={pendingRewards}
                  useReferralDiscount={useReferralDiscount}
                  handleReferralToggle={handleReferralToggle}
                  referralDiscount={referralDiscount}
                />
              </div>

              {/* 6. FAQ SECTION */}
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

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 self-start z-30">
              <div className="bg-white rounded-3xl border border-orange-200 p-8 shadow-2xl shadow-slate-200/60">
                <div className="mb-8">
                  <h3 className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-2">
                    Booking Summary
                  </h3>
                  <div className="flex gap-1">
                    <div className="h-1 w-12 bg-orange-500 rounded-full" />
                    <div className="h-1 w-4 bg-orange-100 rounded-full" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[15px] font-bold text-slate-500 tracking-wider">
                      Base Price
                    </span>
                    <span className="text-[16px] font-bold text-slate-800">
                      ₹{Number(service?.standard_price).toLocaleString("en-IN")}
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
                          +₹{selectedContributionsTotal.toLocaleString("en-IN")}
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
                      {contributionOptions?.find((c) => c.name === "Temple Donation")?.description || "Helps in temple upkeep, daily rituals, and serving devotees."}
                    </p>
                  </div>

                  {/* 🎟️ Referral Reward Section */}
                  {pendingRewards > 0 && (
                    <div className="py-3 border-y border-dashed border-orange-100 my-2 px-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-orange-500" />
                          <span className="text-[11px] font-bold text-gray-700 uppercase">Referral Reward</span>
                        </div>
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          {pendingRewards} Available
                        </span>
                      </div>
                      <div
                        onClick={handleReferralToggle}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${useReferralDiscount
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-100 bg-gray-50 hover:border-orange-200"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${useReferralDiscount ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
                            }`}>
                            {useReferralDiscount && <CheckCircle size={10} className="text-white" />}
                          </div>
                          <span className="text-xs font-bold text-gray-800">Use 10% Discount</span>
                        </div>
                        {useReferralDiscount && (
                          <span className="text-[10px] font-black text-green-600">-₹{referralDiscount}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 🎫 Coupon Section */}
                  <div className="py-2 border-y border-dashed border-orange-100 my-4 px-1">
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

                  <PaymentOptionSelector
                    paymentOption={paymentOption}
                    setPaymentOption={setPaymentOption}
                    grandTotal={finalTotal}
                    advancePercentage={advancePercentage}
                  />

                  <div className="flex justify-between items-start pt-2 px-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                        {paymentOption === "full" ? "Total Amount" : "Advance Amount"}
                      </span>
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <ShieldCheck
                          size={14}
                          fill="currentColor"
                          className="opacity-20"
                        />
                        <span className="text-[11px] font-bold">
                          {paymentOption === "full" ? "Inclusive of all taxes" : "Balance to be paid later"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {discountAmount > 0 && (
                        <p className="text-[12px] font-bold text-green-600 line-through opacity-70 mb-0.5">
                          ₹{grandTotalBeforeDiscount.toLocaleString("en-IN")}
                        </p>
                      )}
                      <span className="text-2xl font-black text-orange-600 tracking-tighter">
                        ₹{(paymentOption === "full" ? finalTotal : Math.round(finalTotal * advancePercentage / 100)).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-4">
                  <button
                    onClick={() => handlePindDanPayment()}
                    disabled={isBooking}
                    className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-200 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-center gap-3 text-[15px] uppercase tracking-[0.1em]">
                      {isBooking ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <span>{paymentOption === "full" ? "Proceed to Pay" : "Pay Advance"}</span>
                          <ChevronRight
                            size={18}
                            strokeWidth={3}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </div>
                  </button>
                  <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Free cancellation up to 72 hours.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* MOBILE STICKY BOTTOM BAR */}
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
                ₹{(paymentOption === "full" ? finalTotal : Math.round(finalTotal * advancePercentage / 100)).toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck size={10} /> {paymentOption === "full" ? "Total Payable" : "Advance Payable"}
              </p>
            </div>
            <button
              id="mobile-cta-btn"
              onClick={() => handlePindDanPayment()}
              disabled={isBooking}
              className="flex-1 max-w-[200px] bg-gradient-to-r from-orange-500 to-orange-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-[14px] uppercase tracking-[0.08em]"
            >
              {isBooking ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <span>{paymentOption === "full" ? "Proceed to Pay" : "Pay Advance"}</span>
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
   MOBILE INLINE SUMMARY SECTION
───────────────────────────────────────────── */
const MobileSummarySection = ({
  service, donations, setDonations, contributionList,
  calculateTotal, selectedContributionsTotal, scrollToSection, getPrice,
  contributionOptions, couponInput, setCouponInput, appliedCoupon,
  handleApplyCoupon, removeCoupon, isApplying, couponError,
  paymentOption, setPaymentOption, grandTotal, advancePercentage,
  handleBooking, isBooking, pendingRewards, useReferralDiscount,
  handleReferralToggle, referralDiscount, publicCoupons,
  discountAmount, grandTotalBeforeDiscount, finalTotal
}) => (
  <div>
    <div className="mb-5">
      <h3 className="text-[15px] font-bold text-slate-700 uppercase tracking-[0.15em] mb-2">
        Booking Summary
      </h3>
      <div className="flex gap-1">
        <div className="h-1 w-12 bg-orange-500 rounded-full" />
        <div className="h-1 w-4 bg-orange-100 rounded-full" />
      </div>
    </div>

    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <span className="text-[14px] font-bold text-slate-500 tracking-wider">
          Base Price
        </span>
        <span className="text-[15px] font-bold text-slate-800">
          ₹{Number(service?.standard_price).toLocaleString("en-IN")}
        </span>
      </div>

      <button
        onClick={() => scrollToSection("contributions")}
        className="w-full flex items-center justify-between p-3 rounded-2xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 text-orange-600 text-[14px] font-bold">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <Heart size={15} fill="currentColor" className="text-orange-500" />
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
              +₹{selectedContributionsTotal.toLocaleString("en-IN")}
            </span>
          ) : (
            <ChevronRight size={15} className="text-orange-400" />
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

        <p className="text-[11px] text-gray-500 mt-1 ml-7 leading-snug">
          {contributionOptions?.find((c) => c.name === "Temple Donation")?.description || "Helps in temple upkeep, rituals, and serving devotees."}
        </p>
      </div>

      {/* 🎟️ Mobile Referral Reward Section */}
      {pendingRewards > 0 && (
        <div className="py-3 border-y border-dashed border-orange-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-orange-500" />
              <span className="text-[12px] font-bold text-gray-700 uppercase">Referral Reward</span>
            </div>
            <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {pendingRewards} Available
            </span>
          </div>

          <div
            onClick={handleReferralToggle}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${useReferralDiscount
              ? "border-orange-500 bg-orange-50"
              : "border-gray-100 bg-gray-50 hover:border-orange-200"
              }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${useReferralDiscount ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
                }`}>
                {useReferralDiscount && <CheckCircle size={10} className="text-white" />}
              </div>
              <span className="text-xs font-bold text-gray-800">Use 10% Discount</span>
            </div>
            {useReferralDiscount && (
              <span className="text-[10px] font-black text-green-600">-₹{referralDiscount}</span>
            )}
          </div>
        </div>
      )}

      <div className="py-2 border-y border-dashed border-orange-100 my-2">
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

      <PaymentOptionSelector
        paymentOption={paymentOption}
        setPaymentOption={setPaymentOption}
        grandTotal={finalTotal}
        advancePercentage={advancePercentage}
      />

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
        <div className="text-right">
          {discountAmount > 0 && (
            <p className="text-[11px] font-bold text-green-600 line-through opacity-70">
              ₹{grandTotalBeforeDiscount.toLocaleString("en-IN")}
            </p>
          )}
          <span className="text-xl font-black text-orange-600">
            ₹{finalTotal.toLocaleString("en-IN")}
          </span>
        </div>
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
        className={`hidden md:flex p-2.5 rounded-lg shrink-0 transition-all ${selected
          ? "bg-orange-500 text-white"
          : "bg-orange-100 text-orange-500"
          }`}
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
   Desktop: icon + text
   Mobile:  text only — no icon
───────────────────────────────────────────── */
const BenefitSmall = ({ icon, title, desc }) => (
  <div className="flex flex-row items-center gap-3 md:gap-4 bg-[#FFFDF8] p-3 md:p-4 rounded-xl border border-orange-200 group transition-all shadow-sm hover:border-orange-400 text-left">
    {/* Icon Container: Visible on all sizes, centered icon */}
    <div className="hidden md:flex w-12 h-12 items-center justify-center bg-orange-50 text-orange-500 rounded-full shadow-sm transition-all shrink-0 group-hover:bg-orange-100">
      {React.cloneElement(icon, { size: 36 })}
    </div>
    <div className="flex flex-col">
      <h4 className="text-[14px] md:text-[16px] font-bold text-gray-800 tracking-tight leading-none group-hover:text-orange-700 transition-colors">
        {title}
      </h4>
      <p className="text-[12px] md:text-[13px] text-gray-500 mt-1.5 leading-tight font-medium">
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed font-medium">
          {a}
        </p>
      </div>
    </div>
  );
};


export default PindDanBooking;
