import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const CustomerCareSignIn = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
    role: 'customerCare',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP (Login only)
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_BASE_URL}/customerCare/login-request`, {
        phone: formData.phone,
        role: formData.role,
      });
      if (response.status === 200) {
        setStep(2);
        setMessage({ type: 'success', text: 'OTP sent to your phone!' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/customerCare/verify-otp`, formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        setMessage({ type: 'success', text: 'Success! Redirecting...' });
        window.location.href = '/customerCare/dashboard';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Invalid OTP',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-slate-200 font-sans">
      <div className="max-w-md w-full bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-700/50">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Customer Care Portal</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Agent Login</p>
        </div>

        <div className="p-8">
          {message.text && (
            <div className={`p-3 rounded-lg mb-5 text-sm font-medium ${
              message.type === 'error'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={step === 1 ? handleRequestOTP : handleVerifyOTP} className="space-y-5">

            {/* Step 1: Phone Input */}
            {step === 1 && (
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Phone Number</label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 bg-[#334155] border border-r-0 border-slate-700 rounded-l-lg text-slate-400">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-r-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            )}

            {/* Step 2: OTP Input */}
            {step === 2 && (
              <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-500 flex justify-center mb-4">6-Digit Verification Code</label>
                  <input
                    type="text"
                    name="otp"
                    maxLength="6"
                    required
                    onChange={handleChange}
                    autoFocus
                    className="w-full bg-[#0f172a] border-2 border-blue-500 rounded-xl px-4 py-4 text-center text-3xl tracking-widest font-bold text-blue-400 focus:outline-none shadow-lg shadow-blue-500/10"
                    placeholder="000000"
                  />
                </div>
                <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-blue-400 uppercase font-bold">
                  Wrong number?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Enter Portal')}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest">
            Secured Customer Care Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCareSignIn;