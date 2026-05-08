import {
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { stripHtml } from "../../utils/stripHtml";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function TrendingPuja() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getSevices = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(
          `${API_BASE_URL}/puja/allServices/home_puja`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setServices(data.services);
      } catch (error) {
        console.log("Error", error);
      }
    };
    getSevices();
  }, []);

  const filteredServices = services
    .filter((service) => {
      const name = service.title || service.puja_name || "";
      // Check for search term AND is_featured status
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .slice(0, 3);

  return (
    <div className="min-h-fit bg-[#FFF4E1] pb-10 md:pb-16">
      <section className="relative max-w-7xl mx-auto p-5 md:p-10">

        {/* HEADER SECTION */}
        <div className="mb-6 md:mb-6 flex flex-row items-center justify-between pb-4 md:pb-6 lg:border-none">
          <div className="flex flex-col">
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#3b2a1a]">
              Trending Pujas
            </h2>
            <p className="text-gray-500 text-sm md:text-lg opacity-90">
              Most booked ceremonies this month.
            </p>
          </div>

          <button
            onClick={() => navigate('/home-puja')}
            className="group flex items-center gap-1.5 bg-white hover:bg-orange-600 text-orange-600 hover:text-white border border-orange-300 px-3 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-bold text-[10px] md:text-sm transition-all duration-300 active:scale-95"
          >
            <span>View All</span>
            <ArrowRight size={14} className="md:w-[18px] transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {Array.isArray(filteredServices) && filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/home-puja/${service.id}`)}
              className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-500 border border-orange-200 cursor-pointer flex flex-col hover:-translate-y-2 active:scale-[0.98]"
            >
              {/* Image */}
              <div className="relative w-full aspect-[16/7] overflow-hidden">
                <img
                  src={`${API_BASE_URL}/uploads/${service.image_url}`}
                  alt={service.puja_name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />

              </div>

              {/* Content */}
              <div className="p-5 md:p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg md:text-2xl font-serif text-[#2f1e12] leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
                      {service.title || service.puja_name}
                    </h3>
                    <button className="shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm md:rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 font-medium hover:bg-orange-600 hover:text-white transition-all duration-500 whitespace-nowrap">
                      Book Now
                    </button>
                  </div>

                  {service.description && (
                    <p className="mt-2 text-gray-500 text-[13px] md:text-[14px] leading-relaxed line-clamp-3">
                      {stripHtml(service.description)}
                    </p>
                  )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}