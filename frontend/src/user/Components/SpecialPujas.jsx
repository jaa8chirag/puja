import { MapPin, Calendar, ArrowRight, Ticket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { stripHtml } from "../../utils/stripHtml";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function SpecialPujas() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const getSevices = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${API_BASE_URL}/puja/temple-puja`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
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

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1B08] pt-16 md:pt-20 selection:bg-orange-100">
      {/* Reduced px-6 to px-4 and pt-10 to pt-6 for mobile */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-16 md:pb-20">

        {/* TOP HEADER - Scaled for Mobile */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#3b2a1a] mb-2 md:mb-4">
            Upcoming Group Pujas
          </h2>

          <p className="text-gray-500 text-sm md:text-lg leading-relaxed max-w-3xl mx-auto opacity-90 px-2">
            Join thousands of devotees in collective worship - receiving blessings from anywhere.
          </p>
        </div>

        {/* SERVICES GRID - Tightened gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 justify-items-center">
          {services
            .filter(service =>
              (service.puja_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (service.title && service.title.toLowerCase().includes(searchTerm.toLowerCase()))) &&
              Number(service.is_featured) === 1
            )
            .slice(0, 3)
            .map((service) => (
              <div
                key={service.service_id}
                onClick={() => navigate(`/temple-puja/${service.service_id}`)}
                className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden border border-orange-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col active:scale-[0.98] w-full"
              >
                {/* IMAGE - Reduced height from h-64 to h-48 on mobile */}
                <div className="relative w-full aspect-[16/7] overflow-hidden">
                  <img
                    src={`${API_BASE_URL}/uploads/${service.image_url}`}
                    alt={service.puja_name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1108]/90 via-transparent to-transparent opacity-60" />

                  {/* Badge scaled down */}
                  <div className="absolute top-3 left-3 z-20">
                    <div className="bg-orange-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Sparkles size={10} fill="white" className="text-white" />
                      <span className="text-[11px] capitalize md:text-[13px] font-bold tracking-wide">
                        {service.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CONTENT - Reduced padding from p-8 to p-5 */}
                <div className="p-5 md:p-8 flex flex-col flex-1 text-left">
                  <div className="flex-1">
                    {/* Tagline */}


                    {/* Title Scaled */}
                    <h3 className="text-xl md:text-2xl font-serif mb-2 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                      {service.title || service.puja_name}
                    </h3>

                    {/* About - smaller text */}
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                      {stripHtml(service.about)}
                    </p>

                    <div className="flex items-center justify-between w-full mt-2">
                      {/* Left Side: Address and Time together */}
                      <div className="flex flex-col gap-1.5 min-w-0">

                        {/* 1. Location Row */}
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-orange-500 shrink-0" />
                          <p className="text-gray-500 text-xs line-clamp-1">
                            {service.address}
                          </p>
                        </div>

                        {/* 2. Date & Time Row */}
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

                      {/* Right Side: Arrow Button (Now perfectly centered to both lines) */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border border-orange-100 bg-orange-50 group-hover:bg-orange-600 flex items-center justify-center text-orange-600 group-hover:text-white transition-all duration-500 shadow-sm shrink-0 ml-4">
                        <ArrowRight size={18} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
        </div>

        {/* Bottom Button - Scaled for mobile */}
        <div className="flex pt-8 md:pt-10 justify-center px-4">
          <button
            onClick={() => navigate('/temple-puja')}
            className="group relative flex items-center justify-center gap-2 bg-orange-500 text-white w-full md:w-auto md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold tracking-widest text-[11px] md:text-[12px] shadow-lg active:scale-95 transition-all"
          >
            <span className="relative z-10">View All Group Pujas</span>
            <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </section>
    </div>
  );
}