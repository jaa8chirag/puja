import React, { useState } from "react";
import { ArrowLeft, Loader2, Lock, Phone, Eye, EyeOff, Mail, X, Smartphone } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { COUNTRY_CODES } from "../../utils/countryCodes";

const SignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Google Phone Modal States
  const [showGooglePhoneModal, setShowGooglePhoneModal] = useState(false);
  const [googlePhone, setGooglePhone] = useState("");
  const [googleCountryCode, setGoogleCountryCode] = useState("+91");
  const [googlePhoneError, setGooglePhoneError] = useState("");
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    const isEmail = phoneNumber.includes("@");
    if (!isEmail && phoneNumber.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid mobile number or email.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: isEmail ? phoneNumber : phoneNumber.replace(/\D/g, ""), 
          country_code: isEmail ? null : countryCode,
          password: password 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Call backend with Google token (and optional phone)
  const processGoogleLogin = async (accessToken, phone = null) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          idToken: accessToken, 
          phone: phone,
          country_code: phone ? googleCountryCode : null
        }),
      });
      const data = await response.json();

      if (data.needsPhone) {
        // Backend says phone is needed — show modal
        setPendingGoogleToken(accessToken);
        setShowGooglePhoneModal(true);
        setGooglePhone("");
        setGooglePhoneError("");
        return;
      }

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        setShowGooglePhoneModal(false);
        setPendingGoogleToken(null);
        navigate(from, { replace: true });
      } else {
        const errorMsg = data.message || (response.status === 503 ? "Server is currently unavailable (503). Please check if backend is running." : "Google authentication failed.");
        setError(errorMsg);
        console.error("Google Login Error Details:", data);
      }
    } catch (err) {
      setError("Network error during Google login.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // First try without phone — backend will decide if phone is needed
      await processGoogleLogin(tokenResponse.access_token);
    },
    onError: (error) => {
      console.error("Google Login Error:", error);
      setError("Google Login failed.");
    },
  });

  const handleSocialAuth = async (provider) => {
    if (provider === "Google") {
      loginWithGoogle();
    } else {
      alert(`${provider} authentication integration coming soon!`);
    }
  };

  // User submitted phone from modal — retry with phone
  const handleGooglePhoneContinue = async () => {
    if (googlePhone.replace(/\D/g, "").length < 7) {
      setGooglePhoneError("Please enter a valid mobile number.");
      return;
    }
    setGooglePhoneError("");
    setShowGooglePhoneModal(false);
    if (pendingGoogleToken) {
      await processGoogleLogin(pendingGoogleToken, googlePhone);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT SECTION Wrapper */}
      <div className="w-full md:w-[50%] bg-[#FFFCF5] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="max-w-md w-full flex flex-col mt-10">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors mb-12 text-sm self-start font-bold"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Header: Logo and Title */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/img/download2.png"
              alt="logo"
              className="w-12 h-12 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-800">
                Sri Vedic Puja
              </h1>
              <p className="text-xs text-gray-500">Your Faith Partner</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to manage your bookings and rituals
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
               <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                {phoneNumber.includes("@") ? <Mail size={14} className="text-orange-500" /> : <Phone size={14} className="text-orange-500" />} Email or Mobile Number
              </label>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-orange-500 transition-all">
                {(!phoneNumber.includes("@") && phoneNumber.length > 0 && /^\+?\d+$/.test(phoneNumber.replace(/\s/g, ""))) && (
                  <select
                    className="bg-gray-50 px-2 py-3 text-gray-700 border-r border-gray-100 font-bold text-sm outline-none cursor-pointer w-[100px]"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.isoCode} value={c.code}>{c.isoCode} ({c.code})</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  className="w-full px-4 py-3 outline-none text-gray-700 font-medium"
                  placeholder="Email or Mobile Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-orange-500" /> Password
              </label>
              <div className="relative flex border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm focus-within:border-orange-500 transition-all">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 outline-none text-gray-700 font-medium pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                 <Link to="/forgot-password" size={14} className="text-xs font-bold text-orange-600 hover:underline">Forgot Password?</Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={phoneNumber.length < 3 || password.length < 6 || isLoading}
              className="w-full py-4 bg-gradient-to-l from-[#f7c06f] to-[#e79a37] text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center disabled:grayscale disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#FFFCF5] text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => handleSocialAuth('Google')}
              className="flex items-center justify-center gap-3 py-4 border border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-all shadow-sm active:scale-95 w-full"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Continue with Google</span>
            </button>
          </div>

          <div className="text-center pt-8">
            <p className="text-sm text-gray-500">
              New to Sri Vedic Puja? <br />
              <Link
                to="/signup"
                className="text-orange-600 font-bold hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION: Branding (Orange Background) */}
      <div className="hidden md:flex w-[50%] bg-gradient-to-b from-[#FFA726] to-[#FB8C00] items-center justify-center p-12 text-center text-white relative">
        <div className="max-w-md">
          <div className="mb-6 opacity-40">
            <span className="text-[120px] font-serif leading-none">ॐ</span>
          </div>
          <h2 className="text-4xl font-serif font-bold mb-6">
            Sacred Rituals Made Simple
          </h2>
          <p className="text-white/90 text-lg leading-relaxed px-4">
            Book verified Pandits, get complete Samagri kits, and experience
            authentic pujas with fixed pricing.
          </p>
        </div>
      </div>

      {/* ═══ Google Phone Number Modal (only when needed) ═══ */}
      {showGooglePhoneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Smartphone size={20} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Mobile Number</h3>
                  <p className="text-[10px] text-gray-400 font-medium">One-time setup for your account</p>
                </div>
              </div>
              <button
                onClick={() => { setShowGooglePhoneModal(false); setPendingGoogleToken(null); }}
                className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Please enter your mobile number to complete your Google sign-in. This is a one-time step.
              </p>

              {googlePhoneError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-xs font-bold">{googlePhoneError}</p>
                </div>
              )}

              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-orange-500 transition-all">
                <select
                  className="bg-gray-50 px-2 py-3.5 text-gray-700 border-r border-gray-200 font-bold text-sm outline-none cursor-pointer w-[100px]"
                  value={googleCountryCode}
                  onChange={(e) => setGoogleCountryCode(e.target.value)}
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.isoCode} value={c.code} className="bg-[#1e293b]">{c.isoCode} ({c.code})</option>
                  ))}
                </select>
                <input
                  type="tel"
                  className="w-full px-4 py-3 outline-none text-gray-700 font-medium"
                  placeholder="Phone Number"
                  value={googlePhone}
                  onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </div>

              <button
                onClick={handleGooglePhoneContinue}
                disabled={googlePhone.length < 7 || isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Complete Sign-In
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;
