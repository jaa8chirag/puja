import { useState, useEffect } from "react";
import { ChartNoAxesCombined } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f1623] border border-white/5 p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 animate-pulse shrink-0" />
      <div className="flex-1">
        <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-2" />
        <div className="h-7 w-28 bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0f1623] border border-white/5 p-5 flex items-center gap-4 group hover:border-white/10 transition-all duration-300">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">
          {label}
        </p>
        <p className="text-2xl font-bold text-white mt-0.5 tracking-tight">
          {value}
        </p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.message || "Data fetch failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const maxRevenue = data
    ? Math.max(...data.revenue_last_7_days.map((d) => d.revenue), 1)
    : 1;

  const pujaColors = [
    "from-amber-500 to-orange-500",
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
  ];

  const cityEmojis = ["🏛️", "🏙️", "🌆", "🌐", "🌇"];

  if (error) {
    return (
      <div className="min-h-screen bg-[#080d14] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <ChartNoAxesCombined className="text-orange-500" /> Analytics
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Manage donation types & pricing
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon="₹"
              label="Total Revenue"
              value={formatCurrency(data.stats.total_revenue)}
              accent="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            />
            <StatCard
              icon="📅"
              label="Completed Bookings"
              value={data.stats.completed_bookings}
              accent="bg-blue-500/10 text-blue-400 border border-blue-500/20"
            />
            <StatCard
              icon="👤"
              label="Active Pandits"
              value={data.stats.active_pandits}
              accent="bg-violet-500/10 text-violet-400 border border-violet-500/20"
            />
            <StatCard
              icon="📈"
              label="Avg Order Value"
              value={formatCurrency(data.stats.avg_order_value)}
              accent="bg-amber-500/10 text-amber-400 border border-amber-500/20"
            />
          </>
        )}
      </div>

      {/* Revenue Chart + Top Pujas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-3 rounded-2xl bg-[#0f1623] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-slate-400 text-sm">📊</span>
            <h2 className="text-sm font-semibold text-slate-300 tracking-wide">
              Revenue — Last 7 Days
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-4 bg-white/5 rounded animate-pulse" />
                  <div className="flex-1 h-8 bg-white/5 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data.revenue_last_7_days.map((row, i) => {
                const pct = (row.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={row.date}
                    className="flex items-center gap-3 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <span className="text-xs text-slate-500 w-12 shrink-0 font-mono">
                      {formatDate(row.date)}
                    </span>
                    <div className="flex-1 relative h-8 rounded-lg bg-[#151d2b] overflow-hidden">
                      {pct > 0 && (
                        <div
                          className="absolute inset-y-0 left-0 rounded-lg transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.max(pct, 5)}%`,
                            background:
                              "linear-gradient(90deg, #6366f1, #8b5cf6)",
                          }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs text-slate-300 font-mono">
                          {row.revenue > 0
                            ? `${formatCurrency(row.revenue)} (${row.bookings} bookings)`
                            : "₹0 (0 bookings)"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Pujas */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0f1623] border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-amber-400 text-sm">⚡</span>
            <h2 className="text-sm font-semibold text-slate-300 tracking-wide">
              Top Performing Pujas
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-white/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data.top_pujas.length === 0 ? (
                <p className="text-slate-600 text-sm text-center py-8">
                  No Data found.
                </p>
              ) : (
                data.top_pujas.map((puja, index) => (
                  <div
                    key={puja.service_id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#151d2b] hover:bg-[#1a2338] transition-colors duration-200 group"
                  >
                    <span className="text-xs font-bold text-slate-600 w-5 shrink-0">
                      #{puja.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                        {puja.puja_name}
                      </p>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${pujaColors[index] || "from-slate-500 to-slate-600"} shrink-0`}
                    >
                      {puja.total_bookings}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Most Active Cities */}
      <div className="rounded-2xl bg-[#0f1623] border border-white/5 p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-blue-400 text-sm">📍</span>
          <h2 className="text-sm font-semibold text-slate-300 tracking-wide">
            Most Active Cities
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : data.most_active_cities.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-8">
            No Data found.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.most_active_cities.map((city, i) => {
              const maxBookings = Math.max(
                ...data.most_active_cities.map((c) => c.total_bookings),
              );
              const pct = (city.total_bookings / maxBookings) * 100;
              return (
                <div
                  key={city.city}
                  className="relative rounded-xl bg-[#151d2b] border border-white/5 p-4 flex flex-col items-center gap-2 hover:border-violet-500/30 hover:bg-[#1a2338] transition-all duration-200 overflow-hidden group"
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-600/10 to-transparent"
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-2xl relative z-10">
                    {cityEmojis[i] || "📍"}
                  </span>
                  <div className="text-center relative z-10">
                    <p className="text-sm font-semibold text-white">
                      {city.city}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {city.total_bookings}{" "}
                      {city.total_bookings === 1 ? "booking" : "bookings"}
                    </p>
                  </div>
                  <div className="w-full bg-[#0f1623] rounded-full h-1 relative z-10">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-700 tracking-widest uppercase">
          God View • Live Analytics
        </p>
      </div>
    </div>
  );
}
