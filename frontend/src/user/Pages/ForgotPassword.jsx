import React, { useState } from "react";
import { ArrowLeft, Loader2, Mail, Key, Lock, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Code & New Password
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
      } else {
        setError(data.message || "Failed to send reset code.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetCode.length !== 6) {
      setError("Enter 6-digit reset code");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resetCode, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/signin"), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FFFCF5] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl border border-orange-50 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm mb-8">Your password has been successfully updated. Redirecting you to sign in...</p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full animate-progress-shrink"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF5] flex flex-col md:flex-row font-sans">
      <div className="w-full md:w-[50%] p-8 md:p-16 flex flex-col justify-center items-center">
        <div className="max-w-md w-full">
          <Link to="/signin" className="flex items-center gap-2 text-gray-500 hover:text-orange-600 transition-colors mb-12 text-sm font-bold group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Sign In
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <img src="/img/download2.png" alt="logo" className="w-12 h-12 rounded-xl" />
            <div>
              <h1 className="text-xl font-serif font-bold text-gray-800">Sri Vedic Puja</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Recovery Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
              {step === 1 ? "Forgot Password?" : "Reset Password"}
            </h2>
            <p className="text-gray-500 text-sm">
              {step === 1 
                ? "Enter your registered email address to receive a reset code." 
                : "Enter the code we sent and set your new password."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
               <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={14} className="text-orange-500" /> Email Address
                </label>
                <div className="flex border border-gray-300 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-orange-500 transition-all">
                  <input
                    type="email"
                    className="w-full px-4 py-4 outline-none text-gray-700 font-bold"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!email.includes("@") || isLoading}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 h-14 uppercase tracking-widest text-xs"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} className="text-orange-500" /> 6-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl outline-none focus:border-orange-500 transition-all text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Lock size={14} className="text-orange-500" /> New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl outline-none focus:border-orange-500 transition-all text-sm font-bold"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Lock size={14} className="text-orange-500" /> Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-4 border border-gray-300 rounded-2xl outline-none focus:border-orange-500 transition-all text-sm font-bold"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || resetCode.length < 6 || newPassword.length < 6}
                className="w-full py-4 bg-[#2D1B0B] text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center h-14 uppercase tracking-widest text-xs"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
              </button>
              
              <button onClick={() => setStep(1)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors">Change Email Address</button>
            </form>
          )}
        </div>
      </div>

      <div className="hidden md:flex w-[50%] bg-gradient-to-br from-orange-400 to-orange-600 items-center justify-center p-12 text-center text-white relative overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] text-[400px] opacity-10 font-serif rotate-12">ॐ</div>
         <div className="max-w-md z-10">
           <h2 className="text-4xl font-serif font-bold mb-6">Security & Trust</h2>
           <p className="text-white/80 text-lg leading-relaxed">
             We ensure your spiritual journey remains secure. Use the recovery portal to regain access to your sacred space.
           </p>
         </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
