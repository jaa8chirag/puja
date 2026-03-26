import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Home,
  Globe,
  User,
  Settings,
  ShieldCheck,
  ChevronDown,
  Church,
  CalendarDays,
  Flame,
  LogOut,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileGalleryOpen, setMobileGalleryOpen] = useState(false);
  const [mobilePindDanOpen, setMobilePindDanOpen] = useState(false); // ✅ NEW
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [pindDanOpen, setPindDanOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  const menuItems = [
    { label: "Temple", path: "/temples", icon: <Church size={16} /> },
    { label: "Events", path: "/events", icon: <CalendarDays size={16} /> },
    { label: "Aarti", path: "/aarti", icon: <Flame size={16} /> },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          name: decoded.name,
          email: decoded.email || "user@srivedicpuja.com",
        });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = menuOpen ? "hidden" : "auto";
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setProfileOpen(false);
    navigate("/");
    window.location.reload();
  };

  const navItems = [
    { to: "/", label: "Home", icon: <Home size={18} /> },
    { to: "/homePuja", label: "Home-Puja", icon: <Globe size={18} /> },
    { to: "/temple-puja", label: "Temple-Puja", icon: <User size={18} /> },
    { to: "/katha-jaap", label: "Katha-Jaap", icon: <User size={18} /> },
  ];

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 backdrop-blur-xl border-b border-white/20 ${
          scrolled ? "bg-white/30 shadow-lg" : "bg-white/20"
        }`}
      >
        <div className="max-w-[1360px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-[72px]">
          {/* LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/img/download.jpg"
              alt="Logo"
              className="h-12 w-12 rounded-lg shadow-sm"
            />
            <div className="flex flex-col text-left">
              <span className="text-[18px] font-serif font-bold text-[#3b2a1a] leading-tight">
                Sri Vedic Puja
              </span>
              <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">
                Your Faith Partner
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `font-semibold text-[15px] transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-black hover:text-orange-600"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* My-Booking — sirf logged in user ke liye */}
            {user && (
              <NavLink
                to="/my-booking"
                className={({ isActive }) =>
                  `font-semibold text-[15px] transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-black hover:text-orange-600"
                  }`
                }
              >
                My-Booking
              </NavLink>
            )}

            {/* ── Pind-Dan Dropdown ── */}
            <li
              className="relative group list-none"
              onMouseEnter={() => setPindDanOpen(true)}
              onMouseLeave={() => setPindDanOpen(false)}
            >
              <div className="flex items-center gap-1 font-bold text-[15px] cursor-default text-slate-700 hover:text-orange-600 py-2 px-1 transition-colors">
                Pind-Dan/Pitra-Dosh
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    pindDanOpen
                      ? "rotate-180 text-orange-600"
                      : "text-slate-400"
                  }`}
                />
              </div>

              {pindDanOpen && (
                <div className="absolute top-full left-0 w-52 pt-2 z-50">
                  <div className="bg-white shadow-2xl rounded-2xl border border-orange-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => {
                        navigate("/pind-dan");
                        setPindDanOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all group/item"
                    >
                      <span className="text-slate-400 group-hover/item:text-orange-500 transition-colors">
                        <Church size={16} />
                      </span>
                      Temple Ritual
                    </button>
                    <button
                      onClick={() => {
                        navigate("/online-ritual");
                        setPindDanOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all group/item"
                    >
                      <span className="text-slate-400 group-hover/item:text-orange-500 transition-colors">
                        <Globe size={16} />
                      </span>
                      Online Ritual
                    </button>
                  </div>
                </div>
              )}
            </li>

            {/* ── Gallery Dropdown ── */}
            <li
              className="relative group list-none"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 font-bold text-[15px] cursor-default text-slate-700 hover:text-orange-600 py-2 px-1 transition-colors">
                Gallery
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    dropdownOpen
                      ? "rotate-180 text-orange-600"
                      : "text-slate-400"
                  }`}
                />
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-52 pt-2 z-50">
                  <div className="bg-white shadow-2xl rounded-2xl border border-orange-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {menuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          navigate(item.path);
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-all group/item"
                      >
                        <span className="text-slate-400 group-hover/item:text-orange-500 transition-colors">
                          {item.icon}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </li>
          </ul>

          {/* Desktop Profile / Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="h-10 w-10 bg-[#F3E5D8] cursor-pointer text-[#D97706] rounded-full flex items-center justify-center font-bold text-lg border-2 border-orange-300 shadow-sm active:scale-95 transition-all"
                >
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                    <div className="p-3 border-b border-gray-50 bg-gray-50/50 text-left">
                      <h4 className="font-bold text-black capitalize text-[16px]">
                        Welcome, {user.name}
                      </h4>
                    </div>
                    <div className="text-left">
                      <button
                        onClick={() => {
                          navigate("/profile");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-200 transition-colors"
                      >
                        <User size={18} className="text-gray-400" /> My Profile
                      </button>
                      <button
                        onClick={() => {
                          navigate("/manageSankalp");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-200 transition-colors"
                      >
                        <ShieldCheck size={18} className="text-gray-400" />{" "}
                        Manage Sankalp
                      </button>
                      <button
                        onClick={() => {
                          navigate("/savedAddresses");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-200 transition-colors"
                      >
                        <MapPin size={18} className="text-gray-400" /> Saved
                        Addresses
                      </button>
                      <button
                        onClick={() => {
                          navigate("/help");
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-200 transition-colors"
                      >
                        <HelpCircle size={18} className="text-gray-400" /> Help
                        & Support
                      </button>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/signin")}
                  className="px-6 py-2 rounded-xl border-2 border-orange-500 text-orange-600 font-bold text-sm hover:bg-orange-500 hover:text-white transition-all"
                >
                  Sign In
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#2D1B0B] text-white font-bold text-sm shadow-md"
                  onClick={() => navigate("/partnerSignIn")}
                >
                  Partner Login
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden p-2 text-orange-600 bg-orange-50 rounded-lg"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={`fixed inset-0 z-[110] transition-all ${menuOpen ? "visible" : "invisible"}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer Panel */}
        <div
          className={`absolute right-0 h-full w-[80%] bg-white/90 backdrop-blur-md shadow-2xl transition-transform duration-500 flex flex-col ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="p-6 flex justify-between items-center border-b">
            <span className="font-bold text-[#3b2a1a]">Sri Vedic Puja</span>
            <X
              onClick={() => setMenuOpen(false)}
              className="text-gray-400 cursor-pointer"
            />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 text-left">
            {/* Main Nav Links */}
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
              >
                {item.icon} {item.label}
              </NavLink>
            ))}

            {/* My Booking — sirf logged in user */}
            {user && (
              <NavLink
                to="/my-booking"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
              >
                <Settings size={18} /> My-Booking
              </NavLink>
            )}

            {/* ── Mobile Pind-Dan Dropdown ── */}
            <div className="pt-1">
              <button
                onClick={() => setMobilePindDanOpen(!mobilePindDanOpen)}
                className="w-full flex items-center justify-between gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Church size={18} className="text-gray-500" />
                  Pind-Dan/Pitra-Dosh
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-300 ${
                    mobilePindDanOpen ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>

              {mobilePindDanOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-100 pl-3">
                  <button
                    onClick={() => {
                      navigate("/pind-dan");
                      setMenuOpen(false);
                      setMobilePindDanOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <span className="text-slate-400">
                      <Church size={15} />
                    </span>
                    Temple Ritual
                  </button>
                  <button
                    onClick={() => {
                      navigate("/online-ritual");
                      setMenuOpen(false);
                      setMobilePindDanOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                  >
                    <span className="text-slate-400">
                      <Globe size={15} />
                    </span>
                    Online Ritual
                  </button>
                </div>
              )}
            </div>

            {/* ── Mobile Gallery Dropdown ── */}
            <div className="pt-1">
              <button
                onClick={() => setMobileGalleryOpen(!mobileGalleryOpen)}
                className="w-full flex items-center justify-between gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Church size={18} className="text-gray-500" />
                  Gallery
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-300 ${
                    mobileGalleryOpen ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>

              {mobileGalleryOpen && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange-100 pl-3">
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setMenuOpen(false);
                        setMobileGalleryOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <span className="text-slate-400">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Profile section (only when logged in) ── */}
            {user && (
              <>
                <div className="border-t my-2 pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 pb-1">
                    My Account
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
                >
                  <User size={18} /> My Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/manageSankalp");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
                >
                  <ShieldCheck size={18} /> Manage Sankalp
                </button>
                <button
                  onClick={() => {
                    navigate("/savedAddresses");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
                >
                  <MapPin size={18} /> Saved Addresses
                </button>
                <button
                  onClick={() => {
                    navigate("/help");
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-4 p-4 font-bold text-gray-600 hover:bg-orange-50 rounded-xl"
                >
                  <HelpCircle size={18} /> Help & Support
                </button>
              </>
            )}
          </div>

          {/* ── Drawer Bottom Auth Section ── */}
          <div className="p-5 border-t bg-gray-50/80 backdrop-blur-sm">
            {user ? (
              <div className="bg-white p-5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-orange-100 text-left">
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-14 w-14 bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-[#2D1B0B] truncate text-lg">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate tracking-tight">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all border border-red-100"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    navigate("/signin");
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate("/partnerSignIn");
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 bg-[#2D1B0B] text-white rounded-xl font-bold active:scale-[0.98] transition-all flex items-center justify-center border border-[#2D1B0B]"
                >
                  Partner Login
                </button>
                <div className="mt-2 flex flex-col items-center gap-1">
                  <div className="h-1 w-8 bg-gray-200 rounded-full mb-1"></div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-[0.15em] font-bold">
                    Join our Vedic Community
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[72px] w-full relative -z-10"></div>
    </>
  );
};

export default Navbar;
