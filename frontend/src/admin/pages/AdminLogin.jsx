import React, { useState } from "react";
import { ShieldCheck, Lock, Loader2, Phone, Eye, EyeOff, Mail } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { COUNTRY_CODES } from "../../utils/countryCodes";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AdminLogin = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const isEmail = mobileNumber.includes("@");
    if (!isEmail && mobileNumber.replace(/\D/g, "").length < 7) {
      setError("Please enter a valid mobile number or email.");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/login`, {
        phone: isEmail ? mobileNumber : mobileNumber.replace(/\D/g, ""),
        country_code: isEmail ? null : countryCode,
        password: password,
      });

      if (response.status === 200) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminRole", response.data.role);
        navigate("/admin/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Admin access denied or Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans relative">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "25px 25px",
        }}
      ></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-[#1e293b]/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-2xl shadow-lg shadow-orange-600/20">
              <ShieldCheck size={38} className="text-white" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin Command Center
            </h1>
            <p className="text-slate-400 text-[11px] uppercase tracking-[0.2em] mt-1 font-semibold">
              Authorized Access Only
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-xl">
               <p className="text-red-400 text-xs font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-300 text-xs font-bold uppercase ml-1 tracking-widest">
                Admin {mobileNumber.includes("@") ? "Email" : "Mobile"}
              </label>
              <div className="flex bg-[#0f172a]/50 border border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-orange-500 transition-all">
                {!mobileNumber.includes("@") && mobileNumber.length > 0 && /^\d+$/.test(mobileNumber) && (
                  <select
                    className="bg-transparent text-slate-400 font-bold border-r border-slate-700 px-3 outline-none cursor-pointer text-sm w-[100px]"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.isoCode} value={c.code} className="bg-[#1e293b]">{c.isoCode} ({c.code})</option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  disabled={loading}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Email or Phone"
                  className="w-full bg-transparent text-white px-4 py-4 focus:outline-none text-lg tracking-wider disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-xs font-bold uppercase ml-1 tracking-widest">
                Password
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 border-r border-slate-700 pr-3">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0f172a]/50 border border-slate-700 text-white rounded-xl pl-16 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-lg tracking-wider disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={mobileNumber.length < 3 || password.length < 6 || loading}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                ${
                  !loading
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-600/25 hover:opacity-90 active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Lock size={18} />
              )}
              {loading ? "Authenticating..." : "Verify Admin Access"}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-700/50">
            <p className="text-center text-slate-600 text-[10px] uppercase tracking-widest leading-relaxed">
              System Protected by 256-bit Encryption
              <br />
              Unauthorized entry is strictly prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
