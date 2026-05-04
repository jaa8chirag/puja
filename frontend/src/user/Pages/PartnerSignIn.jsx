import { useState } from 'react';
import { Loader2, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const PartnerSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/login-request`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, role: 'pandit' })
      });
      if (res.ok) setIsOtpStep(true);
      else {
        const data = await res.json();
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally { setIsLoading(false); }
  };

  const handleVerifyLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/verify-otp`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otp })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/partner/dashboard');
      } else setError(data.message || "Invalid OTP");
    } catch (err) {
      setError("Verification failed.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] flex flex-col items-center justify-start pt-8 p-4 relative overflow-hidden font-sans">

      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-60" />

      {/* Container for Link and Card */}
      <div className="w-full max-w-lg z-10">

        {/* Properly Placed Back Link (Like Header style) */}
        <div className="flex justify-start mb-4">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors text-xs font-bold group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Website
          </Link>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[28px] shadow-[0_25px_80px_-10px_rgba(0,0,0,0.20)]
          border border-white/50 p-8 md:p-10 flex flex-col items-center">

          {/* Logo with custom src */}
          <div className="w-20 h-20 bg-white rounded-[24px] flex items-center justify-center shadow-lg shadow-orange-100 mb-6 overflow-hidden border border-orange-50">
            <img
              src="/img/download.jpg"
              alt="Sri Vedic Puja Logo"
              className="w-full h-full object-cover p-2"
            />
          </div>

          <h1 className="text-2xl font-serif font-bold text-[#4A3728] text-center">Pandit Partner Portal</h1>
          <p className="text-gray-400 text-[11px] text-center mt-2 mb-8 leading-relaxed px-4 uppercase tracking-wider font-bold">
            Join India's most trusted network of verified Pandits
          </p>

          {/* Verification Badge with Shield Icon */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 x-3 py-1.5 rounded-full uppercase tracking-wider ">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 px-3 py-1.5 rounded-full uppercase tracking-wide ">
              ★ 4.8 Rating
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full flex bg-[#F3F0EC] p-1.5 rounded-2xl mb-8">
            <button className="flex-1 py-3 text-sm font-bold rounded-xl bg-white text-gray-800 shadow-sm transition-all cursor-default">
              Sign In
            </button>
            <Link to="/partner-signup" className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 text-center transition-all">
              Register
            </Link>
          </div>

          {error && <p className="mb-4 text-red-500 text-[11px] font-bold bg-red-50 w-full p-3 rounded-xl border border-red-100 text-center">{error}</p>}

          {!isOtpStep ? (
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Registered Mobile</label>
                <div className="flex bg-[#F9F7F4] border border-[#EBE6DF] rounded-2xl overflow-hidden focus-within:border-orange-500 transition-all shadow-sm">
                  <span className="px-5 py-4 text-gray-400 font-bold border-r border-[#EBE6DF] text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    className="w-full px-4 py-4 bg-transparent outline-none text-gray-700 font-bold text-lg"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={phoneNumber.length < 10 || isLoading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Request OTP"}
              </button>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-in zoom-in-95 duration-500">
              <div className="space-y-2 text-center">
                <p className="text-xs text-gray-400 font-medium">Verification code sent to <span className="text-gray-800 font-bold">+91 {phoneNumber}</span></p>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full py-5 bg-[#F9F7F4] border border-[#EBE6DF] rounded-2xl text-center text-3xl font-bold tracking-[0.5em] focus:border-orange-500 outline-none transition-all shadow-sm"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                onClick={handleVerifyLogin}
                disabled={isLoading || otp.length < 6}
                className="w-full py-4 bg-[#2D1B0B] text-white font-bold rounded-2xl shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Sign In"}
              </button>
              <button onClick={() => setIsOtpStep(false)} className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-500">Use different number</button>
            </div>
          )}

          {/* Footer Text */}
          <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Sri Vedic Puja • Partner Protocol v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignIn;