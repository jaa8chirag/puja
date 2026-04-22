import React, { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const SignIn = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleAction = async () => {
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit number");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/login-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await response.json();
      if (response.ok) setIsOtpStep(true);
      else setError(data.message || "Account not found.");
    } catch (err) {
      setError("Network error. Please try again.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (otp.length !== 6) {
      setError("Please enter 6-digit code.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber, otp: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Incorrect OTP.");
      }
    } catch (err) {
      setError("Verification failed.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* LEFT SECTION Wrapper */}
      <div className="w-full md:w-[50%] bg-[#FFFCF5] p-8 md:p-16 flex flex-col justify-center items-center">
        {/* Inner Container: Iske andar Link daalne se alignment perfect ho jayegi */}
        <div className="max-w-md w-full flex flex-col mt-10">
          {/* Back to Home - Ab ye text ke bilkul line mein upar rahega */}
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors mb-12 text-sm self-start"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          {/* Header: Logo and Title */}
          <div className="flex items-center gap-3 mb-12">
            <img
              src="/img/download.jpg"
              alt="logo"
              className="w-12 h-12 bg-[#FFB347] p-2 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-800">
                Sri Vedic Puja
              </h1>
              <p className="text-xs text-gray-500">Your Faith Partner</p>
            </div>
          </div>

          {error && (
            <p className="mb-4 text-red-500 text-sm font-medium">{error}</p>
          )}

          {!isOtpStep ? (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  Enter Your Phone Number
                </h2>
                <p className="text-gray-500 text-sm">
                  We'll send you an OTP to verify your number
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-orange-500">📞</span> Mobile Number
                  </label>
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                    <span className="bg-gray-200 px-4 py-3 text-gray-500 border-r border-gray-100">
                      +91
                    </span>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 outline-none text-gray-700"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={handleAction}
                  disabled={phoneNumber.length < 10 || isLoading}
                  className="w-full py-4 bg-gradient-to-l from-[#f7c06f] to-[#e79a37] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center disabled:grayscale disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Send OTP"
                  )}
                </button>
              </div>

              <div className="text-center pt-6">
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
          ) : (
            /* OTP VERIFICATION STEP */
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                {/* Font match with "Enter Your Phone Number" */}
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  Verify OTP
                </h2>
                <p className="text-gray-500 text-sm">
                  Enter the code sent to{" "}
                  <span className="text-orange-600 font-bold">
                    +91 {phoneNumber}
                  </span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  {/* Mobile Number label jaisa hi label */}
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <span className="text-orange-500">🔒</span> Verification
                    Code
                  </label>
                  {/* Input box design matched with Phone input */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full px-4 py-3 outline-none text-gray-700 text-center text-2xl font-bold tracking-[0.5em]"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </div>

                {/* Button matched with "Send OTP" button style */}
                <button
                  onClick={handleLogin}
                  disabled={otp.length < 6 || isLoading}
                  className="w-full py-4 bg-gradient-to-l from-[#f7c06f] to-[#e79a37] text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-all flex items-center justify-center disabled:grayscale disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>

                <button
                  onClick={() => setIsOtpStep(false)}
                  className="w-full text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-600 transition-colors"
                >
                  Edit Phone Number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: Branding (Orange Background) */}
      <div className="hidden md:flex w-[50%] bg-gradient-to-b from-[#FFA726] to-[#FB8C00] items-center justify-center p-12 text-center text-white relative">
        <div className="max-w-md">
          {/* Om Icon */}
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
    </div>
  );
};

export default SignIn;
