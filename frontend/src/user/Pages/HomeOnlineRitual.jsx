import { Calendar, ArrowRight, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function HomeOnlineRitual() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/img/slider1.jpeg",
      quote:
        "Bring the divine into your home, where every prayer becomes a blessing.",
    },
    {
      image: "/img/slider2.jpeg",
      quote: "A home filled with sacred rituals is a home blessed by the gods.",
    },
    {
      image: "/img/slider3.jpeg",
      quote:
        "Let the fragrance of incense and the chants of Vedas purify your abode.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const getSevices = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/puja/online_pind_dan`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setServices(data.data);
      } catch (error) {
        console.log("Error", error);
      }
    };

    getSevices();
  }, []);

  const filteredServices = (services || []).filter((service) => {
    const name = service.title || service.puja_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FFF4E1]">
      <section className="relative max-w-7xl mx-auto px-6 pt-6 pb-5">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-300 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-200 rounded-full blur-[150px]"></div>
        </div>

        {/* HEADER */}
        <div className="flex flex-col mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-orange-300"></div>
            <span className="text-xs tracking-[0.3em] uppercase text-orange-600 font-bold">
              Sacred Luxury Rituals
            </span>
            <div className="h-[1px] w-12 bg-orange-300"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-serif text-[#2f1e12] tracking-tight mb-4">
            Divine <span className="text-orange-600 italic">Home Puja</span>
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Bring the sanctity of the temple to your doorstep with authentic
            Vedic ceremonies performed by master priests.
          </p>
        </div>

        {/* SLIDER */}
        <div className="relative w-full max-w-6xl mx-auto border-2 border-orange-400 mb-12 overflow-hidden rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)]">
          <div
            className="flex transition-transform duration-900 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="min-w-full h-[300px] flex items-center justify-center relative"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                {/* Cinematic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20"></div>

                {/* Quote Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6 text-center">
                  <p className="text-white text-lg md:text-2xl font-serif italic leading-relaxed drop-shadow-lg max-w-2xl">
                    "{slide.quote}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH INPUT */}
        <div className="max-w-7xl mx-auto px-6 pb-16 bg-[#FFF4E1]">
          <div className="relative w-full max-w-2xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
              size={20}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for Temple, God or Dosha..."
              className="w-full pl-12 pr-4 py-2 bg-white border border-orange-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[#3b2a1a]"
            />
          </div>
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/online-ritual/${service.id}`)}
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 border border-orange-200 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-[0.98]"
              >
                {/* Image */}
                {/* Image */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img
                    src={`${API_BASE_URL}/uploads/${service.image_url}`}
                    alt={service.puja_name}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />

                  {/* ✅ Sirf tab dikhe jab status ho */}
                  {service.status && service.status.trim() !== "" && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Sparkles size={10} fill="white" />
                        <span className="text-[11px] md:text-[13px] capitalize font-bold tracking-wide">
                          {service.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 md:p-4 flex flex-col flex-1">
                  <div className="mb-4 md:mb-2">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="flex-1 min-w-0 text-lg md:text-2xl font-serif text-[#2f1e12] leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
                        {service.title || service.puja_name}
                      </h3>

                      <button className="shrink-0 px-2 py-1 md:px-4 md:py-2 rounded-xl text-sm md:rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-600 hover:text-white transition-all duration-500">
                        Book Now
                      </button>
                    </div>

                    <div className="flex items-center text-gray-400 text-[10px] md:text-xs font-medium gap-2">
                      <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded">
                        <Calendar size={10} className="text-orange-500" />
                        <span className="text-orange-700">Available Daily</span>
                      </div>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>At Home</span>
                    </div>

                    {service.description && (
                      <p className="mt-2 text-gray-500 text-[12px] md:text-[13px] leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center mt-6">
              <h2 className="text-3xl md:text-5xl font-serif text-[#2f1e12] tracking-tight">
                No <span className="text-orange-600 italic">Puja Found</span>
              </h2>
              <p className="text-gray-500 mt-2">
                Try searching with another keyword.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
