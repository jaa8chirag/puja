import React, { useState, useEffect } from "react";
import { ChevronDown, CheckCircle, X } from "lucide-react";

/**
 * CouponSelector Component
 * Handles coupon input, validation, and public coupon dropdown.
 */
const CouponSelector = ({ 
  couponInput, 
  setCouponInput, 
  appliedCoupon, 
  handleApplyCoupon, 
  removeCoupon, 
  isApplying, 
  couponError, 
  publicCoupons = [],
  isMobile = false
}) => {
  const [showPublic, setShowPublic] = useState(false);

  if (appliedCoupon) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-2xl ${isMobile ? 'p-3' : 'p-4'} flex items-center justify-between group animate-in fade-in zoom-in duration-300`}>
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-2 rounded-lg text-white shadow-sm ring-4 ring-green-100">
            <CheckCircle size={isMobile ? 16 : 18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-green-700 uppercase tracking-[0.1em]">Coupon Applied</p>
            <p className={`${isMobile ? 'text-sm' : 'text-[15px]'} font-black text-green-800 leading-none mt-1`}>
              {appliedCoupon.code} (-{appliedCoupon.discount_percentage}%)
            </p>
          </div>
        </div>
        <button 
          onClick={removeCoupon} 
          className="text-slate-400 hover:text-red-500 hover:bg-white p-2 rounded-full transition-all hover:shadow-sm"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!isMobile && (
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-1 mb-1">
          Have a Coupon?
        </label>
      )}
      <div className="flex gap-2 w-full relative">
        <input 
          type="text" 
          placeholder="PROMO CODE"
          value={couponInput}
          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
          className={`w-0 flex-1 bg-gray-50 border border-orange-100 rounded-xl px-3 py-2 ${isMobile ? 'text-[12px]' : 'text-xs md:text-sm'} font-bold uppercase focus:outline-none focus:border-orange-500 transition-all min-w-0`}
        />
        
        {publicCoupons.length > 0 && (
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowPublic(!showPublic)}
              className={`p-2 border border-orange-100 bg-white rounded-xl text-orange-600 hover:bg-orange-50 transition-all active:scale-95 ${showPublic ? 'bg-orange-50' : ''}`}
              title="Available Offers"
            >
              <ChevronDown size={isMobile ? 16 : 18} />
            </button>
            
            {showPublic && (
              <div className={`absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-orange-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}>
                <div className="p-2 border-b border-orange-50 bg-orange-50/30">
                  <p className="text-[10px] font-black text-orange-800 uppercase tracking-widest text-center">Best Offers</p>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {publicCoupons.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setCouponInput(c.code);
                        setShowPublic(false);
                      }}
                      className="w-full p-3 text-left hover:bg-orange-50 active:bg-orange-100 transition-colors border-b border-orange-50 last:border-0 group"
                    >
                      <p className="text-xs font-black text-gray-900 group-hover:text-orange-600 truncate">{c.code}</p>
                      <p className="text-[10px] font-bold text-green-600">SAVE {c.discount_percentage}% OFF</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <button 
          type="button"
          onClick={handleApplyCoupon}
          disabled={isApplying || !couponInput}
          className={`shrink-0 bg-orange-600 text-white px-4 py-2 rounded-xl ${isMobile ? 'text-[12px]' : 'text-xs md:text-sm'} font-black uppercase disabled:opacity-50 hover:bg-orange-700 transition-all shadow-md active:scale-95`}
        >
          {isApplying ? "..." : "Apply"}
        </button>
      </div>
      {couponError && (
        <p className="text-[10px] text-red-500 font-bold ml-1 uppercase tracking-wider">
          {couponError}
        </p>
      )}
    </div>
  );
};

export default CouponSelector;
