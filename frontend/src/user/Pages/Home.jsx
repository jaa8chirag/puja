import { useEffect, useState } from "react";
import ReviewSection from "../Components/ReviewSection";
import SpecialPujas from "../Components/SpecialPujas";
import DevotionalStats from "../Components/DevotionalStats";
import HowItWorks from "../Components/HowItWorks";
import TrendingPuja from "../Components/TrendingPuja";
import { useNavigate } from "react-router-dom";
import WhyChooseUs from "../Components/Whychooseus";
import VerifiedPanditSection from "../Components/VerifiedPanditSection";
import {
  ShieldCheck,
  Sparkles,
  Home as HomeIcon,
  Star,
  Users,
  Video,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const rituals = [
    {
      img: "/img/newImage1.jpg",
      title: "Sacred Havan",
      desc: "Purifying Fire Ritual",
    },
    {
      img: "/img/newImage2.jpg",
      title: "Vedic Puja",
      desc: "Traditional Worship",
    },
    {
      img: "/img/newImage4.jpg",
      title: "Wedding Rituals",
      desc: "Sacred Union Ceremonies",
    },
    {
      img: "/img/newImage3.jpg",
      title: "Griha Pravesh",
      desc: "New Beginnings",
    },
  ];

  const [index, setIndex] = useState(0);
  const duration = 4000;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % rituals.length);
    }, duration);
    return () => clearInterval(timer);
  }, [index, rituals.length]);

  return (
    <div className="w-full overflow-x-hidden bg-[#FFF4E1] flex flex-col items-center">
      {/* ================= HERO SECTION ================= */}
      <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-10 md:py-16 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-12 max-w-[1250px] mx-auto">
          {/* LEFT SIDE */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold mb-5 w-fit uppercase tracking-widest">
              ✨ Your Faith Partner
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black leading-tight font-serif text-[#3b2a1a]">
              Sacred Rituals,
              <br className="" />
              <span className="text-orange-500">Modern Convenience</span>
            </h1>

            <p className="mt-5 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-full sm:max-w-lg">
              Book verified Pandits for your sacred ceremonies. We handle
              everything - from the sacred Samagri to the final Aarti.
            </p>

            {/* ✅ Buttons - Always Side by Side */}
            <div className="flex gap-3 mt-8">
              <div className="flex flex-col items-center gap-1">
                <button
                  className="bg-orange-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-orange-600 transition-all active:scale-95 text-sm sm:text-base"
                  onClick={() => navigate("/kundli")}
                >
                  Find Your Kundli
                </button>
                <p className="text-xs text-gray-600">
                  Vedic birth chart analysis
                </p>
              </div>

              <div className="flex flex-col items-center gap-1">
                <button
                  className="bg-white text-orange-500 font-bold py-3 px-6 rounded-xl border border-orange-200 shadow-sm hover:bg-orange-50 transition-all active:scale-95 text-sm sm:text-base"
                  onClick={() => navigate("/nameCorrection")}
                >
                  Name correction
                </button>
                <p className="text-xs text-gray-600">
                  Free with any puja booking
                </p>
              </div>
            </div>
            {/* ✅ Stats - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-10 mt-12">
              {/* Families */}
              <div className="flex items-center gap-3">
                <div className="bg-[#fee4c4] p-2 rounded-lg text-orange-400">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xl font-serif font-bold text-[#3b2a1a] leading-none">
                    5,000+
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                    Happy Families
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="bg-[#fee4c4] p-2 rounded-lg text-orange-400">
                  <Star size={24} fill="currentColor" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-xl font-serif font-bold text-[#3b2a1a] leading-none">
                    4.9★
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                    Average Rating
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Tags */}
            <div className="flex flex-wrap gap-1 mt-8">
              <div className="flex items-center gap-2 bg-orange-200/50 px-2 py-2 rounded-xl">
                <ShieldCheck size={14} className="text-orange-600" />
                <span className="text-xs font-semibold text-gray-600">
                  Verified Pandits
                </span>
              </div>

              <div className="flex items-center gap-2 bg-orange-200/50 px-2 py-2 rounded-xl">
                <Sparkles size={14} className="text-orange-600" />
                <span className="text-xs font-semibold text-gray-600">
                  Fixed Pricing
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative w-full lg:w-1/2 h-[350px] sm:h-[420px] md:h-[500px] rounded-2xl overflow-hidden bg-zinc-900 group">
            {rituals.map((item, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-[1200ms] ${
                  i === index
                    ? "opacity-100 scale-100 z-20"
                    : "opacity-0 scale-110 z-10"
                }`}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-transform duration-[6000ms] ${
                    i === index ? "scale-110" : "scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </div>
            ))}

            {/* Info Card */}
            <div className="absolute bottom-5 w-fit left-5 right-5 sm:right-auto sm:max-w-[90%] z-40">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
                <span className="text-orange-400 text-[10px] font-black uppercase tracking-widest">
                  Ceremony
                </span>

                <h3 className="text-lg sm:text-xl md:text-2xl font-serif text-white font-bold mt-1">
                  {rituals[index].title}
                </h3>

                <p className="text-white/70 text-xs sm:text-sm mt-1">
                  {rituals[index].desc}
                </p>
              </div>
            </div>

            {/* Tablet & Desktop slider dots */}
            <div className="hidden md:flex absolute bottom-5 right-4 z-50 gap-2">
              {rituals.map((_, i) => (
                <span
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`
        h-2 rounded-full cursor-pointer 
        transition-all duration-500 ease-in-out
        ${
          i === index
            ? "bg-orange-300 w-8" // Active dot: Lambi width (Pill shape)
            : "bg-white/50 w-2 hover:bg-white/80" // Inactive dot: Choti width (Circle)
        }
      `}
                ></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="w-full bg-[#FFF4E1] py-12 px-6 pt-20 flex justify-center">
        <div className="max-w-6xl w-full text-center flex flex-col items-center">
          {/* HEADING - Ab margin-bottom kam kar diya hai */}
          <h2 className="text-xl md:text-4xl font-serif font-bold text-[#3b2a1a] mb-4">
            How Would You Like to Experience Puja?
          </h2>

          {/* PARAGRAPH - 2 lines balanced text */}
          <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-2xl mb-12 opacity-90">
            Choose the perfect way to receive divine blessings -
            <br className="hidden md:block" />
            whether you prefer a personal ritual at home or joining devotees
            online.
          </p>

          {/* CARDS GRID */}
          <div className="grid md:grid-cols-2 max-w-4xl mx-auto gap-8 ">
            <div
              className="group p-8 rounded-[20px] bg-[#FFFDF8] border border-orange-200 text-left hover:shadow-2xl hover:border-orange-400 transition-all duration-300 cursor-pointer hover:-translate-y-2"
              onClick={() => navigate("/homePuja")}
            >
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                <HomeIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-3 text-[#1A2B47]">
                Book Offline Puja
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Verified Pandits visit your home with all Samagri. Experience
                the complete traditional ritual in person with your family.
              </p>
              <button className="text-orange-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Book Now <ArrowRight size={18} />
              </button>
            </div>

            <div
              className="group p-8 rounded-[20px] bg-[#FFFDF8] border border-orange-200 text-left hover:shadow-2xl hover:border-orange-400 transition-all duration-300 cursor-pointer hover:-translate-y-2"
              onClick={() => navigate("/temple-puja")}
            >
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">
                <Video size={28} />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-3 text-[#1A2B47]">
                Book Temple Puja
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Join live rituals and seek blessings from sacred temples
                globally via streaming with thousands of devotees worldwide.
              </p>
              <button className="text-orange-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                Join Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER COMPONENTS */}
      <div className="w-full">
        <SpecialPujas />
        <TrendingPuja />
        <DevotionalStats />
        <WhyChooseUs />
        <VerifiedPanditSection />
        <HowItWorks />
        <ReviewSection />
      </div>
    </div>
  );
}
