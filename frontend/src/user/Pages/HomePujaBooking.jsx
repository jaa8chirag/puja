import React, { useState, useRef, useEffect } from "react";

import {
  ChevronRight,
  ChevronLeft,
  Eye,
  HelpCircle,
  Info,
  Box,
  Heart,
  Shield,
  Zap,
  Users,
  Download,
  CheckCircle,
  MessageSquare,
  MapPin,
  Sparkles,
  Gem,
} from "lucide-react";

import { useNavigate, useParams, useLocation } from "react-router-dom";
import HTMLContent from "../../Components/HTMLContent";
import SEO from "../Components/SEO";
import { CardSkeleton } from "../Components/Skeleton";

const SAMAGRI_PDF_URL = "/pdf/Puja_Samagri_Checklist.pdf";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { LotusIcon } from "../Components/Icons";

// ═══════════════════════════════════════════════════════════
// HELPER: Icon Mapper - Benefit names ke basis pe icons assign
// ═══════════════════════════════════════════════════════════
const getBenefitIcon = (benefitName, fallbackIndex = 0) => {
  return <LotusIcon />;
};

const HomePujaBooking = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const handleDownloadChecklist = () => {
    window.open(SAMAGRI_PDF_URL, "_blank");
  };

  const [samagriEnabled, setSamagriEnabled] = useState(
    location.state?.isSamagriSelected !== undefined
      ? location.state.isSamagriSelected
      : false,
  );

  const [activeTab, setActiveTab] = useState("about");
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aboutExpanded, setAboutExpanded] = useState(false); // NEW
  const [contributionOptions, setContributionOptions] = useState("");
  const sections = {
    about: useRef(null),
    benefits: useRef(null),
    faqs: useRef(null),
  };

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

  const getPrice = (title) => {
    const daan = Array.from(contributionOptions).filter((c) => c.name == title);

    return Number(daan[0]?.price);
  };
  useEffect(() => {
    const bookPuja = async (id) => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/puja/bookPuja/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setService(Array.isArray(data) ? data[0] : data);
      } catch (error) {
        console.log("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) bookPuja(id);
  }, [id]);

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
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
    }
  };

  const basePrice = Number(service?.standard_price || 0);
  const totalAmount = samagriEnabled
    ? basePrice + getPrice("Samagri Kit")
    : basePrice;

  const buildImageUrl = (url) => {
    if (!url) return `${API_BASE_URL}/uploads/default.jpg`;
    if (url.startsWith("http")) return url;
    if (url.startsWith("uploads/")) return `${API_BASE_URL}/${url}`;
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/uploads/${url}`;
  };

  const hasImage = service?.image_url;

  // console.log("services-----", service);
  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 md:p-6 font-sans text-gray-800 pb-28 md:pb-6">
      <SEO 
        title={`Book ${service?.puja_name || 'Home Puja'}`} 
        description={`Book verified Pandits for ${service?.puja_name}. Authentic Vedic ceremonies at your doorstep with modern convenience.`}
        keywords={`${service?.puja_name}, Home Puja Booking, Book Pandit, Vedic Rituals, Sri Vedic Puja`}
      />
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[11px] md:text-[13px] font-bold uppercase tracking-wider text-orange-700 mb-5 hover:opacity-70 transition-all"
        >
          <ChevronLeft size={16} /> Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-5">
            {/* HERO SECTION */}
            <div className="bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-sm">
              {/* Hero Image - Fixed 16:9 landscape ratio */}
              <div className="relative w-full aspect-[16/7]">
                {loading ? (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                ) : hasImage ? (
                  <img
                    src={buildImageUrl(service.image_url)}
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
              {!loading && (
                <div className="p-4 md:hidden border-t border-orange-100">
                  <h1 className="text-xl font-serif font-bold text-gray-900 leading-tight">
                    {service?.puja_name}
                  </h1>

                </div>
              )}
            </div>


            {/* STICKY TAB HEADER */}
            <nav className="sticky top-[76px] z-40 bg-white border border-orange-200 rounded-xl shadow-md mb-4">
              <div className="flex overflow-x-auto no-scrollbar">
                {["about", "benefits", "faqs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`flex-1 px-6 py-4 text-[13px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${activeTab === tab
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

            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Icon + Text + Download */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 rounded-lg bg-orange-50 flex-shrink-0">
                    <Box size={22} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[15px] text-gray-800 mb-0.5">
                      All-in-one samagri kit
                    </h3>
                    <p className="text-gray-500 text-[13px] mb-2">
                      You'll need to buy{" "}
                      <span className="text-red-600 font-medium">
                        30+ items.
                      </span>
                    </p>
                    <a
                      href={SAMAGRI_PDF_URL}
                      download="Puja_Samagri_Checklist.pdf"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-orange-200 rounded-lg text-[12px] font-medium text-orange-900 hover:bg-orange-50 transition-all active:scale-95"
                    >
                      <Download size={13} className="text-orange-600" />
                      Download list
                    </a>
                  </div>
                </div>

                {/* Right: Disabled Toggle */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="relative w-10 h-[22px] opacity-40 cursor-not-allowed pointer-events-none">
                    <div className="absolute inset-0 bg-gray-300 rounded-full" />
                    <div className="absolute w-4 h-4 bg-white rounded-full top-[3px] left-[3px]" />
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    Coming soon
                  </span>
                </div>
              </div>
            </div>

            {/* <div
              className={`bg-white rounded-xl p-5 border transition-all duration-300 shadow-sm ${samagriEnabled ? "border-orange-400" : "border-orange-200"}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg transition-all ${samagriEnabled ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600"}`}
                  >
                    <Box size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-[16px] text-gray-800 tracking-tight">
                      All-in-One Samagri Kit
                    </h3>
                    {samagriEnabled ? (
                      <p className="text-gray-500 text-[13px]">
                        <span className="text-orange-600 font-bold">
                          Relax.
                        </span>{" "}
                        We bring Flowers, Ghee & Vessels.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-gray-500 text-[13px]">
                          You'll need to buy{" "}
                          <span className="text-red-500 font-bold">
                            30+ items.
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <a
                            href={SAMAGRI_PDF_URL}
                            download="Puja_Samagri_Checklist.pdf"
                            className="flex items-center gap-2 px-3 py-1.5 border border-orange-200 rounded-lg text-[12px] font-bold text-gray-700 hover:bg-orange-50 transition-colors"
                          >
                            <Download size={14} /> Download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    // onClick={() => setSamagriEnabled(!samagriEnabled)}
                    className={`w-14 h-7 flex items-center rounded-full px-1 transition-colors ${samagriEnabled ? "bg-orange-500 shadow-inner" : "bg-gray-200"}`}
                  >
                    <div
                      className={`bg-white w-5 h-5 rounded-full shadow transition-transform ${samagriEnabled ? "translate-x-7" : "translate-x-0"}`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-gray-400 mt-1">
                    {samagriEnabled
                      ? `+₹${getPrice("Samagri Kit")}`
                      : "Not included"}
                  </span>
                </div>
              </div>
            </div> */}

            {/* CONTENT CONTAINER */}
            <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm">
              <div className="p-5 space-y-4">
                {/* SECTION: About */}
                <section
                  ref={sections.about}
                  className="scroll-mt-32 space-y-5"
                >
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                    <Info size={20} /> About The Ritual
                  </div>

                  {/* Description with Read More on mobile */}
                  <div>
                    <HTMLContent
                      content={service?.description}
                      className={`text-[15px] text-gray-600 leading-relaxed text-justify transition-all ${!aboutExpanded ? "line-clamp-4 md:line-clamp-none overflow-hidden" : ""}`}
                    />
                    {/* Only visible on mobile */}
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

                <div className="border-t border-orange-50" />

                {/* SECTION: Benefits */}
                <section
                  ref={sections.benefits}
                  className="scroll-mt-32 space-y-6"
                >
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                    <Gem size={20} /> Benefits of {service?.puja_name}
                  </div>
                  {/* grid-cols-2 lagane se mobile par 2 boxes side by side aayenge */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
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
                          desc="Divine protection"
                        />
                        <BenefitSmall
                          icon={<LotusIcon />}
                          title="Prosperity"
                          desc="Remove obstacles"
                        />
                        <BenefitSmall
                          icon={<LotusIcon />}
                          title="Family"
                          desc="Strengthen bonds"
                        />
                        <BenefitSmall
                          icon={<LotusIcon />}
                          title="Energy"
                          desc="Purify home"
                        />
                        <BenefitSmall
                          icon={<LotusIcon />}
                          title="Vastu"
                          desc="Harmonize space"
                        />
                      </>
                    )}
                  </div>
                </section>

                <div className="border-t border-orange-50" />
              </div>
            </div>

            {/* WhatsApp Highlighting */}
            <div className="bg-white rounded-xl p-6 border border-yellow-200 flex items-start gap-4 shadow-sm">
              <div className="p-3 bg-yellow-400 text-white rounded-lg shadow-sm">
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-gray-800">
                  Pandit Details via WhatsApp
                </h4>
                <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
                  Your assigned Pandit's contact and details will be shared on{" "}
                  <span className="font-bold text-gray-900 underline decoration-yellow-400">
                    WhatsApp
                  </span>{" "}
                  on the day of your puja.
                </p>
              </div>
            </div>

            {/* SECTION: FAQs */}
            <section
              ref={sections.faqs}
              className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm scroll-mt-32"
            >
              <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest mb-5">
                <HelpCircle size={20} /> Frequently Asked Questions
              </div>
              <div className="space-y-1">
                <FAQItem
                  q="Who will perform the Puja?"
                  a="Experienced Vedic Pandits well-versed in Shastras will be assigned to your home."
                />
                <FAQItem
                  q="I don't know my Gotra, what should I do?"
                  a="Don't worry! If you don't know your Gotra, our Pandit will use 'Kashyap' Gotra during the Sankalp, as it is traditionally accepted in such cases."
                />
                <FAQItem
                  q="What will be done in this Puja?"
                  a="The puja includes the main ritual (Katha/Havan), Ganesh Pujan, Sankalp, and Aarti."
                />
                <FAQItem
                  q="How will I know the Puja has been done in my name?"
                  a="The Pandit will take your name and Gotra during the 'Sankalp' at the beginning of the puja."
                />
              </div>
            </section>
          </div>

          {/* SIDEBAR — desktop only, unchanged */}
          <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-[100px] self-start">
            <div className="bg-white rounded-2xl border border-orange-200 p-8 shadow-sm space-y-8">
              <div>
                <h2 className="text-[15px] font-bold uppercase tracking-[0.2em] text-gray-700 mb-2">
                  Booking Summary
                </h2>
                <div className="flex gap-1">
                  <div className="h-1 w-12 bg-orange-500 rounded-full" />
                  <div className="h-1 w-4 bg-orange-100 rounded-full" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[15px] font-bold">
                  <span className="text-gray-500 tracking-wider">
                    Base Price
                  </span>
                  <span className="text-gray-800 tracking-tight">
                    ₹{basePrice}
                  </span>
                </div>

                {samagriEnabled && (
                  <div className="flex justify-between items-center text-[15px] font-bold border-t border-orange-50">
                    <span className="text-gray-500 tracking-wider">
                      Samagri Kit
                    </span>
                    <span className="tracking-tight">
                      +₹{getPrice("Samagri Kit")}
                    </span>
                  </div>
                )}

                <div className="pt-6 mt-2 border-t border-dashed border-orange-200">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] leading-none">
                        Total Amount
                      </span>
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-1.5">
                        <Shield size={10} className="stroke-[3]" /> Inclusive of
                        all taxes
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-orange-600 tracking-tighter">
                        ₹{totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() =>
                    navigate(`/home-puja/payment-details/${id}`, {
                      state: { isSamagriSelected: samagriEnabled },
                    })
                  }
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-bold py-5 rounded-xl shadow-xl shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em] text-[13px] active:scale-95 flex items-center justify-center gap-2"
                >
                  Proceed to Book <ChevronRight size={18} strokeWidth={3} />
                </button>
                <div className="flex flex-col items-center gap-1 opacity-50">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Free cancellation up to 72 hours
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM CTA BAR — unchanged */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-orange-600">
                ₹{totalAmount}
              </span>
            </div>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <Shield size={10} /> Secure Booking
            </span>
          </div>
          <button
            onClick={() =>
              navigate(`/home-puja/payment-details/${id}`, {
                state: { isSamagriSelected: samagriEnabled },
              })
            }
            className="w-40 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-transform"
          >
            Proceed <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const BenefitSmall = ({ icon, title, desc }) => (
  <div className="flex items-center gap-2 md:gap-4 bg-[#FFFDF8] p-3 md:p-4 rounded-xl border border-orange-200 group transition-all shadow-sm">
    {/* Icon: Mobile (hidden), Desktop (md:flex) */}
    <div className="hidden md:flex w-12 h-12 items-center justify-center bg-orange-50 text-orange-500 rounded-full shadow-sm transition-all shrink-0 group-hover:bg-orange-100">
      {React.cloneElement(icon, { size: 28 })}
    </div>

    <div className="flex flex-col min-w-0">
      {" "}
      {/* min-w-0 prevents text overflow */}
      <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 tracking-tight leading-tight whitespace-normal">
        {title}
      </h4>
      <p className="text-[11px] md:text-[13px] text-gray-500 mt-1 md:mt-2 leading-tight font-medium">
        {desc}
      </p>
    </div>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="py-3 cursor-pointer border-b border-orange-50 last:border-none"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="text-[15px] text-gray-700 font-bold leading-tight pr-5">
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
        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
          {a}
        </p>
      </div>
    </div>
  );
};

export default HomePujaBooking;
