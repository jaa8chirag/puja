import { useState } from 'react';
import { Loader2, ArrowLeft, ShieldCheck, Lock, Phone, Eye, EyeOff, Mail } from 'lucide-react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { COUNTRY_CODES } from '../../utils/countryCodes';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const PartnerSignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const isEmail = phoneNumber.includes("@");
    if (!isEmail && phoneNumber.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit mobile number or email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: isEmail ? phoneNumber : phoneNumber.replace(/\D/g, ""), 
          country_code: isEmail ? null : countryCode,
          password: password, 
          role: 'pandit' 
        })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        navigate('/partner/dashboard');
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F1] flex flex-col items-center justify-start pt-8 p-4 relative overflow-hidden font-sans">

      {/* Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-50 rounded-full blur-[120px] opacity-60" />

      <div className="w-full max-w-lg z-10">
        <div className="flex justify-start mb-4">
          <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors text-xs font-bold group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Website
          </Link>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-[28px] shadow-[0_25px_80px_-10px_rgba(0,0,0,0.15)]
          border border-white/50 p-8 md:p-10 flex flex-col items-center">

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

          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase tracking-wider ">
              <ShieldCheck size={12} strokeWidth={3} />
              Verified Partner
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

          {error && (
            <div className="mb-6 w-full p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
               <p className="text-red-700 text-[11px] font-bold uppercase">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 {phoneNumber.includes("@") ? <Mail size={12} /> : <Phone size={12} />} Registered {phoneNumber.includes("@") ? "Email" : "Mobile"}
               </label>
               <div className="flex bg-[#F9F7F4] border border-[#EBE6DF] rounded-2xl overflow-hidden focus-within:border-orange-500 transition-all shadow-sm">
                 {!phoneNumber.includes("@") && phoneNumber.length > 0 && /^\d+$/.test(phoneNumber) && (
                   <div className="bg-gray-50 px-4 py-4 text-gray-700 border-r border-[#EBE6DF] font-bold text-xs flex items-center">
                     +91
                   </div>
                 )}
                 <input
                   type="text"
                   className="w-full px-4 py-4 bg-transparent outline-none text-gray-700 font-bold text-lg"
                   placeholder="Email or Phone Number"
                   value={phoneNumber}
                   onChange={(e) => setPhoneNumber(e.target.value)}
                 />
               </div>
             </div>
 
             <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Lock size={12} /> Password
               </label>
               <div className="relative flex bg-[#F9F7F4] border border-[#EBE6DF] rounded-2xl overflow-hidden focus-within:border-orange-500 transition-all shadow-sm">
                 <input
                   type={showPassword ? "text" : "password"}
                   className="w-full px-5 py-4 bg-transparent outline-none text-gray-700 font-bold text-lg pr-12"
                   placeholder="••••••••"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                 >
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>
               <div className="flex justify-end pr-2">
                 <Link to="/forgot-password" size={14} className="text-[11px] font-bold text-orange-600 hover:underline">Forgot Password?</Link>
               </div>
             </div>

            <button
              type="submit"
              disabled={phoneNumber.length < 3 || password.length < 6 || isLoading}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-[0_10px_25px_-5px_rgba(249,115,22,0.4)] hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Sign In to Portal"}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-10 pt-6 border-t border-gray-100 w-full text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Sri Vedic Puja • Partner Protocol v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignIn;