import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin, Loader2 } from "lucide-react";

const AartiPage = () => {
  const [aartiData, setAartiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend ka base URL (Apne hisaab se check kar lena)

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAartis = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/content/aartis`);
        // Agar aapne controller mein { data: rows } bheja hai toh res.data.data use karein
        // Warna sirf res.data
        const data = response.data.data || response.data;
        setAartiData(data);
      } catch (error) {
        console.error("🔱 Error fetching aartis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAartis();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-orange-600 font-bold animate-pulse">Connecting to divine energy...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-orange-100 to-white min-h-screen">
      <div className="bg-orange-400 py-8 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Daily Aarti Schedule</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Participate in sacred aarti ceremonies and experience divine energy, devotion, and spiritual peace.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {aartiData.map((aarti) => (
          <div
            key={aarti.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-[600px]"
          >
            <div className="h-56 bg-gray-200">
              <img
                // Image URL agar local path hai toh Backend URL prepend karein
                src={`${API_BASE_URL}/uploads/${aarti.image}`}
                alt={aarti.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold mb-2">
                  <Clock size={16} />
                  {aarti.time}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">{aarti.title}</h2>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin size={16} />
                  {aarti.location}
                </div>

                <p className="text-gray-600 text-sm leading-6 line-clamp-6">
                  {aarti.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AartiPage;