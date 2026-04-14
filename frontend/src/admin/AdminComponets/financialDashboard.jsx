import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { API } from "../../services/adminApi";

import Pagination from "../../Components/Pagination";
const COLORS = [
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#fb923c",
  "#fbbf24",
  "#fdba74",
  "#fcd34d",
];

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const typeLabel = (t) =>
  ({
    home_puja: "Home Puja",
    katha: "Katha",
    temple_puja: "Temple Puja",
    pind_dan: "Pind Dan",
  })[t] || t;

// ── useApi ────────────────────────────────────────────────
const useApi = (endpoint, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(endpoint);
      const json = res.data;
      if (!json.success) throw new Error(json.message || "Server error");
      if (
        json.data &&
        typeof json.data === "object" &&
        !Array.isArray(json.data)
      ) {
        // Date range format: { summary, data, pagination }
        setData(json.data);
      } else if (json.pagination) {
        // Normal transactions: { data: [...], pagination: {...} }
        setData({ data: json.data, pagination: json.pagination });
      } else {
        // Fallback for other endpoints
        setData(json.data !== undefined ? json.data : json);
      }
      // setData(json.data !== undefined ? json.data : json);
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetch_();
  }, deps);
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
      <button
        onClick={onRetry}
        className="text-xs text-red-400 border border-red-400/30 rounded-lg px-3 py-1 hover:bg-red-400/10 transition-colors"
      >
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
          {p.name}: {p.name === "Completed Bookings" ? p.value : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, loading, accent = "orange" }) => {
  const accentMap = {
    orange:
      "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    amber:
      "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    yellow:
      "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20 text-yellow-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    green:
      "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    purple:
      "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    rose: "from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  };
  const cls = accentMap[accent] || accentMap.orange;
  if (loading)
    return (
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-5 space-y-3">
        <Skeleton h="h-3" w="w-24" />
        <Skeleton h="h-7" w="w-36" />
        <Skeleton h="h-3" w="w-20" />
      </div>
    );
  return (
    <div
      className={`relative rounded-2xl border bg-gradient-to-br ${cls} p-4 md:p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
    >
      <div className="absolute -right-4 -top-4 text-5xl opacity-10 group-hover:opacity-20 transition-opacity select-none">
        {icon}
      </div>
      <p className="text-[10px] font-semibold tracking-widest uppercase opacity-60 mb-1">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-black text-white leading-tight">
        {value}
      </p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  );
};

// ── Section Title ─────────────────────────────────────────
const SectionTitle = ({ title }) => (
  <div className="flex items-center gap-3 mb-5">
    <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase text-orange-300/80 whitespace-nowrap">
      {title}
    </h2>
    <div className="flex-1 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />
  </div>
);

// ── Status Badge ──────────────────────────────────────────
const StatusBadge = ({ s }) => {
  const map = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    accepted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    declined: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[s] || "bg-white/10 text-white/50 border-white/10"}`}
    >
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
  const byType = useApi("/by-service-type");
  const topSvc = useApi("/top-services?limit=7");
  const city = useApi("/by-city");

  const s = summary.data || {};
  const statusCounts = s.booking_status || [];
  const completed =
    statusCounts.find((x) => x.status === "completed")?.count || 0;
  const pending = statusCounts.find((x) => x.status === "pending")?.count || 0;

  return (
    <div className="space-y-6">
      {summary.error ? (
        <ErrorBox msg={summary.error} onRetry={summary.refetch} />
      ) : (
        <>
          {/* KPI Row 1 — 1 col mobile → 2 col sm → 4 col lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <KpiCard
              loading={summary.loading}
              icon="💰"
              label="Money Received"
              value={fmt(s.total_revenue)}
              sub="Actual cash collected"
              accent="green"
            />
            <KpiCard
              loading={summary.loading}
              icon="📈"
              label="Total Value"
              value={fmt(s.total_receivable)}
              sub="Total booking value"
              accent="blue"
            />
            <KpiCard
              loading={summary.loading}
              icon="⏳"
              label="Remaining Balance"
              value={fmt(s.total_balance)}
              sub="To be collected"
              accent="rose"
            />
             <KpiCard
              loading={summary.loading}
              icon="🙏"
              label="Total Donations"
              value={fmt(s.total_donations)}
              sub="All contributions"
              accent="amber"
            />
          </div>
          {/* KPI Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <KpiCard
              loading={summary.loading}
              icon="📅"
              label="This Month"
              value={fmt(s.month_revenue)}
              sub="Money received"
              accent="orange"
            />
            <KpiCard
              loading={summary.loading}
              icon="⚡"
              label="Today's Cash"
              value={fmt(s.today_revenue)}
              sub="Live from today"
              accent="yellow"
            />
             <KpiCard
              loading={summary.loading}
              icon="📦"
              label="Total Bookings"
              value={s.total_bookings}
              sub={`${completed} completed`}
              accent="purple"
            />
            <KpiCard
              loading={summary.loading}
              icon="👥"
              label="Users / Pandits"
              value={`${s.total_users || 0} / ${s.total_pandits || 0}`}
              sub="Registered total"
              accent="cyan"
            />
          </div>
        </>
      )}

      {/* Monthly Trend */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Monthly Revenue Trend — Last 12 Months" />
        {monthly.loading && (
          <div className="h-48 md:h-64 rounded-xl bg-white/5 animate-pulse" />
        )}
        {monthly.error && (
          <ErrorBox msg={monthly.error} onRetry={monthly.refetch} />
        )}
        {!monthly.loading && !monthly.error && (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthly.data || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#ffffff50" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "₹" + v / 1000 + "k"}
                tick={{ fontSize: 10, fill: "#ffffff50" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#ffffff80" }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#f97316"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                dot={{ r: 3, fill: "#f97316" }}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#bookGrad)"
                dot={{ r: 3, fill: "#8b5cf6" }}
                name="Bookings"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie + City — stack on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Revenue by Service Type" />
          {byType.loading && (
            <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
          )}
          {byType.error && (
            <ErrorBox msg={byType.error} onRetry={byType.refetch} />
          )}
          {!byType.loading && !byType.error && (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={byType.data || []}
                  dataKey="revenue"
                  nameKey="puja_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ puja_type, percent }) =>
                    `${typeLabel(puja_type)} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {(byType.data || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [fmt(v), typeLabel(n)]}
                  contentStyle={{
                    background: "#1a1f35",
                    border: "1px solid #f9731630",
                    borderRadius: 12,
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#f97316" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Revenue by City — Top 7" />
          {city.loading && (
            <div className="h-48 rounded-xl bg-white/5 animate-pulse" />
          )}
          {city.error && <ErrorBox msg={city.error} onRetry={city.refetch} />}
          {!city.loading && !city.error && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={city.data || []}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff08"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => "₹" + v / 1000 + "k"}
                  tick={{ fontSize: 10, fill: "#ffffff50" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="city"
                  tick={{ fontSize: 11, fill: "#ffffff80" }}
                  width={65}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                  {(city.data || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Services — scrollable table on mobile */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Top Performing Services" />
        {topSvc.loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} h="h-10" />
            ))}
          </div>
        )}
        {topSvc.error && (
          <ErrorBox msg={topSvc.error} onRetry={topSvc.refetch} />
        )}
        {!topSvc.loading && !topSvc.error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                  {["#", "Puja Name", "Type", "Bookings", "Revenue"].map(
                    (h) => (
                      <th
                        key={h}
                        className="pb-3 pr-4 font-semibold tracking-wider"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {(topSvc.data || []).map((s, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="py-3 pr-4 text-white/20 font-mono text-xs w-8">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-white/90 group-hover:text-orange-300 transition-colors">
                      {s.puja_name}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase">
                        {typeLabel(s.puja_type)}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-white/50 font-mono">
                      {s.total_bookings}
                    </td>
                    <td className="py-3 font-black text-orange-400">
                      {fmt(s.total_revenue)}
                    </td>
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
  const [status, setStatus] = useState("all");
  const [payType, setPayType] = useState("all");
  const [applyRange, setApplyRange] = useState(false);
  const [rangePage, setRangePage] = useState(1);

  const txEndpoint =
    applyRange && from && to
      ? `/date-range?from=${from}&to=${to}&status=${status}&payment_type=${payType}&page=${rangePage}&limit=10`
      : `/transactions?page=${page}&payment_type=${payType}&limit=10`;

  const tx = useApi(txEndpoint, [page, applyRange, rangePage, status, payType]);

  // Date range wala data
  const rangeSummary = applyRange ? tx.data?.summary : null;
  const rangePag = applyRange ? tx.data?.pagination : null;
  const rangeData = applyRange ? tx.data?.data || [] : [];

  // Normal completed transactions wala data
  const normalData = !applyRange ? tx.data?.data || [] : [];
  const normalPag = !applyRange ? tx.data?.pagination : null;

  // Final values
  const txData = applyRange ? rangeData : normalData;
  const pag = applyRange ? rangePag : normalPag;

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-5 flex flex-wrap items-end gap-3 md:gap-4">
        {["From Date", "To Date"].map((lbl, idx) => {
          const val = idx === 0 ? from : to;
          const setter = idx === 0 ? setFrom : setTo;
          return (
            <div key={lbl} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold tracking-widest uppercase text-white/30">
                {lbl}
              </label>
              <input
                type="date"
                value={val}
                onChange={(e) => setter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              />
            </div>
          );
        })}

        {/* Payment Type Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest uppercase text-white/30">
            Payment Type
          </label>
          <select
            value={payType}
            onChange={(e) => {
              setPayType(e.target.value);
              setPage(1);
              setRangePage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all min-w-[140px]"
          >
            <option value="all" className="bg-[#1a1f35]">All Types</option>
            <option value="full" className="bg-[#1a1f35]">Full Payment</option>
            <option value="advance" className="bg-[#1a1f35]">Advance Payment</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold tracking-widest uppercase text-white/30">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
              setRangePage(1);
            }}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all min-w-[140px]"
          >
            <option value="all" className="bg-[#1a1f35]">All Status</option>
            <option value="completed" className="bg-[#1a1f35]">Completed</option>
            <option value="pending" className="bg-[#1a1f35]">Pending</option>
            <option value="accepted" className="bg-[#1a1f35]">Accepted</option>
            <option value="declined" className="bg-[#1a1f35]">Declined</option>
          </select>
        </div>

        <button
          onClick={() => {
            setApplyRange(true);
            setPage(1);
            setRangePage(1);
          }}
          className="bg-orange-500 hover:bg-orange-400 text-white px-4 md:px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-orange-500/20 self-end"
        >
          Apply
        </button>
        {applyRange && (
          <button
            onClick={() => {
              setApplyRange(false);
              setFrom("");
              setTo("");
              setStatus("all");
              setRangePage(1);
            }}
            className="bg-white/5 hover:bg-white/10 text-white/60 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-white/10 self-end"
          >
            ✕ Clear
          </button>
        )}
        {rangeSummary && (
          <div className="w-full sm:w-auto sm:ml-auto flex gap-4 md:gap-6 text-sm mt-2 sm:mt-0">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">
                Total Revenue
              </p>
              <p className="font-black text-orange-400">
                {fmt(rangeSummary.total_revenue)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">
                Total Bookings
              </p>
              <p className="font-black text-white">
                {rangeSummary.total_bookings}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle
          title={
            applyRange ? "Filtered Transactions" : "Completed Transactions"
          }
        />
        {tx.loading && (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} h="h-12" />
            ))}
          </div>
        )}
        {tx.error && <ErrorBox msg={tx.error} onRetry={tx.refetch} />}
        {!tx.loading && !tx.error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                    {[
                        "Booking ID",
                        "User",
                        "Puja / Type",
                        "Total",
                        "Paid",
                        "Balance",
                        "Payment Status",
                        "Date",
                      ].map((h) => (
                      <th
                        key={h}
                        className="pb-3 pr-4 font-bold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txData.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-white/20 text-sm"
                      >
                        No transactions found.
                      </td>
                    </tr>
                  )}
                  {txData.map((t, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3.5 pr-4 font-mono text-xs text-orange-400/80">
                        {t.bookingId || "—"}
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-white/80 leading-tight">{t.user_name}</p>
                        <p className="text-[10px] text-white/30">{t.user_phone}</p>
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-white/60 max-w-[140px] truncate" title={t.puja_name}>
                          {t.puja_name}
                        </p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase font-black tracking-tighter">
                          {typeLabel(t.puja_type)}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-black text-white/90">
                        {fmt(t.total_price)}
                      </td>
                      <td className="py-3.5 pr-4 font-black text-emerald-400">
                        {fmt(t.paid_amount)}
                      </td>
                      <td className="py-3.5 pr-4 font-black text-orange-500">
                        {fmt(t.total_price - t.paid_amount)}
                      </td>
                      <td className="py-3.5 pr-4">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            t.payment_status === 'fully_paid' 
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-orange-500/15 text-orange-400 border-orange-500/30"
                         }`}>
                           {t.payment_status?.replace('_', ' ') || 'Pending'}
                         </span>
                      </td>
                      <td className="py-3.5 text-white/30 text-xs whitespace-nowrap">
                        {t.created_at
                          ? new Date(t.created_at).toLocaleDateString("en-IN")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - Always show if exists */}
            {pag && (
              <Pagination
                currentPage={applyRange ? rangePage : page}
                totalPages={pag.totalPages}
                onPageChange={applyRange ? setRangePage : setPage}
              />
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
  const [page, setPage] = useState(1);
  const [panditsData, setPanditsData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    API.get(`/pandit-earnings?page=${page}&limit=10`)
      .then((res) => {
        setPanditsData(res.data.data || []);
        setPagination(res.data.pagination || null);
      })
      .catch((err) =>
        setError(err.response?.data?.message || err.message || "Unknown error"),
      )
      .finally(() => setLoading(false));
  }, [page]);

  const data = panditsData;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Pandit Earnings & Performance" />
        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} h="h-12" />
            ))}
          </div>
        )}
        {error && <ErrorBox msg={error} />}
        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                    {[
                      "#",
                      "Pandit Name",
                      "Phone",
                      "Completed Pujas",
                      "Total Earned",
                    ].map((h) => (
                      <th key={h} className="pb-3 pr-6 font-bold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-white/20"
                      >
                        No Data found.
                      </td>
                    </tr>
                  )}
                  {data.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="py-3.5 pr-6 text-white/20 font-mono text-xs">
                        {String((page - 1) * 10 + i + 1).padStart(2, "0")}
                      </td>
                      <td className="py-3.5 pr-6 font-semibold text-white/90 capitalize group-hover:text-orange-300 transition-colors">
                        {p.pandit_name}
                      </td>
                      <td className="py-3.5 pr-6 text-white/40 font-mono text-xs">
                        {p.phone}
                      </td>
                      <td className="py-3.5 pr-6">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-0.5 rounded-full font-bold text-xs">
                          {p.completed_pujas}
                        </span>
                      </td>
                      <td className="py-3.5 font-black text-orange-400">
                        {fmt(p.total_earned)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && (
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {!loading && !error && data.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
          <SectionTitle title="Earnings Chart" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="pandit_name"
                tick={{ fontSize: 11, fill: "#ffffff60" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "₹" + v / 1000 + "k"}
                tick={{ fontSize: 11, fill: "#ffffff60" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total_earned"
                name="Total Earned"
                radius={[6, 6, 0, 0]}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
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
  const samagri = useApi("/samagri-kit");
  const data = donations.data || [];
  const sk = samagri.data || {};
  const topDonation = data[0];

  return (
    <div className="space-y-4">
      {/* KPI — 1 col mobile → 3 col md */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <KpiCard
          loading={donations.loading}
          icon="🙏"
          label="Total Donation Revenue"
          value={fmt(data.reduce((a, d) => a + Number(d.total_amount), 0))}
          sub="All contribution types"
          accent="orange"
        />
        <KpiCard
          loading={samagri.loading}
          icon="📦"
          label="Samagri Kit Revenue"
          value={fmt(sk.samagri_revenue)}
          sub={`${sk.total_kits_sold || 0} kits sold`}
          accent="amber"
        />
        <KpiCard
          loading={donations.loading}
          icon="🏆"
          label="Top Donation"
          value={topDonation?.donation_type || "—"}
          sub={topDonation ? fmt(topDonation.total_amount) + " collected" : ""}
          accent="green"
        />
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Donation Breakdown by Type" />
        {donations.loading && (
          <div className="h-48 md:h-60 rounded-xl bg-white/5 animate-pulse" />
        )}
        {donations.error && (
          <ErrorBox msg={donations.error} onRetry={donations.refetch} />
        )}
        {!donations.loading && !donations.error && (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis
                dataKey="donation_type"
                tick={{ fontSize: 11, fill: "#ffffff60" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => "₹" + v / 1000 + "k"}
                tick={{ fontSize: 11, fill: "#ffffff60" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="total_amount"
                name="Amount Collected"
                radius={[6, 6, 0, 0]}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#141828] p-4 md:p-6">
        <SectionTitle title="Contribution Type Details" />
        {donations.loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} h="h-10" />
            ))}
          </div>
        )}
        {donations.error && (
          <ErrorBox msg={donations.error} onRetry={donations.refetch} />
        )}
        {!donations.loading && !donations.error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-left text-[10px] text-white/30 border-b border-white/5 uppercase tracking-wider">
                  {[
                    "Donation Type",
                    "Count",
                    "Total Collected",
                    "Avg per Booking",
                  ].map((h) => (
                    <th key={h} className="pb-3 pr-6 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 pr-6 font-semibold text-white/80">
                      {d.donation_type}
                    </td>
                    <td className="py-3.5 pr-6 text-white/40 font-mono">
                      {d.count}
                    </td>
                    <td className="py-3.5 pr-6 font-black text-orange-400">
                      {fmt(d.total_amount)}
                    </td>
                    <td className="py-3.5 text-white/50">
                      {fmt(Math.round(d.total_amount / d.count))}
                    </td>
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
// SETTINGS TAB
// ══════════════════════════════════════════════════════════
const SettingsTab = () => {
  const [advancePercent, setAdvancePercent] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // Fetch current setting
    fetch(`${API_BASE_URL}/settings/advance_payment_percentage`)
      .then(res => res.json())
      .then(data => {
        if(data.success) setAdvancePercent(data.value);
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpdate = async () => {
    if(!advancePercent || isNaN(advancePercent) || advancePercent < 0 || advancePercent > 100) {
      setMsg("Invalid percentage (0-100)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("adminToken")}`
        },
        body: JSON.stringify({
          key: "advance_payment_percentage",
          value: advancePercent
        })
      });
      const data = await res.json();
      if(data.success) {
        setMsg("✅ Setting updated successfully!");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("❌ " + data.message);
      }
    } catch (err) {
      setMsg("❌ Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-[#141828] p-6 max-w-xl">
        <SectionTitle title="Payment Settings" />
        
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
            <h3 className="text-white font-bold mb-1">Advance Payment Percentage</h3>
            <p className="text-xs text-white/40 mb-4 leading-relaxed">
              Users will be required to pay this percentage of the total amount at the time of booking. 
              Applicable to Home Puja, Katha, Online Rituals, and Pind Dan. 
              (Temple Puja remains 100% full payment)
            </p>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input 
                  type="number"
                  value={advancePercent}
                  onChange={(e) => setAdvancePercent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="e.g. 25"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-bold">%</span>
              </div>
              <button 
                onClick={handleUpdate}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95"
              >
                {loading ? "Saving..." : "Save Setting"}
              </button>
            </div>
          </div>

          {msg && (
            <p className={`text-sm font-bold p-3 rounded-lg ${msg.includes('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {msg}
            </p>
          )}

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-white/80 font-bold text-sm mb-2">Current System Behavior</h3>
            <ul className="space-y-2">
               <li className="flex items-center gap-2 text-xs text-white/40">
                 <span className="text-emerald-400">✓</span> Partial payment records in `payments` table
               </li>
               <li className="flex items-center gap-2 text-xs text-white/40">
                 <span className="text-emerald-400">✓</span> Razorpay integration supports partial amounts
               </li>
               <li className="flex items-center gap-2 text-xs text-white/40">
                 <span className="text-emerald-400">✓</span> Financial dashboard reflects Paid vs Balance
               </li>
            </ul>
          </div>
        </div>
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
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "transactions", label: "Transactions", icon: "📋" },
    { key: "pandits", label: "Pandits", icon: "🧘" },
    { key: "donations", label: "Donations", icon: "🙏" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h1 className="text-xl font-black font-bold text-white  flex items-center gap-2">
              🕉️ Financial Dashboard
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">
              Manage donation types & pricing
            </p>
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
                ${
                  activeTab === t.key
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
            >
              <span>{t.icon}</span>
              <span className="hidden xs:inline sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "pandits" && <PanditsTab />}
        {activeTab === "donations" && <DonationsTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
