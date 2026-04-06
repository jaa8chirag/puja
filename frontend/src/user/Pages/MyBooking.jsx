// import React, { useEffect, useState } from "react";
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Info,
//   Trash2,
//   ShoppingBag,
// } from "lucide-react";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// const MyBookings = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMsg, setErrorMsg] = useState("");
//   const [showConfirm, setShowConfirm] = useState({
//     show: false,
//     id: null,
//     data: null,
//   });

//   const get24HourTime = (timeStr) => {
//     if (!timeStr || !timeStr.includes(" ")) return timeStr || "00:00";
//     try {
//       const [time, modifier] = timeStr.split(" ");
//       let [hours, minutes] = time.split(":");
//       if (hours === "12") hours = "00";
//       if (modifier === "PM") hours = (parseInt(hours, 10) + 12).toString();
//       return `${hours.padStart(2, "0")}:${minutes}`;
//     } catch (e) {
//       return "00:00";
//     }
//   };

//   useEffect(() => {
//     const fetchMyBookings = async () => {
//       const token = localStorage.getItem("token");
//       try {
//         const response = await fetch(`${API_BASE_URL}/puja/my-bookings`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await response.json();
//         if (data.success) setBookings(data.bookings);
//       } catch (error) {
//         console.error("Error fetching bookings:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyBookings();
//   }, []);

