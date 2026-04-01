import { useEffect, useState } from "react";
import {
  getDashboardData,
  getMonthlyGrowth,
  getTodayBookings,
} from "../../services/adminApi";
import RecentBookings from "../AdminComponets/RecentBookings";
import Bookings from "../AdminComponets/BookingTable";
import Users from "../AdminComponets/Users";
import Services from "../AdminComponets/AdminServices";
import Pandit from "../AdminComponets/Pandit";
import FinancialDashboard from "../AdminComponets/financialDashboard";
import Adminblogs from "../AdminComponets/Adminblogs";
import AnalyticsDashboard from "../AdminComponets/Analyticsdashboard";
import AdminContributions from "../AdminComponets/AdminContributions";
import AdminPages from "../AdminComponets/AdminPages";
import VerifyPanditModal from "../AdminComponets/VerifyPanditModal";
import NameCorrectionList from "../AdminComponets/NameCorrectionList";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name }) => {
  const icons = {
    dashboard: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    bookings: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    users: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="8" cy="7" r="4" />
        <path d="M2 21v-1a6 6 0 0 1 12 0v1" />
        <circle cx="17" cy="9" r="3" />
        <path d="M22 21v-1a5 5 0 0 0-7-4.6" />
      </svg>
    ),
    pandits: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M12 2v2M8.5 3.5l1 1.5M15.5 3.5l-1 1.5" />
      </svg>
    ),
    services: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    // Contributions Icon
    heart: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    logout: (
      <svg
        width="18"
        height="18"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    refresh: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M23 4v6h-6M1 20v-6h6" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    wifi: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line
          x1="12"
          y1="20"
          x2="12.01"
          y2="20"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
    ),
    financial: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M6 3h12M6 8h12M9 21l6-10H9l6-8" />
      </svg>
    ),
    analytics: (
      <svg
        width="16"
        height="16"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M3 3v18h18" />
        <path d="M7 16l4-4 4 4 4-6" />
      </svg>
    ),
    menu: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    close: (
      <svg
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    gallery: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    ),
    nameCorrection: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
        <path d="m15 5 3 3" />
      </svg>
    ),
  };
  return icons[name] || null;
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ active, setActive, isOpen, onClose }) => {
  const menus = [
    { label: "God View", icon: "dashboard" },
    { label: "Product & CMS", icon: "services" },
    { label: "Bookings", icon: "bookings" },
    { label: "Users", icon: "users" },
    { label: "Pandits", icon: "pandits" },
    { label: "Verified Pandits", icon: "pandits" },
    { label: "Contributions", icon: "heart" },
    { label: "Finance", icon: "financial" },
    { label: "Analytics", icon: "analytics" },
    { label: "Blogs", icon: "bookings" },
    { label: "Pages", icon: "services" },
    { label: "Gallery", icon: "gallery" },
    { label: "Name Correction", icon: "nameCorrection" },
  ];
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 lg:hidden
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[220px] bg-[#0f1117] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-gray-500 tracking-[0.12em] uppercase m-0">
            MODULES
          </p>
          <button
            onClick={onClose}
            className="lg:hidden p-1 bg-transparent border-none text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
          >
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 p-3">
          {menus.map((item) => {
            const isActive = active === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActive(item.label);
                  onClose();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-none cursor-pointer mb-0.5 text-sm text-left transition-all duration-150 ${isActive ? "bg-orange-600/[0.18] text-orange-400 font-semibold" : "bg-transparent text-gray-400 font-normal hover:bg-white/[0.04]"}`}
              >
                <span className={isActive ? "opacity-100" : "opacity-70"}>
                  <Icon name={item.icon} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

// ─── Topbar ───────────────────────────────────────────────────────────────────
const Topbar = ({ onMenuClick }) => {
  return (
    <div
      className="h-16 bg-[#0f1117] border-b border-white/[0.06] flex items-center justify-between px-4 md:px-7 sticky top-0 z-40"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 bg-transparent border-none text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
        >
          <Icon name="menu" />
        </button>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          🕉
        </div>
        <div>
          <div className="text-white text-sm font-bold leading-tight">
            Super Admin Control
          </div>
          <div className="text-gray-500 text-[11px] hidden sm:block">
            Sri Vedic Puja
          </div>
        </div>
      </div>
      <button
        onClick={() => {
          localStorage.removeItem("adminToken");
          window.location.href = "/";
        }}
        className="flex items-center gap-1.5 bg-white/5 border border-white/[0.08] rounded-lg text-gray-300 px-3 py-2 cursor-pointer text-xs hover:bg-red-500/[0.15] hover:text-red-400 transition-all"
      >
        <Icon name="logout" /> <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  );
};

// ─── God View Header ──────────────────────────────────────────────────────────
const GodViewHeader = ({ stats, onRefresh }) => {
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );
  useEffect(() => {
    const t = setInterval(
      () =>
        setTime(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        ),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-50 m-0">
            God View Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 mt-1 mb-0">
            Real-time overview of all operations
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-green-400 text-xs">
            <Icon name="wifi" /> <span>Live</span>
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-lg text-gray-300 px-3.5 py-2 cursor-pointer text-[13px] hover:bg-white/10 transition-all"
          >
            <Icon name="refresh" /> Refresh
          </button>
        </div>
      </div>
      <div
        className="rounded-2xl p-5 md:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5"
        style={{
          background:
            "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
        }}
      >
        <div>
          <div className="text-white/80 text-xs mb-1">
            Total Revenue (All Time)
          </div>
          <div className="text-white text-3xl font-extrabold">
            ₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div className="sm:text-center">
          <div className="text-white/80 text-xs mb-1">Total Bookings</div>
          <div className="text-white text-3xl font-extrabold">
            {stats.totalBookings || 0}
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-white/80 text-[11px] mb-1">Last Updated</div>
          <div className="text-white text-lg font-bold tracking-wide">
            {time}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Stat Tile ────────────────────────────────────────────────────────────────
const GodTile = ({ icon, value, label, iconBg }) => (
  <div className="bg-[#161b27] border border-white/[0.06] rounded-xl p-4 md:p-5 flex flex-col gap-2.5 hover:border-white/[0.12] transition-colors">
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
      style={{ background: iconBg }}
    >
      {icon}
    </div>
    <div className="text-gray-50 text-xl md:text-2xl font-bold">{value}</div>
    <div className="text-gray-500 text-xs">{label}</div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [active, setActive] = useState("God View");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchData = async () => {
    try {
      const dashboard = await getDashboardData();
      const monthly = await getMonthlyGrowth();
      const todayBookings = await getTodayBookings();
      setStats({
        ...dashboard.data,
        monthlyGrowth: monthly.data,
        totalTodayBookings: todayBookings.data.totalTodayBookings,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="flex bg-[#0d1117] min-h-screen">
        <Sidebar
          active={active}
          setActive={setActive}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div
          className="flex-1 flex flex-col lg:ml-[220px] min-w-0"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex-1 p-4 md:p-7">
            {active === "God View" && (
              <>
                <GodViewHeader stats={stats} onRefresh={fetchData} />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5 mb-5">
                  <GodTile
                    icon="🕉"
                    iconBg="rgba(139,92,246,0.2)"
                    value={stats.totalBookings ?? 0}
                    label="Total Booking"
                  />
                  <GodTile
                    icon="⏳"
                    iconBg="rgba(234,179,8,0.2)"
                    value={stats.totalPendingBookings ?? 0}
                    label="Pending Requests"
                  />
                  <GodTile
                    icon="₹"
                    iconBg="rgba(34,197,94,0.2)"
                    value={`₹${stats.todayRevenue ?? 0}`}
                    label="Today's Revenue"
                  />
                  <GodTile
                    icon="📈"
                    iconBg="rgba(59,130,246,0.2)"
                    value={`₹${stats.commission ?? 0}`}
                    label="Commission (30%)"
                  />
                  <GodTile
                    icon="👤"
                    iconBg="rgba(249,115,22,0.2)"
                    value={stats.pendingVerifications ?? 0}
                    label="Pending Verifications"
                  />
                  <GodTile
                    icon="📦"
                    iconBg="rgba(20,184,166,0.2)"
                    value={stats.dispatchPending ?? 0}
                    label="Dispatch Pending"
                  />
                </div>
                <div className="bg-green-500/[0.06] border border-green-500/20 rounded-xl p-4 md:p-5 mb-5 flex items-start gap-2.5">
                  <span className="text-green-400 text-lg mt-0.5">⚠</span>
                  <div>
                    <div className="text-green-400 font-semibold text-sm">
                      All Clear – No At-Risk Bookings
                    </div>
                    <div className="text-gray-500 text-[13px] mt-0.5">
                      All upcoming bookings have pandits assigned. Great job!
                    </div>
                  </div>
                </div>
                <RecentBookings bookings={stats.recentBookings || []} />
              </>
            )}

            {/* Tab Rendering Logic */}
            {active === "Product & CMS" && <Services />}
            {active === "Bookings" && <Bookings />}
            {active === "Users" && <Users />}
            {active === "Pandits" && <Pandit />}
            {active === "Verified Pandits" && (
              <div className="animate-in fade-in zoom-in duration-300">
                <VerifyPanditModal onClose={() => setActive("Pandits")} />
              </div>
            )}
            {active === "Contributions" && <AdminContributions />}
            {active === "Finance" && <FinancialDashboard />}
            {active === "Analytics" && <AnalyticsDashboard />}
            {active === "Blogs" && <Adminblogs />}
            {active === "Pages" && <AdminPages />}
            {active === "Gallery" && <Gallery />}
            {active === "Name Correction" && <NameCorrectionList />}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
