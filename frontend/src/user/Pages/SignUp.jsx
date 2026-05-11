import { useState } from 'react';
import { ArrowLeft, User, Mail, Loader2, Lock, Smartphone, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../../utils/countryCodes';

const SignUp = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: '',
        gotra: '',
        email: '',
        phone: '',
        country_code: '+91',
        password: '',
        confirmPassword: '',
        role: 'user',
        referralCode: ''
    });

    const navigate = useNavigate();

    const isStep1Valid = formData.name.trim().length >= 3;

    // Password requirement checks
    const pwChecks = {
      length: formData.password.length >= 6,
      match: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
    };
    const isStep2Valid = formData.phone.length >= 7 && formData.email.trim() !== '' && pwChecks.length && pwChecks.match;

    const handleRegister = async () => {
        if (!isStep2Valid) {
            if (formData.phone.length < 7) setError("Please enter a valid phone number.");
            else if (formData.email.trim() === '') setError("Email is required for all users.");
            else if (!pwChecks.length) setError("Password must be at least 6 characters.");
            else if (!pwChecks.match) setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/user/signup`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                navigate('/');
            } else {
                setError(data.message || "Registration failed.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#FFFCF5] font-sans flex flex-col items-center px-4">

            {/* Header: Back Button & Logo */}
            <div className="w-full max-w-xl pt-6 pb-4 flex flex-col items-center relative">
                <Link to="/" className="absolute left-0 top-6 flex items-center gap-1 text-gray-500 hover:text-orange-600 transition-colors text-xs font-bold">
                    <ArrowLeft size={14} /> HOME
                </Link>

                <div className="flex flex-col items-center mt-6">
                    <img
                        src="/img/download2.png"
                        alt="logo"
                        className="w-12 h-12 md:w-16 md:h-16 mb-2"
                    />
                    <h1 className="text-xl md:text-3xl font-serif font-bold text-gray-800">Join Sri Vedic Puja</h1>
                    <p className="text-[11px] md:text-sm text-gray-400 mt-1">Begin your spiritual journey with us</p>
                </div>
            </div>

            <div className="w-full max-w-xl mx-auto m-8 text-center">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
                            ${step === 1 ? "bg-orange-500 text-white shadow-lg scale-110" : "bg-orange-100 text-orange-500"}`}>
                            1
                        </div>
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${step === 1 ? "text-orange-600" : "text-gray-400"}`}>Profile</span>
                    </div>
                    <div className="w-16 h-0.5 bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all
                            ${step === 2 ? "bg-orange-500 text-white shadow-lg scale-110" : "bg-gray-200 text-gray-400"}`}>
                            2
                        </div>
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${step === 2 ? "text-orange-600" : "text-gray-400"}`}>Security</span>
                    </div>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="w-full max-w-xl pb-10">
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 p-5 md:p-12">

                    {error && <p className="mb-6 text-red-500 text-center text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}

                    {/* STEP 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in duration-500">
                            <div className="text-center mb-6">
                                <h2 className="text-lg md:text-2xl font-serif font-bold text-gray-800">Tell us about yourself</h2>
                                <p className="text-gray-400 text-xs mt-1">Personalize your Puja Sankalp</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <User size={12} className="text-[#E79A37]" /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <span className="text-sm">ॐ</span> Your Gotra
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Kashyap, Vatsa"
                                        className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium"
                                        value={formData.gotra}
                                        onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-400 italic">Gotra is essential for Puja rituals</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        🎟️ Referral Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter Referral Code"
                                        className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium"
                                        value={formData.referralCode}
                                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="w-full py-4 mt-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-100 active:scale-[0.98] transition-all disabled:opacity-50 h-14 uppercase tracking-widest text-xs"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Security & Contact */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-lg md:text-2xl font-serif font-bold text-gray-800">Security & Contact</h2>
                                <p className="text-gray-400 text-xs mt-1">Set your password and phone number</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Smartphone size={12} className="text-[#E79A37]" /> Mobile Number
                                    </label>
                                    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#FFB347] transition-all">
                                        <select
                                            className="bg-gray-50 px-2 py-4 text-gray-700 border-r border-gray-200 font-bold text-sm outline-none cursor-pointer w-[100px]"
                                            value={formData.country_code}
                                            onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                        >
                                            {COUNTRY_CODES.map(c => (
                                                <option key={c.isoCode} value={c.code}>{c.isoCode} ({c.code})</option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-4 outline-none text-sm text-gray-700 bg-[#FFFCF5]/50 font-medium"
                                            placeholder="Phone Number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Mail size={12} className="text-[#E79A37]" /> Your Email
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="yourname@gmail.com"
                                        className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Lock size={12} className="text-[#E79A37]" /> Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium pr-10"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                            <Lock size={12} className="text-[#E79A37]" /> Confirm
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="••••••••"
                                                className="w-full px-4 py-4 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 font-medium pr-10"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Requirements - Real-time Checklist */}
                                {formData.password.length > 0 && (
                                    <div className="bg-[#FFFCF5] border border-orange-100 rounded-xl p-3 space-y-1.5">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password Requirements</p>
                                        {[
                                            { ok: pwChecks.length, label: "At least 6 characters" },
                                            { ok: pwChecks.match, label: "Passwords match" },
                                        ].map((rule, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${rule.ok ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                                                    {rule.ok ? "✓" : ""}
                                                </div>
                                                <span className={`text-[11px] font-medium ${rule.ok ? "text-green-700" : "text-gray-400"}`}>{rule.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading || !isStep2Valid}
                                    className="w-full py-4 mt-4 bg-orange-500 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50 h-14 uppercase tracking-widest text-xs"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Complete Registration"}
                                </button>

                                <button onClick={() => setStep(1)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors">Back to Profile</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-8">
                    <p className="text-gray-400 text-xs font-medium">
                        Already have an account? <Link to="/signin" className="text-orange-600 font-bold hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;