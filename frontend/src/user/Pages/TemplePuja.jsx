import { MapPin, Calendar, ArrowRight, Search, Ticket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { stripHtml } from "../../utils/stripHtml";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function TemplePuja() {

  const slides = [
    { image: "/img/slider1.jpeg", quote: "Where devotion meets divinity, every prayer finds its way to the heavens." },
    { image: "/img/slider2.jpeg", quote: "In the silence of the temple, the soul speaks its truest prayers." },
    { image: "/img/slider3.jpeg", quote: "A single flame of faith can illuminate the darkest corners of the heart." }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
        const response = await fetch(`${API_BASE_URL}/puja/temple-puja`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setServices(data.data);
      } catch (error) {
        console.log("Error", error);
      }
    };
    getSevices();
  }, []);

  const filteredServices = services.filter(service =>
    service.puja_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.title && service.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1B08] selection:bg-orange-100">
      {/* Soft Ambient Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-200/20 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      <section className="relative max-w-7xl mx-auto px-6 pt-6 pb-5">

        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-orange-300"></div>
            <span className="text-xs tracking-[0.3em] uppercase text-orange-600 font-bold">
              Sacred Luxury Rituals
            </span>
            <div className="h-[1px] w-12 bg-orange-300"></div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif mb-4 tracking-tight text-[#1A1108]">
            Divine <span className="text-orange-600 italic">Temple Puja</span>
          </h1>

          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            Authentic Vedic rituals and sacred narrations by master priests,
            bringing peace and prosperity to your spiritual journey.
          </p>
        </div>

        {/* PREMIUM COMPACT SLIDER */}
        <div className="relative w-full max-w-6xl mx-auto border-2 border-orange-400 mb-12 overflow-hidden rounded-[28px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.18)]">
          <div
            className="flex transition-transform duration-900 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="min-w-full h-[300px] md:h-[300px] flex items-center justify-center relative"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
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
        <div className="relative w-full max-w-2xl mx-auto mb-15">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for Katha, Jaap or Devta..."
            className="w-full pl-12 pr-4 py-2 bg-white border border-orange-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[#3b2a1a]"
          />
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 justify-items-center">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div
                key={service.service_id}
                onClick={() => navigate(`/temple-puja/${service.service_id}`)}
                className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col active:scale-[0.98] w-full"
              >
                {/* IMAGE */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                  <img
                    src={`${API_BASE_URL}/uploads/${service.image_url}`}
                    alt={service.puja_name}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1108]/90 via-transparent to-transparent opacity-60" />

                  {service.status && service.status.trim() !== "" && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Sparkles size={10} fill="white" />
                        <span className="text-[11px] md:text-[13px] font-bold capitalize tracking-wide">
                          {service.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-5 md:p-8 flex flex-col flex-1 text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-orange-600">
                        Vedic Path
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif mb-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                      {service.title || service.puja_name}
                    </h3>

                    <p className="text-gray-700 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                      {stripHtml(service.about)}
                    </p>

                    <div className="flex items-center justify-between w-full mt-2">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-orange-500 shrink-0" />
                          <p className="text-gray-500 text-xs line-clamp-1">
                            {service.address}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-orange-500 shrink-0" />
                          <div className="flex items-center gap-1.5 font-bold text-[12px] md:text-[13px] text-gray-700 whitespace-nowrap">
                            <span>
                              {new Date(service.dateOfStart).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                            <span className="text-orange-300">|</span>
                            <span className="text-gray-500 font-medium">
                              {new Date(service.dateOfStart).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="shrink-0 px-2 py-1 md:px-4 md:py-2 rounded-xl text-sm md:rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-600 hover:text-white transition-all duration-500">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center mt-6">
              <h2 className="text-3xl md:text-5xl font-serif text-[#2f1e12] tracking-tight">
                No <span className="text-orange-600 italic">Temple Puja Found</span>
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