//   const handleCancelBooking = async (bookingId) => {
//     const token = localStorage.getItem("token");
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/puja/cancel-booking/${bookingId}`,
//         {
//           method: "DELETE",
//           headers: { Authorization: `Bearer ${token}` },
//         },
//       );
//       const data = await response.json();
//       if (data.success) {
//         setBookings(bookings.filter((b) => b.id !== bookingId));
//         setErrorMsg("Booking cancelled successfully!");
//         setTimeout(() => setErrorMsg(""), 3000);
//       } else {
//         setErrorMsg(data.message || "Failed to cancel booking.");
//         setTimeout(() => setErrorMsg(""), 3000);
//       }
//     } catch (error) {
//       console.error("Error cancelling booking:", error);
//       setErrorMsg("Something went wrong!");
//       setTimeout(() => setErrorMsg(""), 3000);
//     } finally {
//       setShowConfirm({ show: false, id: null, data: null });
//     }
//   };

//   // ── Reusable Cancel Button with Tooltip ──
//   const CancelButton = ({ booking, isExpired, isCompleted, size = "md" }) => {
//     const isDisabled = isExpired || isCompleted;

//     const tooltipText = isCompleted
//       ? "Puja completed, cannot cancel"
//       : "Puja date & time expired, cannot cancel";

//     const baseClass =
//       size === "sm"
//         ? "flex items-center gap-1 font-bold text-[10px] uppercase border px-2 py-1 rounded-lg transition-all"
//         : "flex items-center gap-1.5 font-bold text-[10px] uppercase border px-3 py-1.5 rounded-xl transition-all";

//     return (
//       <div className="relative group inline-block">
//         <button
//           disabled={isDisabled}
//           onClick={() =>
//             !isDisabled &&
//             setShowConfirm({ show: true, id: booking.id, data: booking })
//           }
//           className={`${baseClass} ${
//             isDisabled
//               ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
//               : "text-red-500 border-red-200 hover:bg-red-50 active:scale-95 cursor-pointer"
//           }`}
//         >
//           <Trash2 size={size === "sm" ? 11 : 12} />
//           {size === "sm" ? "Cancel" : "Cancel Booking"}
//         </button>

//         {/* Tooltip — sirf tab dikhega jab disabled ho */}
//         {isDisabled && (
//           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//             <div className="bg-gray-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
//               {tooltipText}
//             </div>
//             <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
//           </div>
//         )}
//       </div>
//     );
//   };

//   if (loading)
//     return (
//       <div className="text-center py-20 text-orange-600 font-bold">
//         Loading Bookings...
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#FFF4E1] p-4 sm:p-6">
//       {/* ── CONFIRMATION MODAL ── */}
//       {showConfirm.show &&
//         (() => {
//           const b = showConfirm.data;
//           const bookingDate = b?.preferred_date.split("T")[0];
//           const time24 = get24HourTime(b?.preferred_time);
//           const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);
//           const isExpired = mergedDateTime < new Date();

//           return (
//             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
//               <div className="bg-[#FFFCEF] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100">
//                 <div className="flex flex-col items-start text-left">
//                   <h3 className="text-2xl font-bold text-[#3b2a1a] font-serif mb-2">
//                     Cancel Booking?
//                   </h3>
//                   <p className="text-gray-600 mb-4 text-sm leading-relaxed">
//                     Are you sure you want to cancel this booking for{" "}
//                     <span className="font-bold text-[#3b2a1a] italic">
//                       {b?.puja_name}
//                     </span>
//                     ?
//                   </p>

//                   {isExpired && (
//                     <div className="w-full bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
//                       <p className="text-red-600 font-bold text-[13px] flex items-center gap-2">
//                         <span>⚠️</span> Event has passed
//                       </p>
//                     </div>
//                   )}

//                   <div className="w-full border-t border-gray-200 pt-4 mb-6">
//                     <p className="text-[#8b5e34] font-bold text-xs uppercase mb-3 tracking-widest">
//                       Refund Policy:
//                     </p>
//                     <ul className="text-[#8b5e34]/80 text-[13px] space-y-2 list-none font-medium">
//                       {[
//                         "More than 48 hours: 100% refund",
//                         "24-48 hours: 50% refund",
//                         "Less than 24 hours: No refund",
//                       ].map((p) => (
//                         <li key={p} className="flex items-center gap-2">
//                           <span className="w-1.5 h-1.5 bg-[#8b5e34]/40 rounded-full" />
//                           {p}
//                         </li>
//                       ))}
//                     </ul>
//                   </div>

//                   <div className="flex gap-3 w-full">
//                     <button
//                       onClick={() =>
//                         setShowConfirm({ show: false, id: null, data: null })
//                       }
//                       className="flex-1 px-4 py-3 bg-white border border-orange-200 text-[#3b2a1a] rounded-xl font-bold hover:bg-orange-50 transition-all text-sm shadow-sm active:scale-95"
//                     >
//                       Keep Booking
//                     </button>
//                     <button
//                       onClick={() => handleCancelBooking(showConfirm.id)}
//                       className="flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95 bg-red-500 text-white hover:bg-red-600"
//                     >
//                       Yes, Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })()}

//       {/* ── ALERT MESSAGE ── */}
//       {errorMsg && (
//         <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce text-center min-w-[300px]">
//           <div
//             className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border-2 border-white ${
//               errorMsg.includes("successfully")
//                 ? "bg-green-500 text-white"
//                 : "bg-red-500 text-white"
//             }`}
//           >
//             <span className="text-xl">
//               {errorMsg.includes("successfully") ? "✅" : "⚠️"}
//             </span>
//             <p className="font-bold text-sm tracking-wide">{errorMsg}</p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto">
//         <h2 className="text-4xl font-serif text-[#3b2a1a] mb-2">
//           My Sacred <span className="text-orange-500 italic">Bookings</span>
//         </h2>
//         <p className="text-base text-gray-700 mb-8 sm:mb-10">
//           Track and manage your puja bookings.
//         </p>

//         {bookings.length === 0 ? (
//           <div className="bg-white p-8 sm:p-10 rounded-3xl text-center shadow-sm">
//             <p className="text-gray-500 font-medium">
//               No bookings have been made yet.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {bookings.map((b) => {
//               const isTemplePuja = ["temple_puja", "pind_dan"].includes(
//                 b.puja_type,
//               );
//               const bookingDate = b.preferred_date.split("T")[0];
//               const time24 = get24HourTime(b.preferred_time);
//               const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);

//               // ── Cancel button logic ──
//               // Button hamesha dikhega
//               // Disabled: date/time expire ho gayi  OR  status "completed" hai
//               const isEventExpired = mergedDateTime < new Date();
//               const isCompleted = b.assignment_status === "completed";

//               return (
//                 <div
//                   key={b.id}
//                   className="relative overflow-visible bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-orange-300 transition-all hover:shadow-md flex flex-col md:flex-row md:items-stretch gap-4 sm:gap-6"
//                 >
//                   {/* Puja type badge */}
//                   <div
//                     className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-white z-10 ${
//                       isTemplePuja ? "bg-orange-500" : "bg-blue-500"
//                     }`}
//                   >
//                     {isTemplePuja ? "Temple Ceremony" : "Home Ritual"}
//                   </div>

//                   {/* Image */}
//                   <div
//                     className={`w-full h-48 md:w-40 shrink-0 overflow-hidden rounded-2xl ${
//                       isTemplePuja ? "md:h-40" : "md:h-32"
//                     }`}
//                   >
//                     <img
//                       src={`${API_BASE_URL}/uploads/${b.image_url}`}
//                       className="w-full h-full object-cover rounded-2xl shadow-sm"
//                       alt={b.puja_name}
//                     />
//                   </div>

//                   {/* Main content */}
//                   <div className="flex-1 min-w-0">
//                     <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 pr-24">
//                       {b.puja_name}
//                     </h3>

//                     <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3 text-sm text-gray-600">
//                       <div className="flex items-center gap-2">
//                         <Calendar
//                           size={13}
//                           className="text-orange-500 shrink-0"
//                         />
//                         {new Date(b.preferred_date).toLocaleDateString("en-IN")}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Clock size={13} className="text-orange-500 shrink-0" />
//                         {b.preferred_time}
//                       </div>
//                       <div className="flex items-start gap-2 col-span-2">
//                         <MapPin
//                           size={13}
//                           className="text-orange-500 shrink-0 mt-0.5"
//                         />
//                         <span className="italic text-gray-500 leading-tight text-[12px] sm:text-sm">
//                           {b.final_address}
//                         </span>
//                       </div>
//                     </div>

//                     {/* Samagri Kit Badge */}
//                     {b.samagrikit === 1 && (
//                       <div className="mt-3">
//                         <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-2xl px-3.5 py-2 shadow-sm">
//                           <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shrink-0 shadow-sm">
//                             <ShoppingBag size={12} className="text-white" />
//                           </div>
//                           <div className="flex flex-col leading-tight">
//                             <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
//                               ✔ Added On
//                             </span>
//                             <span className="text-[13px] font-black text-emerald-800 tracking-tight">
//                               Samagri Kit
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Temple booking details */}
//                     {isTemplePuja && (
//                       <div className="mt-3 p-3 bg-white/60 rounded-xl border border-orange-100 text-xs sm:text-sm">
//                         <div className="flex items-center gap-2 mb-1">
//                           <Info size={12} className="text-orange-500" />
//                           <span className="font-bold text-orange-600 uppercase tracking-wider">
//                             Booking Details
//                           </span>
//                         </div>
//                         <div className="text-gray-700 font-medium leading-relaxed">
//                           {b.final_address}
//                         </div>
//                       </div>
//                     )}

