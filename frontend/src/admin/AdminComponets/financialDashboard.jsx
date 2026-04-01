import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from "recharts";
import { API } from "../../services/adminApi";

const COLORS = ["#f97316","#f59e0b","#eab308","#fb923c","#fbbf24","#fdba74","#fcd34d"];

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const typeLabel = (t) =>
  ({ home_puja: "Home Puja", katha: "Katha", temple_puja: "Temple Puja", pind_dan: "Pind Dan" })[t] || t;

// ── useApi ────────────────────────────────────────────────
const useApi = (endpoint, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await API.get(endpoint);
      const json = res.data;
      if (!json.success) throw new Error(json.message || "Server error");
      setData(json.data ?? json);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Unknown error");
    } finally { setLoading(false); }
  }, [endpoint]);

  useEffect(() => { fetch_(); }, deps);
  return { data, loading, error, refetch: fetch_ };
};

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = ({ h = "h-4", w = "w-full" }) => (
  <div className={`${h} ${w} rounded-lg bg-white/5 animate-pulse`} />
);

// ── Error ─────────────────────────────────────────────────
const ErrorBox = ({ msg, onRetry }) => (
  <div className="flex items-center justify-between rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
    <div className="flex items-center gap-2">
      <span className="text-red-400">⚠</span>
      <p className="text-sm text-red-400">{msg}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-xs text-red-400 border border-red-400/30 rounded-lg px-3 py-1 hover:bg-red-400/10 transition-colors">
        Retry
      </button>
    )}
  </div>
);

// ── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f35] border border-orange-500/20 rounded-xl px-4 py-3 shadow-xl shadow-black/40">
      <p className="text-xs text-orange-300/70 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === "Bookings" ? p.value : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, loading, accent = "orange" }) => {
  const accentMap = {
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    amber:  "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    yellow: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400",
    cyan:   "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    green:  "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    rose:   "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
    blue:   "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  };
  const cls = accentMap[accent] || accentMap.orange;
  if (loading) return (
    <div className="rounded-2xl border border-white/5 bg-[#141828] p-5 space-y-3">
      <Skeleton h="h-3" w="w-24" /><Skeleton h="h-7" w="w-36" /><Skeleton h="h-3" w="w-20" />
    </div>
  );
  return (
    <div className={`relative rounded-2xl border bg-gradient-to-br ${cls} p-4 md:p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
      <div className="absolute -right-4 -top-4 text-5xl opacity-10 group-hover:opacity-20 transition-opacity select-none">{icon}</div>
      <p className="text-[10px] font-semibold tracking-widest uppercase opacity-60 mb-1">{label}</p>
      <p className="text-xl md:text-2xl font-black text-white leading-tight">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  );
};

// ── Section Title ─────────────────────────────────────────
const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase text-orange-300/80 whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
  </div>
);

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ s }) => {
  const map = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accepted:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
    declined:  "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[s] || "bg-white/10 text-white/50 border-white/10"}`}>
      {s}
    </span>
  );
};

