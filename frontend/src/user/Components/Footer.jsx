import { NavLink } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({ phone: null, email: null });
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubscribe = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus({ type: "error", message: "Invalid email" });
      return;
    }
    setSubscribing(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", message: data.message });
        setEmail("");
      } else {
        setStatus({ type: "error", message: data.message });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Failed to subscribe" });
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/personal-info`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const active = json.data.find((item) => item.is_active === 1);
          if (active) {
            setContactInfo({
              phone: active.phone_name,
              email: active.email,
            });
          }
        }
      } catch (error) {
        console.error("❌ Footer contact fetch error:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const footerLinks = {
    services: [
      { label: "Home Puja", to: "/home-puja" },
      { label: "Temple Puja", to: "/temple-puja" },
      { label: "Pind Dan", to: "/pind-dan" },
      { label: "Katha/Jaap", to: "/katha-jaap" },
    ],
    support: [
      { label: "About Us", to: "/about-us" },
      { label: "Contact Us", to: "/help" },
      { label: "FAQs", to: "/help" },
    ],
    policy: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Cancellation Policy", to: "/cancellation-policy" },
      { label: "Terms and Conditions", to: "/terms-and-conditions" },
      { label: "Disclaimer Policy", to: "/disclaimer" },
    ],
    community: [
      { label: "Temple Gallery", to: "/temples" },
      { label: "Events Gallery", to: "/events" },
      { label: "Aarti Gallery", to: "/aarti" },
      { label: "Blog", to: "/blogs" },
    ],
  };

  return (
    <footer className="bg-orange-200 border-t border-orange-100">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8">
          {/* 1. BRAND & SOCIALS */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col justify-between items-center lg:items-start border-b border-orange-300/30 pb-4 lg:border-0 lg:pb-0">
            <div className="flex items-center gap-2">
              <img
                src="/img/download.jpg"
                alt="Logo"
                loading="lazy"
                className="h-8 w-8 rounded-lg shadow-sm"
              />
              <span className="text-lg font-serif font-bold text-[#3b2a1a] whitespace-nowrap">
                Sri Vedic <span className="text-orange-500">Puja</span>
              </span>
            </div>

            <p className="hidden lg:block text-[12px] text-gray-600 mt-1 leading-relaxed max-w-[240px]">
              Sri Vedic Puja Authentic rituals, simplified. We connect you with 100% verified Pandits for offline (across Delhi NCR) and online pujas. Your devotion, our dedication.
            </p>

            <div className="flex gap-2 lg:mt-4">
              <a
                href="https://www.facebook.com/people/Sri-Vedic-Puja/61586142146173/?mibextid=wwXIfr&rdid=6Kgef2miIOxPDI49&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1CToPuZ42o%2F%3Fmibextid%3DwwXIfr%26ref%3D1"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white/60 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/srivedicpuja"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white/60 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com/@srivedicpuja"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-white/60 rounded-full text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* 2. LINKS SECTIONS */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-y-1 gap-x-2 md:gap-x-1">
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 mb-3 ml-1">
                Services
              </h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className="text-gray-600 text-[12px] hover:text-orange-600 truncate block px-1"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 mb-3 ml-1">
                Community
              </h4>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className="text-gray-600 text-[12px] hover:text-orange-600 truncate block px-1"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 sm:pt-0">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 mb-3 ml-1">
                Support
              </h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className="text-gray-600 text-[12px] hover:text-orange-600 truncate block px-1"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 sm:pt-0">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 mb-3 ml-1">
                Policies
              </h4>
              <ul className="space-y-2">
                {footerLinks.policy.map((link) => (
                  <li key={link.label}>
                    <NavLink
                      to={link.to}
                      className="text-gray-600 text-[12px] hover:text-orange-600 whitespace-nowrap block px-1"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. CONTACT & NEWSLETTER */}
          <div className="lg:col-span-3 flex flex-col space-y-4 border-t border-orange-300/30 pt-4 lg:border-0 lg:pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">Delhi NCR, India</span>
              </div>
              <div className="flex flex-col gap-2">
                {/* Phone - from backend */}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone size={14} className="text-orange-500 shrink-0" />
                  <span>{contactInfo.phone || "+91 9771157571"}</span>
                </div>
                {/* Email - from backend */}
                <div className="flex items-center gap-2 text-xs text-gray-600 truncate">
                  <Mail size={14} className="text-orange-500 shrink-0" />
                  <span className="truncate">{contactInfo.email || "info@srivedicpuja.com"}</span>
                </div>
              </div>
            </div>

            {/* Newsletter Section - Redesigned for "Real Application" feel */}
            <div className="mt-2 pt-4 border-t border-orange-300/20 lg:border-t-0 lg:pt-0">
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-orange-800 mb-2">
                Divine Updates
              </h4>
              <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
                Join our spiritual community for sacred insights, ritual dates, and exclusive Vedic updates.
              </p>

              <div className="flex flex-col gap-2">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail size={12} className="text-orange-400 group-focus-within:text-orange-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white border-2 border-orange-100 rounded-xl pl-9 pr-12 py-2.5 text-xs focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium placeholder:text-gray-400"
                  />
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-sm"
                    aria-label="Subscribe"
                  >
                    {subscribing ? (
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span className="text-[10px] font-bold">JOIN</span>
                    )}
                  </button>
                </div>
                {status && (
                  <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg animate-in slide-in-from-top-1 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <div className={`w-1 h-1 rounded-full ${status.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="text-[9px] font-bold uppercase tracking-tight">
                      {status.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-6 pt-4 border-t border-orange-300/30 text-center">
          <p className="text-[10px] text-gray-500">
            © 2026 Sri Vedic Puja. Spiritual tradition, modern access.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
