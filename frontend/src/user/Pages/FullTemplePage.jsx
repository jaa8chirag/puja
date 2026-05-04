import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Search, ChevronRight, Sparkles } from 'lucide-react';
import SEO from "../Components/SEO";
import { CardSkeleton } from "../Components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const FullTemplePage = () => {
  const [temples, setTemples] = useState([]); // Humesha empty array se start karein
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCity, setActiveCity] = useState("All");

  const cities = ["All", "Gaya", "Varanasi", "Mathura", "Ayodhya", "Ujjain", "Puri", "Vrindavan", "Tirumala", "Amritsar"];

  useEffect(() => {
    const fetchTemples = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/content/mandir/all`);
        
        // FIX: Agar backend se { success: true, data: [...] } aa raha hai
        if (response.data && response.data.success) {
          setTemples(response.data.data); 
        } else if (Array.isArray(response.data)) {
          // Backup check agar seedha array aa raha ho
          setTemples(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setTemples([]); // Error par empty array rakhein taaki filter crash na ho
      } finally {
        setLoading(false);
      }
    };
    fetchTemples();
  }, []);

  // Filter Logic with Safety Check
  const filteredTemples = useMemo(() => {
    if (!Array.isArray(temples)) return []; // Safety check

    return temples.filter(t => {
      const name = t.name?.toLowerCase() || "";
      const location = t.location?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = name.includes(search) || location.includes(search);
      const matchesCity = activeCity === "All" || location.includes(activeCity.toLowerCase());
      
      return matchesSearch && matchesCity;
    });
  }, [temples, searchTerm, activeCity]);

  return (
    <div className="bg-[#FFF4E1] min-h-screen font-sans">
      <SEO 
        title="Divine Temples of India" 
        description="Discover the history, timings, and spiritual essence of India's most sacred pilgrimages. Explore ancient temples from Varanasi, Gaya, Ayodhya, and more."
        keywords="India Temples, Sacred Pilgrimage, Hindu Temples, Temple Timings, Divine Locations"
      />
      
      {/* HERO SECTION */}
      <section className="bg-[#FFF4E1] pt-12 md:pt-16 pb-20 md:pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest">
              <Sparkles size={14} /> Explore Divine India
            </div>
            <h1 className="text-3xl md:text-6xl font-black text-[#2D2D2D] leading-tight">
              Connect with <br />
              <span className="text-orange-600">Divine Temples</span>
            </h1>
            <p className="text-gray-600 text-sm md:text-lg max-w-md font-medium">
              Discover the history, timings, and spiritual essence of India's most sacred pilgrimages.
            </p>
          </div>
          <div className="hidden lg:flex justify-end">
            <img src="/img/img_hero_artwork_en.webp" className="w-full max-w-lg drop-shadow-2xl animate-float" alt="Hero" />
          </div>
        </div>
      </section>

      {/* SEARCH & FILTERS */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search temples..." 
                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-1 gap-3 overflow-x-auto no-scrollbar pb-1 w-full">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                    activeCity === city 
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-200 scale-105' 
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-orange-300'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-800">Prasiddh Mandir</h2>
              <p className="text-gray-400 text-sm font-medium">Showing {filteredTemples.length} temples</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTemples.map((temple) => (
                <Link to={`/temples/${temple.id}`} key={temple.id} className="group">
                  <div className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 h-full flex flex-col">
                    <div className="relative aspect-[4/3] m-2 overflow-hidden rounded-[1rem] bg-gray-100">
                      {temple.image_url_1 ? (
                        <img 
                          src={`${API_BASE_URL}/uploads/${temple.image_url_1}`}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={temple.name}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/400x300?text=Temple"; 
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                          <Sparkles className="text-orange-200" size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-6 pt-2 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                        <MapPin size={12} className="text-orange-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{temple.location}</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{temple.name}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 mb-4">{temple.about}</p>
                      <div className="mt-auto flex items-center justify-between">
                         <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">Explore Now</span>
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && filteredTemples.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-lg">No temples found!</p>
            <button onClick={() => {setActiveCity("All"); setSearchTerm("");}} className="text-orange-600 font-bold mt-2 underline">View All Temples</button>
          </div>
        )}
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default FullTemplePage;