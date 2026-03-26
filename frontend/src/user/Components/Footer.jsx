import { NavLink } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    services: [
      { label: "Home Puja", to: "/homePuja" },
      { label: "Temple Puja", to: "/temple-puja" },
      { label: "Pind Dan", to: "/pind-dan" },
      { label: "Katha/Jaap", to: "/katha-jaap" },
    ],
    support: [
      { label: "About Us", to: "/aboutUs" },
      { label: "Contact Us", to: "/help" },
      { label: "FAQs", to: "/help" },
      { label: "Privacy Policy", to: "/pricaypolicy" },
    ],
    community: [
      { label: "Temple Gallery", to: "/temples" },
      { label: "Events Gallery", to: "/events" },
      { label: "Aarti Gallery", to: "/aarti" },
      { label: "Blog", to: "/blogs" },
    ]
  };

  return (
    <footer className="bg-orange-200 border-t border-orange-100">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8">
          
          {/* 1. BRAND & SOCIALS - Single row on mobile */}
          <div className="lg:col-span-4 flex flex-row lg:flex-col justify-between items-center lg:items-start border-b border-orange-300/30 pb-4 lg:border-0 lg:pb-0">
            <div className="flex items-center gap-2">
              <img src="/img/download.jpg" alt="Logo" className="h-8 w-8 rounded-lg shadow-sm" />
              <span className="text-lg font-serif font-bold text-[#3b2a1a]">
                Sri Vedic <span className="text-orange-500">Puja</span>
              </span>
            </div>
            <div className="flex gap-2 lg:mt-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="p-1.5 bg-white/60 rounded-full text-orange-600">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. LINKS SECTIONS - 2 Columns on mobile to save 50% height */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-800 mb-2">Services</h4>
              <ul className="space-y-2">
                {footerLinks.services.map((link) => (
                  <li key={link.label}><NavLink to={link.to} className="text-gray-600 text-xs hover:text-orange-600">{link.label}</NavLink></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-800 mb-2">Community</h4>
              <ul className="space-y-2">
                {footerLinks.community.map((link) => (
                  <li key={link.label}><NavLink to={link.to} className="text-gray-600 text-xs hover:text-orange-600">{link.label}</NavLink></li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1 border-t border-orange-300/20 pt-4 sm:border-0 sm:pt-0">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-orange-800 mb-2">Support</h4>
              <ul className="grid grid-cols-2 sm:block gap-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}><NavLink to={link.to} className="text-gray-600 text-xs hover:text-orange-600">{link.label}</NavLink></li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. CONTACT & NEWSLETTER - Compact */}
          <div className="lg:col-span-3 flex flex-col space-y-4 border-t border-orange-300/30 pt-4 lg:border-0 lg:pt-0">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">Haridwar, Uttarakhand, India</span>
              </div>
              <div className="flex justify-between md:flex-col md:gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone size={14} className="text-orange-500" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail size={14} className="text-orange-500" />
                  <span className="hidden sm:inline">support@poojamandir.com</span>
                  <span className="sm:hidden text-[10px]">Email Support</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input type="email" placeholder="Subscribe" className="w-full bg-white/80 border border-orange-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400" />
              <button className="absolute right-1 top-1 p-1 bg-orange-500 text-white rounded-md">
                <ArrowUpRight size={14} />
              </button>
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