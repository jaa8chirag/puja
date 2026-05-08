import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  Trash2,
  ShoppingBag,
  Search,
  X,
  CreditCard,
} from "lucide-react";
import { loadRazorpay } from "../utils/razorpay";
import SEO from "../Components/SEO";
import { CardSkeleton } from "../Components/Skeleton";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState({
    show: false,
    id: null,
    data: null,
  });

  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeSubTab, setActiveSubTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const get24HourTime = (timeStr) => {
    if (!timeStr || !timeStr.includes(" ")) return timeStr || "00:00";
    try {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") hours = "00";
      if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
      return `${hours.padStart(2, "0")}:${minutes}`;
    } catch (e) {
      return "00:00";
    }
  };

  useEffect(() => {
    const fetchMyBookings = async () => {
      const token = localStorage.getItem("token");
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE_URL}/puja/my-bookings?t=${timestamp}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          cache: "no-store",
        });
        const data = await response.json();
        if (data.success) setBookings(data.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  const handlePayRemaining = async (booking) => {
    const res = await loadRazorpay();
    if (!res) {
      setErrorMsg("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const token = localStorage.getItem("token");
    const balance = booking.total_price - booking.paid_amount;

    if (balance <= 0) return;

    try {
      // 1. Create Razorpay Order
      const orderRes = await fetch(`${API_BASE_URL}/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: balance }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error("Could not create order");
      }

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Sri Vedic Puja",
        description: `Remaining Balance for ${booking.puja_name}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/puja/pay-balance`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                booking_id: booking.id,
                amount: balance,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === booking.id
                    ? {
                        ...b,
                        paid_amount: Number(b.total_price),
                        payment_status: "fully_paid",
                      }
                    : b
                )
              );
              setErrorMsg("Payment successful! Full payment received.");
              setTimeout(() => setErrorMsg(""), 3000);
            } else {
              setErrorMsg(verifyData.message || "Payment verification failed.");
            }
          } catch (err) {
            console.error(err);
            setErrorMsg("Connection error during payment verification.");
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          contact: localStorage.getItem("userPhone") || "",
        },
        theme: { color: "#F97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to initiate payment.");
    }
  };




  const handleCancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/puja/cancel-booking/${bookingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setBookings((currentBookings) =>
          currentBookings.map((b) =>
            b.id === bookingId
              ? {
                ...b,
                status: "cancelled",
                assignment_status: "cancelled",
                otp: null,
              }
              : b
          )
        );
        setErrorMsg("Booking cancelled successfully!");
        setTimeout(() => setErrorMsg(""), 3000);
      } else {
        setErrorMsg(data.message || "Failed to cancel booking.");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setErrorMsg("Something went wrong!");
      setTimeout(() => setErrorMsg(""), 3000);
    } finally {
      setShowConfirm({ show: false, id: null, data: null });
    }
  };

  const CancelButton = ({ booking, isExpired, isCompleted, size = "md" }) => {
    const isCancelled =
      booking.assignment_status === "declined" ||
      booking.status === "declined" ||
      booking.assignment_status === "cancelled" ||
      booking.status === "cancelled";

    if (isCancelled || isCompleted) return null;

    const isDisabled = isExpired;
    const tooltipText = "Puja date & time expired, cannot cancel";

    const baseClass =
      size === "sm"
        ? "flex items-center gap-1 font-bold text-[10px] uppercase border px-2 py-1 rounded-lg transition-all"
        : "flex items-center gap-1.5 font-bold text-[10px] uppercase border px-3 py-1.5 rounded-xl transition-all";

    return (
      <div className="relative group inline-block">
        <button
          disabled={isDisabled}
          onClick={() =>
            !isDisabled &&
            setShowConfirm({ show: true, id: booking.id, data: booking })
          }
          className={`${baseClass} ${isDisabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-red-500 border-red-200 hover:bg-red-50 active:scale-95 cursor-pointer"
            }`}
        >
          <Trash2 size={size === "sm" ? 11 : 12} />
          {size === "sm" ? "Cancel" : "Cancel Booking"}
        </button>
        {isDisabled && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mb-1" />
            <div className="bg-gray-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              {tooltipText}
            </div>
          </div>
        )}
      </div>
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const isCompleted = b.assignment_status === "completed";
    const isCancelled =
      b.assignment_status === "declined" ||
      b.status === "declined" ||
      b.assignment_status === "cancelled" ||
      b.status === "cancelled";

    let tabMatch = false;
    if (activeTab === "cancelled") {
      tabMatch = isCancelled;
    } else if (activeTab === "completed") {
      tabMatch = isCompleted && !isCancelled;
    } else {
      tabMatch = !isCompleted && !isCancelled;
    }

    let subTabMatch = true;
    if (activeSubTab === "home_puja") {
      subTabMatch = ["home_puja", "katha", "pinddanOnline"].includes(b.puja_type);
    } else if (activeSubTab === "temple_puja") {
      subTabMatch = !["home_puja", "katha", "pinddanOnline"].includes(b.puja_type);
    }

    const searchMatch =
      searchQuery === "" ||
      b.puja_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.final_address?.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && subTabMatch && searchMatch;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-[#FFF4E1] p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-orange-200 animate-pulse rounded-lg mb-8" />
          {Array(4).fill(0).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 sm:p-6 overflow-x-hidden">
      <SEO
        title="My Sacred Bookings"
        description="Track and manage your upcoming and past ritual bookings. View Pandit details, Sankalp OTPs, and payment history securely."
        keywords="My Bookings, Ritual History, Track Puja, Sri Vedic Puja"
      />
      {/* Confirmation Modal & Alert (same as before) */}
      {showConfirm.show &&
        (() => {
          const b = showConfirm.data;
          const bookingDate = b?.preferred_date.split("T")[0];
          const time24 = get24HourTime(b?.preferred_time);
          const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);
          const isExpired = mergedDateTime < new Date();
          return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-[#FFFCEF] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
                <div className="flex flex-col items-start text-left">
                  <h3 className="text-2xl font-bold text-[#3b2a1a] font-serif mb-2">
                    Cancel Booking?
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Are you sure you want to cancel this booking for{" "}
                    <span className="font-bold text-[#3b2a1a] italic">
                      {b?.puja_name}
                    </span>
                    ?
                  </p>
                  {isExpired && (
                    <div className="w-full bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
                      <p className="text-red-600 font-bold text-[13px] flex items-center gap-2">
                        <span>⚠️</span> Event has passed
                      </p>
                    </div>
                  )}
                  <div className="w-full border-t border-gray-200 pt-4 mb-6">
                    <p className="text-[#8b5e34] font-bold text-xs uppercase mb-3 tracking-widest">
                      Refund Policy:
                    </p>
                    <ul className="text-[#8b5e34]/80 text-[13px] space-y-2 list-none font-medium">
                      {[
                        "More than 48 hours: 100% refund",
                        "24-48 hours: 50% refund",
                        "Less than 24 hours: No refund",
                      ].map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-[#8b5e34]/40 rounded-full" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() =>
                        setShowConfirm({ show: false, id: null, data: null })
                      }
                      className="flex-1 px-4 py-3 bg-white border border-orange-200 text-[#3b2a1a] rounded-xl font-bold hover:bg-orange-50 transition-all text-sm shadow-sm active:scale-95"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={() => handleCancelBooking(showConfirm.id)}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 bg-red-500 text-white hover:bg-red-600"
                    >
                      Yes, Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {errorMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce text-center min-w-[300px]">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border-2 border-white ${errorMsg.includes("successfully")
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
              }`}
          >
            <span className="text-xl">
              {errorMsg.includes("successfully") ? "✅" : "⚠️"}
            </span>
            <p className="font-bold text-sm tracking-wide">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h2 className="text-xl sm:text-3xl font-serif text-[#3b2a1a]">
            My Sacred <span className="text-orange-500 italic">Bookings</span>
          </h2>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1 uppercase tracking-widest font-bold">
            Track and manage your puja bookings.
          </p>
        </div>

        {/* Main Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex gap-1.5 bg-white rounded-xl p-1 shadow-sm border border-orange-100 w-fit">
            <button
              onClick={() => { setActiveTab("upcoming"); setActiveSubTab("all"); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "upcoming" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"
                }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => { setActiveTab("completed"); setActiveSubTab("all"); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "completed" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"
                }`}
            >
              History
            </button>
            <button
              onClick={() => { setActiveTab("cancelled"); setActiveSubTab("all"); }}
              className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "cancelled" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"
                }`}
            >
              Cancelled
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-orange-200 rounded-xl text-[13px] focus:outline-none focus:border-orange-400 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="mb-5 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex gap-1.5 bg-white rounded-xl p-1 shadow-sm border border-orange-100 w-fit min-w-max">
            <button onClick={() => setActiveSubTab("all")} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${activeSubTab === "all" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"}`}>All</button>
            <button onClick={() => setActiveSubTab("home_puja")} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${activeSubTab === "home_puja" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"}`}>Home Puja</button>
            <button onClick={() => setActiveSubTab("temple_puja")} className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${activeSubTab === "temple_puja" ? "bg-orange-500 text-white shadow-md" : "text-gray-500 hover:text-orange-500"}`}>Temple Puja</button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl text-center shadow-sm">
            <p className="text-gray-500 font-medium">
              {searchQuery ? "No bookings found matching your search." : activeTab === "cancelled" ? "No cancelled bookings." : activeTab === "completed" ? "No completed bookings yet." : "No upcoming/pending bookings."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isTemplePuja = ["temple_puja", "pind_dan"].includes(b.puja_type);
              const bookingDate = b.preferred_date.split("T")[0];
              const time24 = get24HourTime(b.preferred_time);
              const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);
              const isEventExpired = mergedDateTime < new Date();
              const isCompleted = b.assignment_status === "completed";

              return (
                <div
                  key={b.id}
                  className="relative bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all flex flex-col md:flex-row items-stretch gap-3 md:gap-6"
                >
                  {/* Badge */}
                  <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-xl rounded-tr-2xl text-[9px] font-black uppercase tracking-wider text-white z-10 ${isTemplePuja ? "bg-orange-500" : "bg-blue-500"}`}>
                    {isTemplePuja ? "Temple Ritual" : "Home Ritual"}
                  </div>

                  {/* Image */}
                  <div className="w-full h-32 sm:h-40 md:w-48 md:h-48 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <img
                      src={`${API_BASE_URL}/uploads/${b.image_url}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      alt={b.puja_name}
                    />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                      {b.puja_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 mt-2 text-[12px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-orange-400 shrink-0" />
                        {new Date(b.preferred_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className="text-orange-400 shrink-0" />
                        {b.preferred_time}
                      </div>
                      <div className="flex items-start gap-1.5 col-span-2">
                        <MapPin size={12} className="text-orange-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 leading-tight">{b.final_address}</span>
                      </div>
                    </div>

                    {b.samagrikit === 1 && (
                      <div className="mt-2.5 inline-flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-100 rounded-lg">
                        <ShoppingBag size={10} className="text-green-500" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">Samagri Kit</span>
                      </div>
                    )}



                    {/* Contributions Section */}
                    {b.contribution_names && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {b.contribution_names.split(',').map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-[9px] font-bold uppercase tracking-tighter">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 border-t border-gray-50 pt-3">
                      {b.status === "refunded" ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Payment</span>
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-emerald-100">
                            Refunded
                          </div>
                          <span className="text-[12px] font-black text-emerald-700">₹{Number(b.total_price).toLocaleString("en-IN")}</span>
                        </div>
                      ) : b.payment_status === "partially_paid" ? (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Total</span>
                            <span className="text-[12px] font-black text-gray-700">₹{Number(b.total_price).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Paid</span>
                            <span className="text-[12px] font-black text-green-600">₹{Number(b.paid_amount).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-lg">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Due</span>
                            <span className="text-[12px] font-black text-amber-700">₹{(b.total_price - b.paid_amount).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Total</span>
                          <span className="text-[13px] font-black text-green-700">₹{Number(b.total_price).toLocaleString("en-IN")}</span>
                          <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-green-100">
                            ✓ Fully Paid
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OTP Section same as before */}
                    {b.otp && b.assignment_status !== "completed" && (
                      b.assignment_status === "accepted" ? (
                        <div className="mt-3 inline-flex items-center gap-2.5 bg-green-50 border border-green-300 rounded-2xl px-3.5 py-2 shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full shrink-0 shadow-sm">
                            <span className="text-white text-[10px] font-black">✓</span>
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Booking Accepted</span>
                            <span className="text-[13px] font-black text-green-700 tracking-tight">
                              {b.pandit_name ? `Pandit: ${b.pandit_name}` : "Pandit assigned"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 inline-flex items-center gap-2.5 bg-orange-50 border border-orange-300 rounded-2xl px-3.5 py-2 shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shrink-0 shadow-sm">
                            <span className="text-white text-[10px] font-black">🔐</span>
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">Entry OTP</span>
                            <span className="text-[15px] font-black text-orange-700 tracking-[0.2em]">{b.otp}</span>
                          </div>
                        </div>
                      )
                    )}

                    {/* Mobile Status + Cancel */}
                    <div className="mt-2 flex items-center justify-between gap-2 md:hidden">
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter shrink-0">
                        ID: <span className="text-orange-500">{b.bookingId}</span>
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${(b.assignment_status === "pending" && b.pandit_name) ? "bg-blue-100 text-blue-600 border border-blue-200" :
                            b.assignment_status === "pending" ? "bg-orange-100 text-orange-600 border border-orange-200" :
                              b.assignment_status === "accepted" ? "bg-indigo-100 text-indigo-600 border border-indigo-200" :
                                b.assignment_status === "declined" ? "text-red-500 bg-red-100 border border-red-200" :
                                  b.assignment_status === "completed" ? "bg-green-100 text-green-600 border border-green-200" :
                                    "bg-blue-100 text-blue-600 border border-blue-200"
                          }`}>
                          {b.assignment_status === "pending" && b.pandit_name ? "Assigned" :
                            b.assignment_status === "pending" ? "Finding" :
                              b.assignment_status === "accepted" ? "In Progress" :
                                b.assignment_status}
                        </div>
                        <CancelButton booking={b} isExpired={isEventExpired} isCompleted={isCompleted} size="sm" />
                        {b.payment_status === "partially_paid" && (
                          <button
                            onClick={() => handlePayRemaining(b)}
                            className="bg-orange-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1"
                          >
                            <CreditCard size={10} />
                            Pay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Right Panel */}
                  <div className="hidden md:flex flex-col justify-center items-end border-l border-gray-100 pl-6 min-w-[160px] flex-shrink-0">
                    <p className="mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      ID: <span className="ml-1 text-orange-600">{b.bookingId}</span>
                    </p>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${(b.assignment_status === "pending" && b.pandit_name) ? "bg-blue-100 text-blue-600 border border-blue-200" :
                        b.assignment_status === "pending" ? "bg-orange-100 text-orange-600 border border-orange-200" :
                          b.assignment_status === "accepted" ? "bg-indigo-100 text-indigo-600 border border-indigo-200" :
                            b.assignment_status === "declined" ? "text-red-500 bg-red-100 border border-red-200" :
                              b.assignment_status === "completed" ? "bg-green-100 text-green-600 border border-green-200" :
                                "bg-blue-100 text-blue-600 border border-blue-200"
                      }`}>
                      {b.assignment_status === "pending" && b.pandit_name ? "Pandit Assigned" :
                        b.assignment_status === "pending" ? "Finding Pandit" :
                          b.assignment_status === "accepted" ? "In Progress" :
                            b.assignment_status}
                    </div>
                    <div className="space-y-3 flex flex-col items-end mt-5">
                      <CancelButton booking={b} isExpired={isEventExpired} isCompleted={isCompleted} size="md" />
                      {b.payment_status === "partially_paid" && (
                        <button
                          onClick={() => handlePayRemaining(b)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                        >
                          <CreditCard size={16} />
                          Pay Balance
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;