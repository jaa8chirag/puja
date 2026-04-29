import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Info,
  Heart,
  Shield,
  Zap,
  Users,
  MessageSquare,
  Box,
  Sparkles,
  Gem,
  Moon,
  Download,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
import { LotusIcon } from "../Components/Icons";
// const SERVICE_ID = 48; // Online Pind Dan service ID

const SAMAGRI_PDF_URL = "/pdf/Puja_Samagri_Checklist.pdf";

// ── Fallback benefits agar backend se nahi aaye ──
const FALLBACK_BENEFITS = [
  {
    icon: <LotusIcon />,
    title: "Ancestral Peace",
    desc: "Brings peace and liberation to the souls of ancestors",
  },
  {
    icon: <LotusIcon />,
    title: "Pitru Dosh Relief",
    desc: "Resolves generational curses and ancestral doshas",
  },
  {
    icon: <LotusIcon />,
    title: "Financial Growth",
    desc: "Removes obstacles blocking prosperity and success",
  },
  {
    icon: <LotusIcon />,
    title: "Family Harmony",
    desc: "Restores peace, love, and unity within the family",
  },
  {
    icon: <LotusIcon />,
    title: "Blessing of Children",
    desc: "Removes hurdles in conception and child welfare",
  },
  {
    icon: <LotusIcon />,
    title: "Mental Balance",
    desc: "Eliminates fear, anxiety, and emotional distress",
  },
];

// ── Icon mapper for backend benefits ──
const getBenefitIcon = (name = "", index = 0) => {
  return <LotusIcon />;
};

const STATIC_FAQS = [
  {
    q: "Where is Pind Dan performed?",
    a: "Pind Dan is performed at sacred pilgrimage sites such as Gaya (Bihar), Haridwar, Prayagraj, Varanasi, and other holy locations. In the online ritual, a certified pandit performs the complete ceremony at the teerth on your behalf.",
  },
  {
    q: "I don't know my Gotra — what should I do?",
    a: "No worries! If you are unaware of your Gotra, the pandit will use 'Kashyap' Gotra during the Sankalp, which is traditionally and scripturally accepted in such cases.",
  },
  {
    q: "What happens in the Online Ritual?",
    a: "In the online ritual, the pandit travels to the sacred site, takes a Sankalp in your name and Gotra, performs the complete Pind Dan vidhi, and sends you a video recording of the entire ceremony. You do not need to be physically present.",
  },
  {
    q: "Will I receive proof that the puja was done in my name?",
    a: "Yes! The pandit will send you a video and photos on WhatsApp clearly showing your name and Gotra being taken during the Sankalp at the beginning of the ritual.",
  },
  {
    q: "How many days does it take to complete the puja?",
    a: "The puja is completed within 2–5 business days of booking. You will receive the exact confirmed date via WhatsApp after your booking is processed.",
  },
];

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
const OnlineRitual = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("about");
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const sections = {
    about: useRef(null),
    benefits: useRef(null),
    faqs: useRef(null),
  };

  // ── Fetch service from backend ──
  useEffect(() => {
    const fetchService = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/puja/online_pind/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setService(data.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, []);
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
  const handleProceed = () => {
    navigate(`/online-ritual-paymentdetails/${service.id}`, {
      state: { price: basePrice },
    });
  };
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

  // Benefits — backend se aaye toh use karo, warna fallback
  const benefits =
    service?.benefits && service.benefits.length > 0
      ? service.benefits.map((b, i) => ({
          icon: getBenefitIcon(b.name, i),
          title: b.name,
          desc: b.description || "Divine blessing",
        }))
      : FALLBACK_BENEFITS;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-orange-700 font-bold text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 md:p-6 font-sans text-gray-800 pb-28 md:pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-orange-700 mb-5 hover:opacity-70 transition-all"
        >
          <ChevronLeft size={18} /> Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-8 space-y-5">
            {/* HERO */}
            <div className="bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-sm">
              <div className="relative w-full aspect-[16/7]">
                {service?.image_url ? (
                  <img
                    src={`${API_BASE_URL}/uploads/${service?.image_url}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Pind Dan Puja"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-orange-50 flex items-center justify-center">
                    <Sparkles className="text-orange-200" size={60} />
                  </div>
                )}
                {/* Overlay - hidden on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent hidden md:block" />
                <div className="absolute bottom-6 left-6 hidden md:block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                      Sacred Ritual
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-serif font-bold text-white leading-tight">
                    {service?.puja_name}
                  </h1>
                  <p className="text-white/80 text-[13px] font-semibold mt-1 uppercase tracking-wider">
                    Certified Vedic Ritual
                  </p>
                </div>
              </div>

              {/* Mobile Title - visible only on mobile */}
              <div className="p-4 md:hidden border-t border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-orange-500/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Sacred Ritual
                  </span>
                </div>
                <h1 className="text-2xl font-serif font-bold text-gray-900 leading-tight">
                  {service?.puja_name}
                </h1>
                <div className="flex items-center mt-1">
                  <span className="text-orange-600 text-[12px] font-bold uppercase tracking-wider">
                    Certified Vedic Ritual
                  </span>
                </div>
              </div>
            </div>

            {/* STICKY TAB NAV */}
            <nav className="sticky top-[76px] z-40 bg-white border border-orange-200 rounded-xl shadow-md mb-4">
              <div className="flex overflow-x-auto no-scrollbar">
                {["about", "benefits", "faqs"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => scrollToSection(tab)}
                    className={`flex-1 px-6 py-4 text-[13px] font-black uppercase tracking-[0.15em] transition-all relative whitespace-nowrap ${
                      activeTab === tab
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

            {/* CONTENT SECTIONS */}
            <div className="bg-white rounded-2xl border border-orange-200 overflow-hidden shadow-sm">
              <div className="p-5 space-y-4">
                {/* ABOUT */}
                <section
                  ref={sections.about}
                  className="scroll-mt-32 space-y-4"
                >
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                    <Info size={20} /> About The Ritual
                  </div>
                  <div>
                    <p
                      className={`text-[15px] text-gray-600 leading-relaxed text-justify transition-all ${
                        !aboutExpanded ? "line-clamp-4 md:line-clamp-none" : ""
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

                <div className="border-t border-orange-50" />

                {/* BENEFITS */}
                <section
                  ref={sections.benefits}
                  className="scroll-mt-32 space-y-5"
                >
                  <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest">
                    <Gem size={20} /> Benefits of {service?.puja_name}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                    {benefits.map((benefit, index) => (
                      <BenefitCard
                        key={index}
                        icon={benefit.icon}
                        title={benefit.title}
                        desc={benefit.desc}
                      />
                    ))}
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

            {/* FAQS */}
            <section
              ref={sections.faqs}
              className="bg-white p-6 rounded-2xl border border-orange-200 shadow-sm scroll-mt-32"
            >
              <div className="flex items-center gap-2 text-orange-600 font-bold text-[13px] uppercase tracking-widest mb-5">
                <HelpCircle size={20} /> Frequently Asked Questions
              </div>
              <div className="space-y-1">
                {STATIC_FAQS.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </section>
          </div>

          {/* ── SIDEBAR (Desktop) ── */}
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
                    <span className="text-2xl font-bold text-orange-600 tracking-tighter">
                      ₹{basePrice}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-bold py-5 rounded-xl shadow-xl shadow-orange-100 hover:shadow-orange-200 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-[0.2em] text-[13px] active:scale-95 flex items-center justify-center gap-2"
              >
                Proceed to Book <ChevronRight size={18} strokeWidth={3} />
              </button>
              <div className="flex flex-col items-center opacity-50">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  Free cancellation up to 72 hours
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 p-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-orange-600">
              ₹{basePrice}
            </span>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
              <Shield size={10} /> Secure Booking
            </span>
          </div>
          <button
            onClick={handleProceed}
            className="w-40 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 rounded-xl text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-transform"
          >
            Proceed <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── HELPER COMPONENTS ──
const BenefitCard = ({ icon, title, desc }) => (
  <div className="flex items-center gap-2 md:gap-4 bg-[#FFFDF8] p-3 md:p-4 rounded-xl border border-orange-200 group transition-all shadow-sm">
    <div className="hidden md:flex p-1.5 bg-orange-50 text-orange-500 rounded-full shadow-sm transition-all shrink-0 group-hover:bg-orange-100">
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <div className="flex flex-col min-w-0">
      <h4 className="text-[13px] md:text-[15px] font-bold text-gray-800 tracking-tight leading-tight truncate md:whitespace-normal">
        {title}
      </h4>
      <p className="text-[11px] md:text-[13px] text-gray-500 mt-1 leading-tight font-medium line-clamp-1 md:line-clamp-none">
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
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
          {a}
        </p>
      </div>
    </div>
  );
};

export default OnlineRitual;
