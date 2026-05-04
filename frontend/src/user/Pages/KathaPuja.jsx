import { MapPin, Calendar, ArrowRight, Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { stripHtml } from "../../utils/stripHtml";
import SEO from "../Components/SEO";
import { CardSkeleton } from "../Components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const upcomingPujas = [
  { id: 101, title: "Maha Shivratri Special Rudrabhishek", date: "Feb 26, 2026", img: "https://i.pinimg.com/736x/f4/7f/a6/f47fa60b150368934020c210c8c49d0d.jpg" },
  { id: 102, title: "Grand Ayodhya Aarti Deepotsav", date: "March 15, 2026", img: "https://images.unsplash.com/photo-1605640840605-14ac1855827b" },
  { id: 103, title: "Holika Dahan Shanti Path", date: "March 24, 2026", img: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b" },
];

export default function KathaPuja() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSevices = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/puja/allServices/katha`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.log("Error", error);
      } finally {
        setLoading(false);
      }
    };
    getSevices();
  }, []);

  const buildImageUrl = (url) => {
    if (!url) return `${API_BASE_URL}/uploads/default.jpg`;
    if (url.startsWith("http")) return url;
    if (url.startsWith("uploads/")) return `${API_BASE_URL}/${url}`;
    if (url.startsWith("/uploads/")) return `${API_BASE_URL}${url}`;
    return `${API_BASE_URL}/uploads/${url}`;
  };

  const filteredServices = services.filter((service) => {
    const name = service.title || service.puja_name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FFF4E1]">
      <SEO 
        title="Divine Katha & Jaap" 
        description="Book verified Pandits for sacred narrations and Jaap rituals. Traditional Katha, Jaap, and Vedic narrations with modern convenience."
        keywords="Katha Jaap, Book Pandit for Katha, Vedic Narrations, Online Jaap Booking, Sri Vedic Puja"
      />
      <section className="relative max-w-7xl mx-auto p-6">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-300 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-amber-200 rounded-full blur-[150px]"></div>
        </div>

        {/* HEADER SECTION */}
        <div className="flex flex-col mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-orange-300"></div>
            <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-orange-600 font-bold">
              Sacred Luxury Rituals
            </span>
            <div className="h-[1px] w-12 bg-orange-300"></div>
          </div>
          <h2 className="text-3xl md:text-6xl font-serif text-[#2f1e12] mb-4">
            Divine <span className="text-orange-600 italic">Katha & Jaap</span>
          </h2>
          <p className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed px-4">
            Authentic Vedic rituals and sacred narrations by master priests,
            bringing peace and prosperity to your spiritual journey.
          </p>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative w-full max-w-2xl mx-auto mb-15">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for Katha, Jaap or Devta..."
            className="w-full pl-12 pr-4 py-2.5 bg-white border border-orange-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[#3b2a1a] text-sm"
          />
        </div>

        {/* SERVICES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/katha-jaap/${service.id}`)}
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 border border-orange-200 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-[0.98]"
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/7] overflow-hidden">
                  <img
                    src={buildImageUrl(service.image_url)}
                    alt={service.puja_name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
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

                {/* Content */}
                <div className="p-5 md:p-4 flex flex-col flex-1">
                  <div className="mb-4 md:mb-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg md:text-2xl font-serif text-[#2f1e12] leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
                        {service.title || service.puja_name}
                      </h3>
                      <button className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm md:rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-600 hover:text-white transition-all duration-500 whitespace-nowrap">
                        Book Now
                      </button>
                    </div>

                    {service.description && (
                      <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed line-clamp-3">
                        {stripHtml(service.description)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center mt-6">
              <h2 className="text-2xl md:text-5xl font-serif text-[#2f1e12] tracking-tight">
                No <span className="text-orange-600 italic">Katha Found</span>
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Try searching with another keyword.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}