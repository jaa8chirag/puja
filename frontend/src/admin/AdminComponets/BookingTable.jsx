import React, { useEffect, useState } from "react";
import { API } from "../../services/adminApi";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  IndianRupee,
  User,
  BookOpen,
  Loader2,
  Filter,
  Search,
  X,
  MapPin,
  Users,
  Ticket,
  Heart,
} from "lucide-react";
import Pagination from "../../Components/Pagination";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const STATUS_CONFIG = {
  completed: {
    cls: "bg-emerald-900/30 text-emerald-400 border border-emerald-800",
    dot: "bg-emerald-400",
  },
  pending: {
    cls: "bg-amber-900/30 text-amber-400 border border-amber-800",
    dot: "bg-amber-400",
  },
  declined: {
    cls: "bg-rose-900/30 text-rose-400 border border-rose-800",
    dot: "bg-rose-400",
  },
  accepted: {
    cls: "bg-sky-900/30 text-sky-400 border border-sky-800",
    dot: "bg-sky-400",
  },
};

const getStatus = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] || {
    cls: "bg-slate-800 text-slate-400 border border-slate-700",
    dot: "bg-slate-500",
  };

// ─── Booking Detail Modal ─────────────────────────────────────────────────────

const BookingDetailDrawer = ({ booking, onClose }) => {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isTemple = booking?.puja_type === "temple_puja";
  const isSingle = booking?.ticket_type === "Single" || !booking?.ticket_type;

  useEffect(() => {
    if (!booking || isSingle) return;
    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(
          `${API_BASE_URL}/puja/get-members/${booking.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setMembers(data.data || []);
      } catch (err) {
        console.error("Members fetch error:", err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [booking?.id]);

  if (!booking) return null;

  const st = getStatus(booking.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#0f172a] rounded-2xl border border-slate-800 shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131e32] rounded-t-2xl">
          <div>
            <h2 className="text-[13px] font-extrabold text-white">
              Booking Detail
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {booking.bookingId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5 overflow-y-auto">
          {/* Status + Price */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${st.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {booking.status}
            </span>
            <span className="inline-flex items-center gap-1 font-black text-emerald-400 text-sm">
              <IndianRupee size={14} className="text-emerald-500" />
              {booking.total_price}
            </span>
          </div>

          {/* Puja Info */}
          <div className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Puja Info
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-900/30 flex items-center justify-center">
                <BookOpen size={18} className="text-orange-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-200">
                  {booking.puja_name}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold mt-0.5">
                  {booking.puja_type?.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Date
                </p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
                  <CalendarDays size={11} className="text-slate-500" />
                  {new Date(booking.preferred_date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Time
                </p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
                  <Clock size={11} className="text-slate-500" />
                  {booking.preferred_time}
                </span>
              </div>
            </div>

            {/* Ticket Type */}
            {booking.ticket_type && (
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Ticket Type
                </p>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-300">
                  <Ticket size={11} className="text-slate-500" />
                  {booking.ticket_type}
                </span>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Customer
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                {booking.user_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-200">
                  {booking.user_name}
                </p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {booking.devotee_name}
                </p>
              </div>
            </div>
            {booking.address && (
              <div className="flex items-start gap-2 pt-2 border-t border-slate-800">
                <MapPin size={12} className="text-slate-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {booking.address}
                </p>
              </div>
            )}
          </div>

          {/* Pandit Info */}
          <div className="bg-[#131e32] rounded-2xl border border-slate-800 p-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Pandit
            </p>
            {booking.pandit_name === "Not Assigned" ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 bg-[#0f172a] px-3 py-1.5 rounded-full border border-slate-800">
                <User size={10} /> Not Assigned Yet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-violet-300 bg-violet-900/30 px-3 py-1.5 rounded-full border border-violet-800 font-semibold">
                <User size={10} /> {booking.pandit_name}
              </span>
            )}
          </div>

          {/* Members Section */}
          {isTemple && (
            <div className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-orange-400" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {isSingle ? "Devotee" : "Family Members"}
                </p>
              </div>

              {isSingle ? (
                <div className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-3 border border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                    {booking.devotee_name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-slate-200">
                      {booking.devotee_name}
                    </p>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                      Self
                    </span>
                  </div>
                </div>
              ) : loadingMembers ? (
                <div className="flex items-center gap-2 py-4 justify-center text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-[11px]">Loading members...</span>
                </div>
              ) : members.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-[11px]">
                  No members found for this booking
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 bg-[#0f172a] rounded-xl p-3 border border-slate-800"
                    >
                      <div className="w-8 h-8 rounded-lg bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                        {m.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-slate-200 truncate">
                          {m.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wide">
                            {m.relation}
                          </span>
                          {m.gotra && (
                            <span className="text-[10px] text-slate-500">
                              • {m.gotra} gotra
                            </span>
                          )}
                          {m.rashi && (
                            <span className="text-[10px] text-slate-500">
                              • {m.rashi}
                            </span>
                          )}
                        </div>
                        {m.dob && (
                          <p className="text-[10px] text-slate-600 mt-0.5">
                            DOB:{" "}
                            {new Date(m.dob).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Samagri Kit */}
          {booking.samagrikit === 1 && (
            <div className="bg-purple-900/20 border border-purple-800 rounded-2xl p-4">
              <p className="text-[11px] font-bold text-purple-300">
                📦 Samagri Kit Included
              </p>
            </div>
          )}

          {/* Donations */}
          {booking.donations > 0 && (
            <div className="bg-[#131e32] rounded-2xl border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={13} className="text-rose-400" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Donations
                  </p>
                </div>
                <span className="inline-flex items-center gap-0.5 text-[12px] font-black text-rose-400">
                  <IndianRupee size={11} /> {booking.donations}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Bookings Component ──────────────────────────────────────────────────

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/bookings?page=${page}&limit=10`;
        if (statusFilter) url += `&status=${statusFilter}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        const res = await API.get(url);
        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.totalBookings || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, statusFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // ✅ Status update — table row mein directly
  const handleStatusUpdate = async (e, bookingId, newStatus) => {
    e.stopPropagation();
    setUpdatingStatusId(`${bookingId}-${newStatus}`);
    try {
      await API.put(`/update-status/${bookingId}`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
      );
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const filters = ["all", "pending", "accepted", "declined", "completed"];

  return (
    <>
      {/* Detail Modal */}
      {selectedBooking && (
        <BookingDetailDrawer
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-5">
        {/* <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white leading-tight">
              Booking Logs
            </h1>
            <p className="text-[11px] text-slate-500">
              All puja booking records
            </p>
          </div>
        </div> */}

        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-orange-500" /> Booking Logs
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">All puja booking records</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap ml-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Booking ID…"
                className="pl-8 pr-3 py-2 text-[12px] bg-[#131e32] border border-slate-700 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500 w-40 sm:w-52 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-[12px] font-bold rounded-xl transition shadow-md shadow-orange-900/20"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[12px] font-bold rounded-xl transition"
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131e32] border border-slate-700 rounded-xl">
            <BookOpen size={13} className="text-orange-500" />
            <span className="text-xs font-bold text-slate-300">
              {total} Bookings
            </span>
          </div>
        </div>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <Filter size={12} className="text-slate-500 mr-1" />
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setStatusFilter(f === "all" ? "" : f);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold border capitalize transition-all ${
              (f === "all" && statusFilter === "") || f === statusFilter
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-900/20"
                : "bg-[#131e32] text-slate-400 border-slate-700 hover:bg-[#1a2744]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Table — Desktop/Tablet ── */}
      <div className="bg-[#131e32] rounded-2xl shadow-xl border border-slate-800 overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-xs">Loading bookings…</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600">
              <BookOpen size={36} className="mb-2 opacity-30" />
              <p className="text-xs font-semibold">No bookings found</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3 text-left font-semibold">
                    Booking ID
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-left font-semibold">Service</th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Pandit
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Schedule
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-3 text-center font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  const st = getStatus(b.status);
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className={`border-b border-slate-800/60 transition-colors hover:bg-[#1a2744] cursor-pointer ${i % 2 !== 0 ? "bg-[#0f172a]/40" : ""}`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] font-black text-slate-300 tracking-tight">
                          {b.bookingId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-[11px] flex-shrink-0">
                            {b.user_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200 leading-none">
                              {b.user_name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase truncate max-w-[180px]">
                              {b.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center flex-col gap-2">
                          <p className="font-semibold text-slate-200 leading-none">
                            {b.puja_name}
                          </p>
                          {b.samagrikit === 1 && (
                            <p className="text-[9px] font-semibold bg-purple-900/30 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                              Samagri Kit
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        {b.pandit_name === "Not Assigned" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-[#0f172a] px-2 py-0.5 rounded-full border border-slate-800">
                            <User size={9} /> Unassigned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-violet-300 bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-800 font-semibold">
                            <User size={9} /> {b.pandit_name}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300">
                            <CalendarDays size={9} className="text-slate-500" />
                            {new Date(b.preferred_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock size={9} /> {b.preferred_time}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-0.5 font-black text-emerald-400 text-xs">
                          <IndianRupee size={11} className="text-emerald-500" />
                          {b.total_price}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${st.cls}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${st.dot}`}
                          />
                          {b.status}
                        </span>
                      </td>
                      {/* ✅ Actions */}
                      <td
                        className="px-5 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {b.status === "pending" && (
                            <>
                              <button
                                onClick={(e) =>
                                  handleStatusUpdate(e, b.id, "accepted")
                                }
                                disabled={
                                  updatingStatusId === `${b.id}-accepted`
                                }
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition disabled:opacity-40"
                              >
                                {updatingStatusId === `${b.id}-accepted`
                                  ? "..."
                                  : "Accept"}
                              </button>
                              <button
                                onClick={(e) =>
                                  handleStatusUpdate(e, b.id, "declined")
                                }
                                disabled={
                                  updatingStatusId === `${b.id}-declined`
                                }
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition disabled:opacity-40"
                              >
                                {updatingStatusId === `${b.id}-declined`
                                  ? "..."
                                  : "Decline"}
                              </button>
                            </>
                          )}
                          {b.status === "accepted" && (
                            <button
                              onClick={(e) =>
                                handleStatusUpdate(e, b.id, "completed")
                              }
                              disabled={
                                updatingStatusId === `${b.id}-completed`
                              }
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-40"
                            >
                              {updatingStatusId === `${b.id}-completed`
                                ? "..."
                                : "Complete"}
                            </button>
                          )}
                          {b.status === "completed" && (
                            <span className="text-[10px] text-slate-600 italic">
                              Done
                            </span>
                          )}
                          {b.status === "declined" && (
                            <button
                              onClick={(e) =>
                                handleStatusUpdate(e, b.id, "accepted")
                              }
                              disabled={updatingStatusId === `${b.id}-accepted`}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition disabled:opacity-40"
                            >
                              {updatingStatusId === `${b.id}-accepted`
                                ? "..."
                                : "Re-accept"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && bookings.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        )}
      </div>

      {/* ── Card List — Mobile only ── */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-500 bg-[#131e32] rounded-2xl border border-slate-800">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-xs">Loading bookings…</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600 bg-[#131e32] rounded-2xl border border-slate-800">
            <BookOpen size={36} className="mb-2 opacity-30" />
            <p className="text-xs font-semibold">No bookings found</p>
          </div>
        ) : (
          bookings.map((b) => {
            const st = getStatus(b.status);
            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="bg-[#131e32] rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 cursor-pointer hover:border-slate-600 transition-all active:scale-[0.99]"
              >
                {/* Row 1: ID + Status */}
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-black text-slate-300 tracking-tight">
                    {b.bookingId}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${st.cls}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    {b.status}
                  </span>
                </div>

                {/* Row 2: Customer */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-900/30 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                    {b.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 text-sm leading-none">
                      {b.user_name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">
                      {b.puja_name}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 font-black text-emerald-400 text-xs ml-auto">
                    <IndianRupee size={11} className="text-emerald-500" />
                    {b.total_price}
                  </span>
                </div>

                {/* Row 3: Pandit + Schedule */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  {b.pandit_name === "Not Assigned" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-[#0f172a] px-2 py-0.5 rounded-full border border-slate-800">
                      <User size={9} /> Unassigned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-violet-300 bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-800 font-semibold">
                      <User size={9} /> {b.pandit_name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={9} className="text-slate-500" />
                      {new Date(b.preferred_date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock size={9} /> {b.preferred_time}
                    </span>
                  </div>
                </div>

                {/* Row 4: Mobile Action Buttons */}
                <div
                  className="flex gap-2 flex-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {b.status === "pending" && (
                    <>
                      <button
                        onClick={(e) => handleStatusUpdate(e, b.id, "accepted")}
                        disabled={updatingStatusId === `${b.id}-accepted`}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition disabled:opacity-40"
                      >
                        {updatingStatusId === `${b.id}-accepted`
                          ? "..."
                          : "Accept"}
                      </button>
                      <button
                        onClick={(e) => handleStatusUpdate(e, b.id, "declined")}
                        disabled={updatingStatusId === `${b.id}-declined`}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition disabled:opacity-40"
                      >
                        {updatingStatusId === `${b.id}-declined`
                          ? "..."
                          : "Decline"}
                      </button>
                    </>
                  )}
                  {b.status === "accepted" && (
                    <button
                      onClick={(e) => handleStatusUpdate(e, b.id, "completed")}
                      disabled={updatingStatusId === `${b.id}-completed`}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition disabled:opacity-40"
                    >
                      {updatingStatusId === `${b.id}-completed`
                        ? "..."
                        : "Complete"}
                    </button>
                  )}
                  {b.status === "declined" && (
                    <button
                      onClick={(e) => handleStatusUpdate(e, b.id, "accepted")}
                      disabled={updatingStatusId === `${b.id}-accepted`}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition disabled:opacity-40"
                    >
                      {updatingStatusId === `${b.id}-accepted`
                        ? "..."
                        : "Re-accept"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Pagination */}
        {!loading && bookings.length > 0 && (
          <div className="flex justify-between items-center px-1 py-2">
            <span className="text-[11px] text-slate-500">
              Page <b className="text-slate-300">{page}</b> /{" "}
              <b className="text-slate-300">{totalPages}</b>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="flex items-center gap-0.5 px-3 py-1.5 text-[11px] font-semibold border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a2744] bg-[#131e32] text-slate-300"
              >
                <ChevronLeft size={12} /> Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="flex items-center gap-0.5 px-3 py-1.5 text-[11px] font-semibold border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a2744] bg-[#131e32] text-slate-300"
              >
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Bookings;
