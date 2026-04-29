import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, MapPin, Loader2 } from "lucide-react";
import { stripHtml } from "../../utils/stripHtml";

const EventsPage = () => {
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend base URL (Apne env ke hisaab se check karein)
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/content/events`);
        // Agar controller mein { success: true, data: [...] } bhej rahe ho
        const data = response.data.data || response.data;
        setEventsData(data);
      } catch (error) {
        console.error("🔱 Events fetching error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-orange-50">
        <Loader2 className="animate-spin text-orange-500" size={48} />
        <p className="text-orange-600 font-bold animate-pulse">Loading Sacred Events...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-orange-100 to-white min-h-screen">
      {/* Header */}
      <div className="bg-orange-400 py-8 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Temple Events & Festivals
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Discover sacred celebrations, spiritual gatherings, and divine rituals 
          that bring positivity and peace into life.
        </p>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {eventsData.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-[600px]"
          >
            <div className="h-56 bg-gray-100">
              <img
                // Image URL handling: check if it's external or local
                src={`${API_BASE_URL}/uploads/${event.image}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold mb-2">
                  <CalendarDays size={16} />
                  {event.date}
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {event.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin size={16} />
                  {event.location}
                </div>

                <p className="text-gray-600 text-sm leading-6 line-clamp-6">
                  {stripHtml(event.description)}...
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;