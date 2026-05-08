import { MapPin, Calendar, ArrowRight, Ticket } from "lucide-react";
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
    <div className="min-h-fit bg-[#FFF4E1] text-[#2D1B08] pt-16 md:pt-20 selection:bg-orange-100">
      {/* Reduced px-6 to px-4 and pt-10 to pt-6 for mobile */}
      <section className="relative max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-10 md:pb-12">

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
          {Array.isArray(services) && services
            .filter(service => {
              const name = service.puja_name || service.title || "";
              return name.toLowerCase().includes(searchTerm.toLowerCase());
            })
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

                </div>

                {/* CONTENT */}
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

                    {/* Location, Date and Time Info block - Moved right below Puja Name */}
                    <div className="flex flex-col gap-1.5 mt-1 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-orange-500 shrink-0" />
                        <p className="text-gray-500 text-[11px] md:text-xs line-clamp-1">
                          {service.address}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-orange-500 shrink-0" />
                        <div className="flex items-center gap-1.5 font-bold text-[11px] md:text-[12px] text-gray-700 whitespace-nowrap">
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

                    <p className="text-gray-500 text-[13px] md:text-[14px] leading-relaxed line-clamp-3">
                      {stripHtml(service.about)}
                    </p>
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