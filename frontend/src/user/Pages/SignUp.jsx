import { useState } from 'react';
import { ArrowLeft, User, Mail, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const SignUp = () => {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: '',
        gotra: '',
        email: '',
        phone: '',
        otp: '',
        role: 'user',
        referralCode: ''
    });

    const navigate = useNavigate();

    const isStep1Valid = formData.name.trim().length >= 3;
    const isStep2Valid = formData.phone.length === 10;

    const handleSendOTP = async () => {
        if (!isStep2Valid) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/user/signup-request`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) setStep(3);
            else setError(data.message || "Failed to initiate request.");
        } catch (err) {
            setError("Network error. Please try again.");
        } finally { setIsLoading(false); }
    };

    const handleFinalVerify = async (e) => {
        if (e) e.preventDefault();
        if (formData.otp.length !== 6) {
            setError("Please enter 6-digit code.");
            return;
        }
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/user/signup-verify`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                navigate('/');
            } else {
                setError(data.message || "Incorrect OTP.");
            }
        } catch (error) {
            setError("Verification failed.");
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
                        src="/img/download.jpg"
                        alt="logo"
                        className="w-12 h-12 md:w-16 md:h-16 bg-orange-400 p-2 md:p-3 rounded-2xl mb-2 shadow-sm"
                    />
                    <h1 className="text-xl md:text-3xl font-serif font-bold text-gray-800">Join Sri Vedic Puja</h1>
                    <p className="text-[11px] md:text-sm text-gray-400 mt-1">Begin your spiritual journey with us</p>
                </div>
            </div>

            <div className="w-full max-w-xl mx-auto m-8 text-center">

                {/* Steps */}
                <div className="grid grid-cols-3 items-center">

                    {/* Step 1 */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold
        ${step === 1 ? "bg-orange-400 text-white shadow-lg" : "bg-gray-200 text-gray-600"}`}>
                            1
                        </div>
                        <span className={`mt-2 text-[10px] md:text-xs font-bold uppercase
        ${step === 1 ? "text-orange-400" : "text-gray-400"}`}>
                            Profile
                        </span>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold
        ${step === 2 ? "bg-orange-400 text-white shadow-lg" : "bg-gray-200 text-gray-600"}`}>
                            2
                        </div>
                        <span className={`mt-2 text-[10px] md:text-xs font-bold uppercase
        ${step === 2 ? "text-orange-400" : "text-gray-400"}`}>
                            Contact
                        </span>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold
        ${step === 3 ? "bg-orange-400 text-white shadow-lg" : "bg-gray-200 text-gray-600"}`}>
                            3
                        </div>
                        <span className={`mt-2 text-[10px] md:text-xs font-bold uppercase
        ${step === 3 ? "text-orange-400" : "text-gray-400"}`}>
                            Verify
                        </span>
                    </div>

                </div>

            </div>

            {/* Main Form Card - Darker Shadow applied here */}
            <div className="w-full max-w-xl pb-10">
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-100 p-5 md:p-12">

                    {error && <p className="mb-4 text-red-500 text-center text-xs font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

                    {/* STEP 1: Personal Info */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in duration-500">
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
                                        className="w-full px-4 py-3.5 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 placeholder:text-gray-300"
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
                                        className="w-full px-4 py-3.5 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 placeholder:text-gray-300"
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
                                        className="w-full px-4 py-3.5 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 placeholder:text-gray-300"
                                        value={formData.referralCode}
                                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                                    />
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!isStep1Valid}
                                    className="w-full py-4 mt-2 bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-100 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    Next Step
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Contact */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-lg md:text-2xl font-serif font-bold text-gray-800">Contact Details</h2>
                                <p className="text-gray-400 text-xs mt-1">Used for Puja updates & Booking</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase">Mobile Number</label>
                                    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#FFB347] transition-all">
                                        <span className="bg-gray-50 px-3 py-3.5 text-gray-500 border-r border-gray-200 font-bold text-sm">+91</span>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            className="w-full px-4 py-3.5 outline-none text-sm text-gray-700 bg-[#FFFCF5]/50"
                                            placeholder="00000 00000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                        <Mail size={12} className="text-[#E79A37]" /> Email <span className="text-[9px] lowercase font-normal opacity-60">(optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="yourname@gmail.com"
                                        className="w-full px-4 py-3.5 bg-[#FFFCF5]/50 border border-gray-200 rounded-xl outline-none focus:border-[#FFB347] transition-all text-sm text-gray-700 placeholder:text-gray-300"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleSendOTP}
                                    disabled={isLoading || !isStep2Valid}
                                    className="w-full py-4 mt-2 bg-orange-500 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
                                </button>

                                <button onClick={() => setStep(1)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Back to Profile</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: OTP Verify */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="text-center">
                                <h2 className="text-lg md:text-2xl font-serif font-bold text-gray-800">Verify OTP</h2>
                                <p className="text-gray-400 text-xs mt-1">Enter code sent to <span className="text-gray-700 font-bold">+91 {formData.phone}</span></p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    maxLength={6}
                                    className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.4em] focus:border-[#FFB347] outline-none transition-all bg-[#FFFCF5]/50"
                                    placeholder="000000"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                />

                                <button
                                    onClick={handleFinalVerify}
                                    disabled={isLoading || formData.otp.length !== 6}
                                    className="w-full py-4 mt-2 bg-[#2D1B0B] text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Register"}
                                </button>

                                <button onClick={() => setStep(2)} className="w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">Change Phone Number</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-6">
                    <p className="text-gray-400 text-xs">
                        Already have an account? <Link to="/signin" className="text-[#E79A37] font-bold hover:underline ml-1">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;