//                     {/* OTP / Pandit status */}
//                     {b.otp &&
//                       b.assignment_status !== "completed" &&
//                       (b.assignment_status === "accepted" ? (
//                         <div className="mt-3 inline-flex items-center gap-2.5 bg-green-50 border border-green-300 rounded-2xl px-3.5 py-2 shadow-sm">
//                           <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full shrink-0 shadow-sm">
//                             <span className="text-white text-[10px] font-black">
//                               ✓
//                             </span>
//                           </div>
//                           <div className="flex flex-col leading-tight">
//                             <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">
//                               Booking Accepted
//                             </span>
//                             <span className="text-[13px] font-black text-green-700 tracking-tight">
//                               {b.pandit_name
//                                 ? `Pandit: ${b.pandit_name}`
//                                 : "Pandit assigned"}
//                             </span>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="mt-3 inline-flex items-center gap-2.5 bg-orange-50 border border-orange-300 rounded-2xl px-3.5 py-2 shadow-sm">
//                           <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shrink-0 shadow-sm">
//                             <span className="text-white text-[10px] font-black">
//                               🔐
//                             </span>
//                           </div>
//                           <div className="flex flex-col leading-tight">
//                             <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
//                               Entry OTP
//                             </span>
//                             <span className="text-[15px] font-black text-orange-700 tracking-[0.2em]">
//                               {b.otp}
//                             </span>
//                           </div>
//                         </div>
//                       ))}

