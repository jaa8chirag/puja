import React from "react";
import { BoltIcon } from "@heroicons/react/24/solid";

const RecentBookings = ({ bookings = [] }) => {
  const statusConfig = {
    accepted: { badge: "bg-blue-500/20 text-blue-400", label: "confirmed" },
    confirmed: { badge: "bg-blue-500/20 text-blue-400", label: "confirmed" },
    pending: { badge: "bg-amber-500/20 text-amber-400", label: "pending" },
    completed: { badge: "bg-green-500/20 text-green-400", label: "completed" },
    declined: { badge: "bg-red-500/20 text-red-400", label: "declined" },
    cancelled: { badge: "bg-red-500/20 text-red-400", label: "cancelled" },
    in_progress: {
      badge: "bg-purple-500/20 text-purple-400",
      label: "in_progress",
    },
  };

  return (
    <div className="bg-[#161b27] border border-white/[0.06] rounded-xl p-5 font-sans">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">📅</span>
        <span className="text-gray-50 font-bold text-base">
          Recent Bookings
        </span>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {bookings.length === 0 ? (
          <p className="text-gray-400 text-sm py-4">
            No recent bookings found.
          </p>
        ) : (
          bookings.map((b, index) => {
            const formattedDate = new Date(b.created_at).toLocaleString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            const rawStatus = b.status === "accepted" ? "confirmed" : b.status;
            const sc = statusConfig[rawStatus] || {
              badge: "bg-white/10 text-gray-400",
              label: rawStatus,
            };

            return (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#1c2233] rounded-xl px-4 py-3"
              >
                {/* Icon */}
                <div className="bg-[#2a3145] w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                  <BoltIcon className="w-4 h-4 text-slate-400" />
                </div>

                {/* User + Puja */}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 font-semibold text-sm truncate">
                    {b.user_name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">
                    {b.puja_name} • {formattedDate}
                  </p>
                </div>

                {/* Price + Pandit column */}
                <div className="flex flex-col items-end shrink-0 w-32">
                  <span className="text-green-400 font-bold text-[15px]">
                    ₹{Number(b.price).toLocaleString("en-IN")}
                  </span>
                  {b.paid_amount > 0 && (
                    <span className="text-orange-400 font-bold text-[10px]">
                      Paid: ₹{Number(b.paid_amount).toLocaleString("en-IN")}
                    </span>
                  )}
                  <span className="text-slate-400 text-xs mt-0.5 truncate max-w-full">
                    {b.pandit_name || ""}
                  </span>
                </div>

                {/* Badge column */}
                <div className="shrink-0 w-24 flex justify-end">
                  <span
                    className={`text-[11px] px-3 py-1 rounded-full font-semibold ${sc.badge}`}
                  >
                    {sc.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentBookings;
