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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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
    ancestral: <Heart />,
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
    liberation: <Star />,
    soul: <Star />,
  };

  // Check if any keyword matches
  for (const [keyword, icon] of Object.entries(iconMap)) {
    if (name.includes(keyword)) return icon;
  }

  // Fallback: Cycle through default icons
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
    "Gau Seva": false,
    "Temple Donation": false,
  });
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

  const handlePindDanPayment = async () => {
    const token = localStorage.getItem("token");
    const currentBookingId = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    // const generateOTP = () => {
    //   return Math.floor(100000 + Math.random() * 900000).toString();
    // };
    // const otp = generateOTP();
    if (!token) {
      navigate("/signin");
      return;
    }
    setIsBooking(true);

    const selectedDonationObjects = contributionList
      .filter((item) => donations[item.id])
      .map((item) => {
        // id DB se find karo
        const dbContribution = contributionOptions.find(
          (c) => c.name === item.title,
        );

        return {
          contribution_type_id: dbContribution?.id,
          amount: Number(item.price),
        };
      });
    // 🔥 Temple Donation manually add karo
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
    const bookingData = {
      bookingId: currentBookingId,
      // otp,
      puja_id: id,
      date: service?.dateOfStart
        ? new Date(service.dateOfStart).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],

      time: service?.dateOfStart
        ? new Date(service.dateOfStart).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        : "10:00 AM",
      address: service?.address || "N/A",
      city: "Default City",
      state: service.address.split(",")[service.address.split(",").length - 1],
      devoteeName: token
        ? JSON.parse(atob(token.split(".")[1])).name
        : "Guest User",
      ticket_type: selectedTicket,
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

      if (result.success) {
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
    const item = contributionOptions.find((c) => c.name === title);
    return item ? Number(item.price) : 0;
  };

  // console.log("services", service);

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
                    <p
                      className={`text-[16px] text-gray-600 leading-relaxed text-justify transition-all ${!aboutExpanded ? "line-clamp-4 md:line-clamp-none" : ""
                        }`}
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

              {/* BENEFITS - DYNAMIC */}
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

            {/* 4. SACRED CONTRIBUTIONS BLOCK */}
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

                <div className="border-t border-dashed border-gray-300 w-full my-2" />

                <div className="flex justify-between items-start pt-2 px-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Amount
                    </span>
                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <ShieldCheck
                        size={14}
                        fill="currentColor"
                        className="opacity-20"
                      />
                      <span className="text-[11px] font-bold">
                        Inclusive of all taxes
                      </span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-orange-600 tracking-tighter">
                    ₹{calculateTotal().toLocaleString("en-IN")}
                  </span>
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
                        <span>Proceed to Pay</span>
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
              ₹{calculateTotal().toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <ShieldCheck size={10} /> Incl. all taxes
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
                <span>Proceed to Pay</span>
                <ChevronRight size={16} strokeWidth={3} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MOBILE INLINE SUMMARY SECTION
───────────────────────────────────────────── */
const MobileSummarySection = ({
  service, donations, setDonations, contributionList,
  calculateTotal, selectedContributionsTotal, scrollToSection, getPrice,
  contributionOptions,
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
  {contributionOptions?.find((c) => c.name === "Temple Donation")?.description || "Helps in temple upkeep, daily rituals, and serving devotees."}
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
