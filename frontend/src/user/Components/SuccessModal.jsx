import React from 'react';
import { CheckCircle, X, Sparkles, Calendar, ArrowRight } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, message, title = "Booking Successful!" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_70px_-15px_rgba(234,88,12,0.3)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-orange-100">
        <div className="relative p-10 flex flex-col items-center text-center">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-50 to-transparent -z-10" />
          <Sparkles className="absolute top-8 left-8 text-orange-300 animate-pulse" size={20} />
          <Sparkles className="absolute top-12 right-12 text-orange-300 animate-pulse delay-700" size={16} />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
          >
            <X size={20} />
          </button>

          {/* Success Icon with Glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-20 rounded-full animate-pulse" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-200">
              <CheckCircle size={48} className="text-white" strokeWidth={3} />
            </div>
          </div>

          {/* Text Content */}
          <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            {title}
          </h3>
          <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-6">
            Booking Confirmed
          </p>
          
          <div className="bg-orange-50 rounded-2xl p-4 mb-8 w-full border border-orange-100/50">
            <p className="text-orange-900 font-semibold text-[15px] leading-relaxed">
              {message || "Your booking has been successfully confirmed. Our Pandit Ji will contact you shortly."}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="group w-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-orange-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span className="uppercase tracking-[0.2em] text-sm">View My Bookings</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            🙏 Thank you for choosing Sri Vedic Puja
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
