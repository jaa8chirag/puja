import {
  ShieldCheck,
  Clock,
  IndianRupee,
  Star,
  Headphones,
  BookOpen,
} from "lucide-react";

const reasons = [
  {
    icon: <ShieldCheck size={28} />,
    title: "Verified Pandits",
    desc: "Every pandit is background-checked, experienced, and certified in Vedic traditions before joining our platform.",
    highlight: "100% Verified",
  },
  {
    icon: <IndianRupee size={28} />,
    title: "Fixed & Transparent Pricing",
    desc: "No hidden charges. What you see is what you pay — complete packages including Samagri and Dakshina.",
    highlight: "No Hidden Fees",
  },
  {
    icon: <Clock size={28} />,
    title: "On-Time Guarantee",
    desc: "Our pandits arrive on time, every time. We respect the auspicious muhurat you've chosen for your ceremony.",
    highlight: "Always Punctual",
  },
  {
    icon: <BookOpen size={28} />,
    title: "Complete Samagri Provided",
    desc: "All puja materials — from flowers to holy items — are sourced authentically and delivered to your doorstep.",
    highlight: "All Inclusive",
  },
  {
    icon: <Star size={28} fill="currentColor" />,
    title: "4.9★ Rated Service",
    desc: "Over 5,000 happy families trust us for their most sacred moments — their satisfaction speaks for itself.",
    highlight: "Top Rated",
  },
  {
    icon: <Headphones size={28} />,
    title: "24/7 Devotional Support",
    desc: "Have questions about rituals or need to reschedule? Our support team is always available to assist you.",
    highlight: "Always Available",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="w-full bg-[#FFF4E1] py-16 px-4 sm:px-6 md:px-10 flex justify-center">
      <div className="max-w-6xl w-full flex flex-col items-center">
        {/* Header */}
        <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
          ✨ Our Promise to You
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#3b2a1a] text-center leading-tight mb-4">
          Why Families should Choose Sri Vedic Puja.
        </h2>

        <p className="text-gray-500 text-sm sm:text-base md:text-lg text-center max-w-2xl leading-relaxed mb-12 opacity-90">
          We combine ancient traditions with modern reliability — so you can
          focus on your devotion while we handle everything else.
        </p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {reasons.map((item, i) => (
            <div
              key={i}
              className="group relative bg-[#FFFDF8] border border-orange-100 rounded-[20px] p-6 hover:shadow-2xl hover:border-orange-300 hover:-translate-y-1.5 transition-all duration-300 cursor-default overflow-hidden"
            >
              {/* Decorative blob */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-orange-100 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

              {/* Icon */}
              <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-orange-200 group-hover:scale-110 transition-transform duration-300 relative z-10">
                {item.icon}
              </div>

              {/* Highlight Badge */}
              <span className="inline-block bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3">
                {item.highlight}
              </span>

              {/* Title */}
              <h3 className="text-lg font-serif font-bold text-[#1A2B47] mb-2 leading-snug">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
