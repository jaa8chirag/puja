import React from "react";
import { Clock, MapPin } from "lucide-react";

const aartiData = [
  {
    id: 1,
    title: "Morning Mangala Aarti",
    time: "5:00 AM",
    location: "ISKCON Temple, Vrindavan",
    description:
      "Mangala Aarti is performed early morning to awaken the divine energy within the temple. Devotees gather before sunrise to chant holy mantras and sing devotional hymns. The peaceful environment creates a spiritually uplifting experience. Lamps are offered with deep devotion and gratitude. The ritual symbolizes purity and positivity at the start of the day. It fills the heart with peace and divine blessings.",
    image:
      "/img/iskcon.jpg",
  },
  {
    id: 2,
    title: "Ganga Aarti",
    time: "6:30 PM",
    location: "Dashashwamedh Ghat, Varanasi",
    description:
      "Ganga Aarti is a grand spiritual ceremony dedicated to the holy river Ganga. Priests perform synchronized rituals with large lamps and rhythmic chants. The glowing diyas reflect beautifully on the river water. Devotees gather in large numbers to witness this divine spectacle. The atmosphere becomes filled with faith and devotion. It is a mesmerizing experience of spiritual energy.",
    image:
      "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1",
  },
  {
    id: 3,
    title: "Sandhya Aarti",
    time: "7:00 PM",
    location: "Prem Mandir, Vrindavan",
    description:
      "Sandhya Aarti is performed during sunset when the sky glows with golden hues. Devotional songs and bell sounds fill the air. Priests offer lamps to the deity with devotion. The temple lights create a divine atmosphere. Devotees feel spiritually connected during the ritual. It symbolizes gratitude for the day’s blessings.",
    image:
      "/img/prem_mandir.jpg",
  },
  {
    id: 4,
    title: "Shiv Aarti",
    time: "8:00 PM",
    location: "Somnath Temple, Gujarat",
    description:
      "Shiv Aarti is dedicated to Lord Shiva and performed with sacred chants. Devotees offer milk, flowers, and lamps during the ritual. The powerful mantras create a divine vibration. The temple resonates with spiritual energy. It brings calmness and inner strength. The ceremony symbolizes devotion and surrender.",
    image:
      "/img/Shiv_Aarti.jpg",
  },
  {
    id: 5,
    title: "Krishna Aarti",
    time: "6:00 PM",
    location: "Banke Bihari Temple, Vrindavan",
    description:
      "Krishna Aarti is performed with melodious bhajans and flute music. Devotees sing with love and devotion. The temple is decorated beautifully with flowers. Lamps are offered with joyful chants. The atmosphere becomes filled with divine love. It strengthens devotion towards Lord Krishna.",
    image:
      "/img/Krishna_Aarti.jpg",
  },
  {
    id: 6,
    title: "Hanuman Aarti",
    time: "6:30 AM",
    location: "Hanuman Garhi, Ayodhya",
    description:
      "Hanuman Aarti is performed with powerful chants praising Lord Hanuman. Devotees seek strength and protection. The temple resonates with energetic vibrations. Sacred lamps are offered with devotion. The ritual fills devotees with courage and faith. It is a spiritually empowering experience.",
    image:
      "/img/Hanuman_Aarti.jpg",
  },
  {
    id: 7,
    title: "Lakshmi Aarti",
    time: "7:30 PM",
    location: "Mahalakshmi Temple, Mumbai",
    description:
      "Lakshmi Aarti is performed to seek prosperity and blessings. Devotees offer flowers and light lamps. The temple shines brightly during the ritual. Sacred hymns create a divine environment. The ceremony symbolizes wealth and positivity. It fills the heart with gratitude.",
    image:
      "/img/Lakshmi_Aarti.jpg",
  },
  {
    id: 8,
    title: "Durga Aarti",
    time: "6:00 PM",
    location: "Vaishno Devi Temple, Katra",
    description:
      "Durga Aarti is performed with devotion to Goddess Durga. Devotees chant powerful mantras seeking blessings. The temple is decorated with vibrant flowers. The spiritual energy feels uplifting. The ritual symbolizes protection and divine strength. It inspires faith and devotion.",
    image:
      "/img/Durga_Aarti.jpg",
  },
  {
    id: 9,
    title: "Sai Baba Aarti",
    time: "7:00 PM",
    location: "Shirdi Sai Temple, Maharashtra",
    description:
      "Sai Baba Aarti is performed with heartfelt devotion. Devotees gather to sing sacred hymns. The temple atmosphere becomes peaceful and divine. Lamps are offered as a symbol of faith. The ritual spreads positivity and calmness. It strengthens spiritual connection with Sai Baba.",
    image:
      "/img/Sai_Baba_Aarti.jpg",
  },
];

const AartiPage = () => {
  return (
    <div className="bg-gradient-to-b from-orange-100 to-white min-h-screen">

      <div className="bg-orange-400 py-8 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Daily Aarti Schedule
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Participate in sacred aarti ceremonies and experience divine energy,
          devotion, and spiritual peace.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 sm:grid-cols-2 gap-8">

        {aartiData.map((aarti) => (
          <div
            key={aarti.id}
            className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-[600px]"
          >
            <div className="h-56">
              <img
                src={aarti.image}
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

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {aarti.title}
                </h2>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin size={16} />
                  {aarti.location}
                </div>

                <p className="text-gray-600 text-sm leading-6">
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