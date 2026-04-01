import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center px-5 py-3 border-t border-slate-800 bg-[#0f172a]">
      {/* Left: Page Info */}
      <span className="text-[11px] text-slate-500">
        Page <b className="text-slate-300">{currentPage}</b> /{" "}
        <b className="text-slate-300">{totalPages}</b>
      </span>

      {/* Right: Pagination Buttons */}
      <div className="flex gap-1">
        {/* Previous Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-0.5 px-2.5 py-1 text-[11px] font-semibold border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a2744] transition bg-[#131e32] text-slate-300"
        >
          <ChevronLeft size={12} /> Prev
        </button>

        {/* Page Number Buttons */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const pg =
            totalPages <= 5
              ? i + 1
              : currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
          return (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`w-7 h-7 text-[11px] font-bold rounded-lg transition ${
                currentPage === pg
                  ? "bg-orange-500 text-white shadow-md shadow-orange-900"
                  : "border border-slate-700 hover:bg-[#1a2744] bg-[#131e32] text-slate-400"
              }`}
            >
              {pg}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-0.5 px-2.5 py-1 text-[11px] font-semibold border border-slate-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1a2744] transition bg-[#131e32] text-slate-300"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
