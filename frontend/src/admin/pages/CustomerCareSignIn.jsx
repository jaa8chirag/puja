import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const CustomerCareSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    role: 'customerCare',
  });

  const handleChange = (e) => {
    let value = e.target.value;
    // We allow email or phone for login
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await axios.post(`${API_BASE_URL}/user/login`, formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        setMessage({ type: 'success', text: 'Success! Redirecting...' });
        window.location.href = '/customer-care/dashboard';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Invalid Credentials',
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

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Email or Phone</label>
              <div className="flex mt-1">
                <input
                  type="text"
                  name="phone"
                  required
                  onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
                  placeholder="Enter email or phone number"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Login & Enter Portal'}
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