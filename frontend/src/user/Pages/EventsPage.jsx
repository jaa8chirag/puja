import React, { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, MapPin } from "lucide-react";
import { stripHtml } from "../../utils/stripHtml";
import SEO from "../Components/SEO";
import { CardSkeleton } from "../Components/Skeleton";

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

  return (
    <div className="bg-gradient-to-b from-orange-100 to-white min-h-screen">
      <SEO 
        title="Temple Events & Festivals" 
        description="Discover sacred celebrations, spiritual gatherings, and divine rituals at Sri Vedic Puja. Join us for upcoming festivals and special temple events."
        keywords="Temple Events, Hindu Festivals, Spiritual Gatherings, Vedic Celebrations, Puja Events"
      />
      {/* Header */}
      <div className="bg-orange-400 py-8 text-center text-white">
        <h1 className="text-3xl md:text-5xl font-black mb-4 px-4">
          Temple Events & Festivals
        </h1>
        <p className="text-sm md:text-lg opacity-90 max-w-2xl mx-auto px-6">
          Discover sacred celebrations, spiritual gatherings, and divine rituals 
          that bring positivity and peace into life.
        </p>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)
        ) : eventsData.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-[600px]"
          >
            <div className="h-56 bg-gray-100">
              <img
                // Image URL handling: check if it's external or local
                src={`${API_BASE_URL}/uploads/${event.image}`}
                alt={event.title}
                loading="lazy"
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