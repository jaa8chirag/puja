import React, { useState, useEffect } from 'react';
import { Copy, Share2, Gift, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const HowItWorks = () => {
  const navigate = useNavigate();
  const tokenLocal = localStorage.getItem("token");
  const [referralCode, setReferralCode] = useState(tokenLocal ? "SRIVEDIC" : "SRIVEDIC5");
  const [copied, setCopied] = useState(false);
  const [referralPercent, setReferralPercent] = useState(10);

  useEffect(() => {
    const fetchProfile = async () => {
      if (tokenLocal) {
        try {
          const res = await fetch(`${API_BASE_URL}/user/get-profile`, {
            headers: { Authorization: `Bearer ${tokenLocal}` },
          });
          const data = await res.json();
          if (data?.user?.referral_code) {
            setReferralCode(data.user.referral_code);
          }
        } catch (err) {
          console.error("Referral fetch error:", err);
        }
      }
    };

    const fetchSettings = async () => {
      try {
        const refRes = await fetch(`${API_BASE_URL}/settings/referral_reward_referrer`);
        const refData = await refRes.json();
        
        if (refData.success) setReferralPercent(refData.value);
      } catch (err) {
        console.error("Settings fetch error:", err);
      }
    };

    fetchProfile();
    fetchSettings();
  }, [tokenLocal]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sri Vedic Puja - Refer & Earn',
        text: `Share your code with friends. Once they complete their first puja, you'll earn ${referralPercent}% off on your next booking! My referral code: ${referralCode}`,
        url: window.location.origin,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
        copyToClipboard();
        alert("Referral code copied to clipboard!");
    }
  };

  const steps = [
    {
      id: 1,
      title: "Choose Your Puja",
      desc: "Select from our curated list of authentic Vedic ceremonies."
    },
    {
      id: 2,
      title: "Book with E-Sankalp",
      desc: "Enter details for the sacred Sankalp. We handle all the Samagri."
    },
    {
      id: 3,
      title: "Experience Blessings",
      desc: "Our verified Pandit arrives with everything. No hidden costs."
    }
  ];

  return (
    <section className="bg-[#FFF4E1] max-w-4xl py-20 mx-auto px-6 font-sans">
      <div className="text-center mb-8 md:mb-20">
        
        {/* SECTION TITLE - Smaller & Tight */}
        <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#3b2a1a] mb-6 md:mb-16">
          How Sri Vedic Puja Works
        </h2>

        {/* STEPS GRID - Tight gap */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-16">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              {/* COMPACT ICON BOX */}
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md mb-4">
                {step.id}
              </div>
              <h3 className="text-lg font-bold text-[#3b2a1a] mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 max-w-[240px] leading-snug">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* REFERRAL CARD - Slim Profile */}
        <div className="max-w-4xl mx-auto bg-[#fff8ec] border border-orange-200 rounded-3xl p-5 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
                
                {/* Gift Icon - Smaller */}
                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
                    <Gift size={24} />
                </div>

                {/* Text Content - More compact */}
                <div className="flex-grow text-center md:text-left">
                    <h4 className="text-lg font-bold text-[#3b2a1a] flex items-center justify-center md:justify-start gap-2">
                        Share your code with friends. 🙏
                    </h4>
                    <p className="text-[13px] md:text-sm mt-1 text-gray-600 leading-snug">
                        Once they complete their first puja, you'll earn <span className="text-orange-600 font-black">{referralPercent}% off</span> on your next booking!
                    </p>
                    
                    <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] text-gray-400 font-medium">{tokenLocal ? "Your code:" : "Referral Code:"}</span>
                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg font-black text-[13px] tracking-widest border border-orange-100 shadow-sm">
                                {referralCode}
                            </span>
                        </div>
                        {tokenLocal && (
                            <button 
                                onClick={() => navigate("/profile")}
                                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 underline underline-offset-4 decoration-orange-300"
                            >
                                View My Rewards
                            </button>
                        )}
                    </div>
                </div>

                {/* Actions - Slimmer buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <button 
                        onClick={copyToClipboard}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            copied 
                            ? "bg-green-500 text-white shadow-green-100" 
                            : "bg-white border-2 border-orange-100 text-[#3b2a1a] hover:bg-orange-50 shadow-sm shadow-orange-50"
                        }`}
                    >
                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                        {copied ? "Copied!" : "Copy Code"}
                    </button>
                    <button 
                        onClick={handleShare}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;