import React, { useEffect, useState, useRef } from "react";
import { API } from "../../services/adminApi";
import { CheckCircle2, Star } from "lucide-react";

const PanditCard = ({ pandit }) => {
  const BASE_URL = "http://localhost:5000";
  const imageUrl = `${BASE_URL}/${pandit.image}`;

  return (
    <div className="w-[240px] md:w-[280px] bg-[#FFFDF8] rounded-2xl overflow-hidden shadow-md flex-shrink-0 snap-center group border border-orange-100/50">
      <div className="relative h-[320px] md:h-[360px] w-full bg-gray-200">
        <img
          src={imageUrl}
          alt={pandit.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${pandit.name}&background=FFEDD5&color=EA580C`;
          }}
        />

        {/* ⭐ Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/20">
          <Star size={12} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white text-[11px] font-bold">
            {pandit.rating || "4.8"}
          </span>
        </div>

        {/* Dark Gradient Bottom Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Text Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h3 className="text-white font-bold text-base md:text-lg tracking-wide drop-shadow-md">
              {pandit.name}
            </h3>
            <CheckCircle2 size={18} className="text-blue-500 fill-white" />
          </div>

          <div className="text-gray-300 text-[11px] md:text-[13px] font-medium tracking-wide opacity-90">
            {pandit.location || "Prayagraj"}{" "}
            <span className="mx-1 opacity-50">•</span> Exp :{" "}
            {pandit.experience || "10"} years
          </div>
        </div>
      </div>
    </div>
  );
};

const VerifiedPanditSection = () => {
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchPandits = async () => {
      try {
        const response = await API.get("/verify-pandit");
        setPandits(response.data);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPandits();
  }, []);

  useEffect(() => {
    if (pandits.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [pandits, isPaused]);

  if (loading || pandits.length === 0) return null;

  return (
    <section className="w-full bg-[#FFF4E1] py-12 px-4 md:px-8">
      <div className="max-w-[1250px] mx-auto">
        {/* Updated Header with tighter spacing */}
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-bold mb-3 uppercase tracking-widest shadow-sm">
            🛡️ 100% Secure & Trusted
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3b2a1a] text-center leading-tight mb-4">
            Our Verified Pandits
          </h2>

          <p className="text-gray-500 text-sm sm:text-base md:text-lg text-center max-w-2xl leading-relaxed opacity-90">
            Connect with highly experienced and background-verified Vedic
            scholars
          </p>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex overflow-x-auto gap-5 md:gap-7 pb-6 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {pandits.map((item, index) => (
            <PanditCard key={item.id || index} pandit={item} />
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default VerifiedPanditSection;