// ══════════════════════════════════════════════════════════
// OVERVIEW TAB
// ══════════════════════════════════════════════════════════
const OverviewTab = () => {
  const summary = useApi("/summary");
  const monthly = useApi("/monthly-revenue");
  const byType  = useApi("/by-service-type");
  const topSvc  = useApi("/top-services?limit=7");
  const city    = useApi("/by-city");

  const s = summary.data || {};
  const statusCounts = s.booking_status || [];
  const completed = statusCounts.find((x) => x.status === "completed")?.count || 0;
  const pending   = statusCounts.find((x) => x.status === "pending")?.count || 0;

  return (
    <div className="space-y-6">
      {summary.error ? (
        <ErrorBox msg={summary.error} onRetry={summary.refetch} />
      ) : (
        <>
          {/* KPI Row 1 — 1 col mobile → 2 col sm → 4 col lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <KpiCard loading={summary.loading} icon="💰" label="Total Revenue"   value={fmt(s.total_revenue)}  sub="Completed bookings" accent="orange" />
            <KpiCard loading={summary.loading} icon="📅" label="This Month"      value={fmt(s.month_revenue)}  sub={new Date().toLocaleString("default", { month: "long", year: "numeric" })} accent="amber" />
            <KpiCard loading={summary.loading} icon="⚡" label="Today's Revenue" value={fmt(s.today_revenue)}  sub="Live"               accent="yellow" />
            <KpiCard loading={summary.loading} icon="🙏" label="Total Donations" value={fmt(s.total_donations)} sub="All contributions"  accent="green" />
          </div>
          {/* KPI Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <KpiCard loading={summary.loading} icon="📦" label="Total Bookings"  value={s.total_bookings}       sub={`${completed} completed`} accent="blue" />
            <KpiCard loading={summary.loading} icon="✅" label="Completed"       value={completed}              sub="Pujas done"               accent="green" />
            <KpiCard loading={summary.loading} icon="⏳" label="Pending"         value={pending}                sub="Awaiting action"          accent="amber" />
            <KpiCard loading={summary.loading} icon="👥" label="Users / Pandits" value={`${s.total_users || 0} / ${s.total_pandits || 0}`} sub="Registered" accent="purple" />
          </div>
        </>
      )}

      {/* Monthly Trend */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Monthly Revenue Trend — Last 12 Months" />
        {monthly.loading && <div className="h-48 md:h-64 rounded-xl bg-white/5 animate-pulse" />}
        {monthly.error && <ErrorBox msg={monthly.error} onRetry={monthly.refetch} />}
        {!monthly.loading && !monthly.error && (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly.data || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#ffffff50" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + v / 1000 + "k"} tick={{ fontSize: 10, fill: "#ffffff50" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#ffffff80" }} />
              <Area type="monotone" dataKey="revenue"  stroke="#f97316" strokeWidth={2.5} fill="url(#revGrad)"  dot={{ r: 3, fill: "#f97316" }} name="Revenue" />
              <Area type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2}   fill="url(#bookGrad)" dot={{ r: 3, fill: "#8b5cf6" }} name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + City — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Revenue by Service Type" />
          {byType.loading && <div className="h-48 rounded-xl bg-white/5 animate-pulse" />}
          {byType.error  && <ErrorBox msg={byType.error} onRetry={byType.refetch} />}
          {!byType.loading && !byType.error && (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byType.data || []} dataKey="revenue" nameKey="puja_type"
                  cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                  label={({ puja_type, percent }) => `${typeLabel(puja_type)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {(byType.data || []).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [fmt(v), typeLabel(n)]}
                  contentStyle={{ background: "#1a1f35", border: "1px solid #f9731630", borderRadius: 12 }}
                  labelStyle={{ color: "#fff" }} itemStyle={{ color: "#f97316" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Revenue by City — Top 7" />
          {city.loading && <div className="h-48 rounded-xl bg-white/5 animate-pulse" />}
          {city.error   && <ErrorBox msg={city.error} onRetry={city.refetch} />}
          {!city.loading && !city.error && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={city.data || []} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => "₹" + v / 1000 + "k"} tick={{ fontSize: 10, fill: "#ffffff50" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: "#ffffff80" }} width={65} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                  {(city.data || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Services — scrollable table on mobile */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Top Performing Services" />
        {topSvc.loading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}</div>}
        {topSvc.error   && <ErrorBox msg={topSvc.error} onRetry={topSvc.refetch} />}
        {!topSvc.loading && !topSvc.error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                  {["#", "Puja Name", "Type", "Bookings", "Revenue"].map((h) => (
                    <th key={h} className="pb-3 pr-4 font-semibold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(topSvc.data || []).map((s, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3 pr-4 text-white/20 font-mono text-xs w-8">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 pr-4 font-semibold text-white/90 group-hover:text-orange-300 transition-colors">{s.puja_name}</td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
                        {typeLabel(s.puja_type)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/50 font-mono">{s.total_bookings}</td>
                    <td className="py-3 font-black text-orange-400">{fmt(s.total_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// TRANSACTIONS TAB
// ══════════════════════════════════════════════════════════
const TransactionsTab = () => {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [applyRange, setApplyRange] = useState(false);

  const txEndpoint = applyRange && from && to
    ? `/date-range?from=${from}&to=${to}`
    : `/transactions?page=${page}&limit=15`;

  const tx = useApi(txEndpoint, [page, applyRange]);
  const txData       = applyRange ? tx.data?.data || [] : tx.data || [];
  const pag          = !applyRange ? tx.data?.pagination : null;
  const rangeSummary = applyRange  ? tx.data?.summary    : null;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-5 flex flex-wrap items-end gap-3 md:gap-4">
        {["From Date", "To Date"].map((lbl, idx) => {
          const val    = idx === 0 ? from : to;
          const setter = idx === 0 ? setFrom : setTo;
          return (
            <div key={lbl} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-white/30">{lbl}</label>
              <input type="date" value={val} onChange={(e) => setter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all" />
            </div>
          );
        })}
        <button onClick={() => { setApplyRange(true); setPage(1); }}
          className="bg-orange-500 hover:bg-orange-400 text-white px-4 md:px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-orange-500/20 self-end">
          Apply
        </button>
        {applyRange && (
          <button onClick={() => { setApplyRange(false); setFrom(""); setTo(""); }}
            className="bg-white/5 hover:bg-white/10 text-white/60 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-white/10 self-end">
            ✕ Clear
          </button>
        )}
        {rangeSummary && (
          <div className="w-full sm:w-auto sm:ml-auto flex gap-4 md:gap-6 text-sm mt-2 sm:mt-0">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Total Revenue</p>
              <p className="font-black text-orange-400">{fmt(rangeSummary.total_revenue)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">Bookings</p>
              <p className="font-black text-white">{rangeSummary.total_bookings}</p>
            </div>
          </div>
        )}
      </div>

      {/* Table — scrollable on mobile */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Transactions" />
        {tx.loading && <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} h="h-12" />)}</div>}
        {tx.error   && <ErrorBox msg={tx.error} onRetry={tx.refetch} />}
        {!tx.loading && !tx.error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                    {["Booking ID","User","Puja","City","Status","Amount","Date"].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txData.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-white/20 text-sm">No transactions found.</td></tr>
                  )}
                  {txData.map((t, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-3.5 pr-4 font-mono text-xs text-orange-400/80">{t.bookingId || "—"}</td>
                      <td className="py-3.5 pr-4 font-semibold text-white/80">{t.user_name}</td>
                      <td className="py-3.5 pr-4 text-white/50 max-w-[140px] truncate" title={t.puja_name}>{t.puja_name}</td>
                      <td className="py-3.5 pr-4 text-white/40 text-xs">{t.city}</td>
                      <td className="py-3.5 pr-4"><StatusBadge s={t.status} /></td>
                      <td className="py-3.5 pr-4 font-black text-orange-400">{t.total_price > 0 ? fmt(t.total_price) : "—"}</td>
                      <td className="py-3.5 text-white/30 text-xs whitespace-nowrap">
                        {t.created_at ? new Date(t.created_at).toLocaleDateString("en-IN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pag && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5 flex-wrap gap-3">
                <p className="text-xs text-white/30">
                  Showing {(pag.page - 1) * pag.limit + 1}–{Math.min(pag.page * pag.limit, pag.total)} of {pag.total}
                </p>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors">
                    ← Prev
                  </button>
                  <span className="px-3 py-1.5 text-xs bg-orange-500/15 text-orange-400 rounded-lg font-bold border border-orange-500/20">
                    {page} / {pag.totalPages}
                  </span>
                  <button disabled={page === pag.totalPages} onClick={() => setPage((p) => p + 1)}
                    className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// PANDITS TAB
// ══════════════════════════════════════════════════════════
const PanditsTab = () => {
  const pandits = useApi("/pandit-earnings");
  const data = pandits.data || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Pandit Earnings & Performance" />
        {pandits.loading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-12" />)}</div>}
        {pandits.error   && <ErrorBox msg={pandits.error} onRetry={pandits.refetch} />}
        {!pandits.loading && !pandits.error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                  {["#","Pandit Name","Phone","Completed Pujas","Total Earned"].map((h) => (
                    <th key={h} className="pb-3 pr-6 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-white/20">No Data found.</td></tr>}
                {data.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                    <td className="py-3.5 pr-6 text-white/20 font-mono text-xs">{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3.5 pr-6 font-semibold text-white/90 capitalize group-hover:text-orange-300 transition-colors">{p.pandit_name}</td>
                    <td className="py-3.5 pr-6 text-white/40 font-mono text-xs">{p.phone}</td>
                    <td className="py-3.5 pr-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full font-bold text-xs">
                        {p.completed_pujas}
                      </span>
                    </td>
                    <td className="py-3.5 font-black text-orange-400">{fmt(p.total_earned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!pandits.loading && !pandits.error && data.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Earnings Chart" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="pandit_name" tick={{ fontSize: 11, fill: "#ffffff60" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + v / 1000 + "k"} tick={{ fontSize: 11, fill: "#ffffff60" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_earned" name="Total Earned" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// DONATIONS TAB
// ══════════════════════════════════════════════════════════
const DonationsTab = () => {
  const donations = useApi("/donations");
  const samagri   = useApi("/samagri-kit");
  const data      = donations.data || [];
  const sk        = samagri.data || {};
  const topDonation = data[0];

  return (
    <div className="space-y-4">
      {/* KPI — 1 col mobile → 3 col md */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <KpiCard loading={donations.loading} icon="🙏" label="Total Donation Revenue"
          value={fmt(data.reduce((a, d) => a + Number(d.total_amount), 0))} sub="All contribution types" accent="orange" />
        <KpiCard loading={samagri.loading}   icon="📦" label="Samagri Kit Revenue"
          value={fmt(sk.samagri_revenue)} sub={`${sk.total_kits_sold || 0} kits sold`} accent="amber" />
        <KpiCard loading={donations.loading} icon="🏆" label="Top Donation"
          value={topDonation?.donation_type || "—"} sub={topDonation ? fmt(topDonation.total_amount) + " collected" : ""} accent="green" />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Donation Breakdown by Type" />
        {donations.loading && <div className="h-48 md:h-60 rounded-xl bg-white/5 animate-pulse" />}
        {donations.error   && <ErrorBox msg={donations.error} onRetry={donations.refetch} />}
        {!donations.loading && !donations.error && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="donation_type" tick={{ fontSize: 11, fill: "#ffffff60" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => "₹" + v / 1000 + "k"} tick={{ fontSize: 11, fill: "#ffffff60" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total_amount" name="Amount Collected" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Contribution Type Details" />
        {donations.loading && <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}</div>}
        {donations.error   && <ErrorBox msg={donations.error} onRetry={donations.refetch} />}
        {!donations.loading && !donations.error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                  {["Donation Type","Count","Total Collected","Avg per Booking"].map((h) => (
                    <th key={h} className="pb-3 pr-6 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 pr-6 font-semibold text-white/80">{d.donation_type}</td>
                    <td className="py-3.5 pr-6 text-white/40 font-mono">{d.count}</td>
                    <td className="py-3.5 pr-6 font-black text-orange-400">{fmt(d.total_amount)}</td>
                    <td className="py-3.5 text-white/50">{fmt(Math.round(d.total_amount / d.count))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════
export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { key: "overview",      label: "Overview",      icon: "📊" },
    { key: "transactions",  label: "Transactions",  icon: "📋" },
    { key: "pandits",       label: "Pandits",       icon: "🧘" },
    { key: "donations",     label: "Donations",     icon: "🙏" },
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">

          
          {/* <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xl">
              🕉️
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">Financial Dashboard</h1>
              <p className="text-[12px] text-white/30 tracking-widest uppercase">Financial Overview</p>
            </div>

          </div> */}

          <div>
          <h1 className="text-xl font-black font-bold text-white  flex items-center gap-2">
            🕉️ Financial Dashboard
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">Manage donation types & pricing</p>
        </div>


          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
            <span className="text-xs text-emerald-400 font-semibold">Live</span>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="flex gap-0.5 border-t border-white/5 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 md:px-5 py-3 text-xs md:text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap flex-shrink-0
                ${activeTab === t.key
                  ? "border-orange-500 text-orange-400"
                  : "border-transparent text-white/40 hover:text-white/70"}`}
            >
              <span>{t.icon}</span>
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview"     && <OverviewTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "pandits"      && <PanditsTab />}
        {activeTab === "donations"    && <DonationsTab />}
      </div>
    </div>
  );
}