//                     {/* ── MOBILE bottom row ── */}
//                     <div className="mt-4 flex items-center justify-between gap-2 md:hidden">
//                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0">
//                         ID:{" "}
//                         <span className="text-orange-600">{b.bookingId}</span>
//                       </p>
//                       <div className="flex items-center gap-2 shrink-0">
//                         <div
//                           className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                             b.assignment_status === "pending"
//                               ? "bg-orange-100 text-orange-600 border border-orange-200"
//                               : b.assignment_status === "declined"
//                                 ? "text-red-500 bg-red-100 border border-red-200"
//                                 : b.assignment_status === "completed"
//                                   ? "bg-green-100 text-green-600 border border-green-200"
//                                   : "bg-blue-100 text-blue-600 border border-blue-200"
//                           }`}
//                         >
//                           {b.assignment_status}
//                         </div>
//                         <CancelButton
//                           booking={b}
//                           isExpired={isEventExpired}
//                           isCompleted={isCompleted}
//                           size="sm"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* ── DESKTOP right panel ── */}
//                   <div className="hidden md:flex flex-col justify-center items-end border-l border-gray-100 pl-6 min-w-[155px]">
//                     <p className="mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
//                       ID:{" "}
//                       <span className="ml-1 text-orange-600">
//                         {b.bookingId}
//                       </span>
//                     </p>
//                     <div
//                       className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
//                         b.assignment_status === "pending"
//                           ? "bg-orange-100 text-orange-600 border border-orange-200"
//                           : b.assignment_status === "declined"
//                             ? "text-red-500 bg-red-100 border border-red-200"
//                             : b.assignment_status === "completed"
//                               ? "bg-green-100 text-green-600 border border-green-200"
//                               : "bg-blue-100 text-blue-600 border border-blue-200"
//                       }`}
//                     >
//                       {b.assignment_status}
//                     </div>
//                     <div className="mt-3">
//                       <CancelButton
//                         booking={b}
//                         isExpired={isEventExpired}
//                         isCompleted={isCompleted}
//                         size="md"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyBookings;
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
} from "lucide-react";

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

  // ── New States for Tabs & Search ──
  const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "completed"
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
        const response = await fetch(`${API_BASE_URL}/puja/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleCancelBooking = async (bookingId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${API_BASE_URL}/puja/cancel-booking/${bookingId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setBookings(bookings.filter((b) => b.id !== bookingId));
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

  // ── Reusable Cancel Button with Tooltip ──
  const CancelButton = ({ booking, isExpired, isCompleted, size = "md" }) => {
    const isDisabled = isExpired || isCompleted;

    const tooltipText = isCompleted
      ? "Puja completed, cannot cancel"
      : "Puja date & time expired, cannot cancel";

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
          className={`${baseClass} ${
            isDisabled
              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              : "text-red-500 border-red-200 hover:bg-red-50 active:scale-95 cursor-pointer"
          }`}
        >
          <Trash2 size={size === "sm" ? 11 : 12} />
          {size === "sm" ? "Cancel" : "Cancel Booking"}
        </button>

        {isDisabled && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-gray-800 text-white text-[11px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
              {tooltipText}
            </div>
            <div className="w-2 h-2 bg-gray-800 rotate-45 mx-auto -mt-1" />
          </div>
        )}
      </div>
    );
  };

  // ── Filter logic ──
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = b.preferred_date.split("T")[0];
    const time24 = get24HourTime(b.preferred_time);
    const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);
    const isCompleted = b.assignment_status === "completed";
    const isPast = mergedDateTime < new Date();

    // Tab filter
    const tabMatch =
      activeTab === "completed" ? isCompleted : !isCompleted && !isPast;

    // Search filter
    const searchMatch =
      searchQuery === "" ||
      b.puja_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.final_address?.toLowerCase().includes(searchQuery.toLowerCase());

    return tabMatch && searchMatch;
  });

  if (loading)
    return (
      <div className="text-center py-20 text-orange-600 font-bold">
        Loading Bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 sm:p-6">
      {/* ── CONFIRMATION MODAL ── */}
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

      {/* ── ALERT MESSAGE ── */}
      {errorMsg && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-bounce text-center min-w-[300px]">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border-2 border-white ${
              errorMsg.includes("successfully")
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

      <div className="max-w-6xl mx-auto">
        {/* ── Header ── */}
        <h2 className="text-4xl font-serif text-[#3b2a1a] mb-2">
          My Sacred <span className="text-orange-500 italic">Bookings</span>
        </h2>
        <p className="text-base text-gray-700 mb-6">
          Track and manage your puja bookings.
        </p>

        {/* ── Tabs & Search Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-orange-100 w-fit">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "upcoming"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "completed"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, or location..."
              className="w-full pl-12 pr-10 py-3 bg-white border border-orange-200 rounded-2xl text-sm focus:outline-none focus:border-orange-400 transition-all shadow-sm"
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

        {/* ── Bookings List ── */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl text-center shadow-sm">
            <p className="text-gray-500 font-medium">
              {searchQuery
                ? "No bookings found matching your search."
                : activeTab === "completed"
                  ? "No completed bookings yet."
                  : "No upcoming bookings."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const isTemplePuja = ["temple_puja", "pind_dan"].includes(
                b.puja_type,
              );
              const bookingDate = b.preferred_date.split("T")[0];
              const time24 = get24HourTime(b.preferred_time);
              const mergedDateTime = new Date(`${bookingDate}T${time24}:00`);

              const isEventExpired = mergedDateTime < new Date();
              const isCompleted = b.assignment_status === "completed";

              return (
                <div
                  key={b.id}
                  className="relative overflow-visible bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-orange-300 transition-all hover:shadow-md flex flex-col md:flex-row md:items-stretch gap-4 sm:gap-6"
                >
                  {/* Puja type badge */}
                  <div
                    className={`absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest text-white z-10 ${
                      isTemplePuja ? "bg-orange-500" : "bg-blue-500"
                    }`}
                  >
                    {isTemplePuja ? "Temple Ceremony" : "Home Ritual"}
                  </div>

                  {/* Image */}
                  <div
                    className={`w-full h-48 md:w-40 shrink-0 overflow-hidden rounded-2xl ${
                      isTemplePuja ? "md:h-40" : "md:h-32"
                    }`}
                  >
                    <img
                      src={`${API_BASE_URL}/uploads/${b.image_url}`}
                      className="w-full h-full object-cover rounded-2xl shadow-sm"
                      alt={b.puja_name}
                    />
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2 pr-24">
                      {b.puja_name}
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={13}
                          className="text-orange-500 shrink-0"
                        />
                        {new Date(b.preferred_date).toLocaleDateString("en-IN")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-orange-500 shrink-0" />
                        {b.preferred_time}
                      </div>
                      <div className="flex items-start gap-2 col-span-2">
                        <MapPin
                          size={13}
                          className="text-orange-500 shrink-0 mt-0.5"
                        />
                        <span className="italic text-gray-500 leading-tight text-[12px] sm:text-sm">
                          {b.final_address}
                        </span>
                      </div>
                    </div>

                    {/* Samagri Kit Badge */}
                    {b.samagrikit === 1 && (
                      <div className="mt-3">
                        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-2xl px-3.5 py-2 shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shrink-0 shadow-sm">
                            <ShoppingBag size={12} className="text-white" />
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                              ✔ Added On
                            </span>
                            <span className="text-[13px] font-black text-emerald-800 tracking-tight">
                              Samagri Kit
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Temple booking details */}
                    {isTemplePuja && (
                      <div className="mt-3 p-3 bg-white/60 rounded-xl border border-orange-100 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Info size={12} className="text-orange-500" />
                          <span className="font-bold text-orange-600 uppercase tracking-wider">
                            Booking Details
                          </span>
                        </div>
                        <div className="text-gray-700 font-medium leading-relaxed">
                          {b.final_address}
                        </div>
                      </div>
                    )}

                    {/* OTP / Pandit status */}
                    {b.otp &&
                      b.assignment_status !== "completed" &&
                      (b.assignment_status === "accepted" ? (
                        <div className="mt-3 inline-flex items-center gap-2.5 bg-green-50 border border-green-300 rounded-2xl px-3.5 py-2 shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full shrink-0 shadow-sm">
                            <span className="text-white text-[10px] font-black">
                              ✓
                            </span>
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">
                              Booking Accepted
                            </span>
                            <span className="text-[13px] font-black text-green-700 tracking-tight">
                              {b.pandit_name
                                ? `Pandit: ${b.pandit_name}`
                                : "Pandit assigned"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 inline-flex items-center gap-2.5 bg-orange-50 border border-orange-300 rounded-2xl px-3.5 py-2 shadow-sm">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shrink-0 shadow-sm">
                            <span className="text-white text-[10px] font-black">
                              🔐
                            </span>
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest">
                              Entry OTP
                            </span>
                            <span className="text-[15px] font-black text-orange-700 tracking-[0.2em]">
                              {b.otp}
                            </span>
                          </div>
                        </div>
                      ))}

                    {/* ── MOBILE bottom row ── */}
                    <div className="mt-4 flex items-center justify-between gap-2 md:hidden">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0">
                        ID:{" "}
                        <span className="text-orange-600">{b.bookingId}</span>
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <div
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            b.assignment_status === "pending"
                              ? "bg-orange-100 text-orange-600 border border-orange-200"
                              : b.assignment_status === "declined"
                                ? "text-red-500 bg-red-100 border border-red-200"
                                : b.assignment_status === "completed"
                                  ? "bg-green-100 text-green-600 border border-green-200"
                                  : "bg-blue-100 text-blue-600 border border-blue-200"
                          }`}
                        >
                          {b.assignment_status}
                        </div>
                        <CancelButton
                          booking={b}
                          isExpired={isEventExpired}
                          isCompleted={isCompleted}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── DESKTOP right panel ── */}
                  <div className="hidden md:flex flex-col justify-center items-end border-l border-gray-100 pl-6 min-w-[155px]">
                    <p className="mb-3 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      ID:{" "}
                      <span className="ml-1 text-orange-600">
                        {b.bookingId}
                      </span>
                    </p>
                    <div
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        b.assignment_status === "pending"
                          ? "bg-orange-100 text-orange-600 border border-orange-200"
                          : b.assignment_status === "declined"
                            ? "text-red-500 bg-red-100 border border-red-200"
                            : b.assignment_status === "completed"
                              ? "bg-green-100 text-green-600 border border-green-200"
                              : "bg-blue-100 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {b.assignment_status}
                    </div>
                    <div className="mt-3">
                      <CancelButton
                        booking={b}
                        isExpired={isEventExpired}
                        isCompleted={isCompleted}
                        size="md"
                      />
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
