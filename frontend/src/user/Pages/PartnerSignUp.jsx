import { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft, User, Mail, Loader2, ShieldCheck,
    Fingerprint, Home, ChevronDown, Plus,
    CreditCard, Building2, Hash, Smartphone, CheckCircle2, Lock, Eye, EyeOff
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRY_CODES } from '../../utils/countryCodes';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan",
    "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { label: 'Details', num: 1 },
        { label: 'Payment', num: 2 },
        { label: 'Security', num: 3 },
    ];
    return (
        <div className="flex items-center justify-center w-full mb-6 gap-0">
            {steps.map((step, i) => (
                <div key={step.num} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300
                            ${currentStep > step.num
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : currentStep === step.num
                                    ? 'bg-white border-orange-500 text-orange-500 shadow-md shadow-orange-100'
                                    : 'bg-white border-gray-200 text-gray-300'
                            }`}>
                            {currentStep > step.num ? <CheckCircle2 size={14} /> : step.num}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${currentStep === step.num ? 'text-orange-500' : 'text-gray-300'}`}>
                            {step.label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-16 h-[2px] mb-4 mx-1 transition-all duration-500 ${currentStep > step.num ? 'bg-orange-400' : 'bg-gray-100'}`} />
                    )}
                </div>
            ))}
        </div>
    );
};

const PartnerSignUp = () => {
    const navigate = useNavigate();
    const stateListRef = useRef(null);

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [showStateList, setShowStateList] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bank');

    const [formData, setFormData] = useState({
        name: '', gotra: '', phone: '', country_code: '+91', email: '',
        address: '', city: '', state: '', pincode: '',
        role: 'pandit', panditType: 'Standard', document: null,
        accountHolderName: '',
        bankAccountNumber: '',
        confirmBankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        upiId: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (stateListRef.current && !stateListRef.current.contains(event.target)) {
                setShowStateList(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError("Only JPEG, PNG and PDF are allowed.");
            e.target.value = '';
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("File size should be less than 5MB.");
            return;
        }

        setError("");
        setFormData(prev => ({ ...prev, document: file }));
    };

    const handleNextToPayment = () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.city ||
            !formData.state || !formData.address ||
            !formData.pincode || !formData.document) {
            setError("Please fill all required fields and upload the document.");
            return;
        }
        if (formData.phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleNextToSecurity = () => {
        setError("");
        if (paymentMethod === 'bank') {
            if (!formData.accountHolderName || !formData.bankAccountNumber || !formData.bankName || !formData.ifscCode) {
                setError("Please fill all bank details.");
                return;
            }
            if (formData.bankAccountNumber !== formData.confirmBankAccountNumber) {
                setError("Bank account numbers do not match.");
                return;
            }
        } else {
            if (!formData.upiId) {
                setError("Please enter UPI ID.");
                return;
            }
            // UPI ID Regex validation
            const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
            if (!upiRegex.test((formData.upiId || "").trim())) {
                setError("Please enter a valid UPI ID (e.g. name@upi).");
                return;
            }
        }
        setStep(3);
    };

    const handleFinalRegister = async (e) => {
        if (e) e.preventDefault();

        // Re-validate Step 2 data just in case
        if (paymentMethod === 'upi') {
            const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
            if (!formData.upiId || !upiRegex.test(formData.upiId.trim())) {
                setError("Please enter a valid UPI ID (e.g. name@upi).");
                setStep(2); // Send them back to fix it
                return;
            }
        } else if (paymentMethod === 'bank') {
            if (!formData.accountHolderName || !formData.bankAccountNumber || !formData.bankName || !formData.ifscCode) {
                setError("Please fill all bank details.");
                setStep(2);
                return;
            }
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'document' && key !== 'confirmBankAccountNumber' && key !== 'confirmPassword' && formData[key] !== null && formData[key] !== '') {
                    dataToSend.append(key, formData[key]);
                }
            });
            dataToSend.append('paymentMethod', paymentMethod);
            if (formData.document) {
                dataToSend.append('document', formData.document);
            }

            const response = await fetch(`${API_BASE_URL}/user/signup`, {
                method: "POST",
                body: dataToSend
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            navigate('/partner/dashboard');

        } catch {
            setError("Registration failed. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDF8F1] flex flex-col items-center p-4 relative overflow-x-hidden font-sans">
            <div className="absolute top-[-5%] left-[-5%] w-[300px] h-[300px] bg-orange-200/20 rounded-full blur-[80px]" />

            <div className="w-full max-w-[500px] z-10 mt-4">
                <div className="flex justify-start mb-4">
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors text-xs font-bold group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Website
                    </Link>
                </div>

                <div className="bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-orange-50/50 p-5 md:p-8 flex flex-col items-center relative">

                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 border border-gray-100 overflow-hidden">
                        <img src="/img/download.jpg" alt="Logo" className="w-full h-full object-cover p-2" />
                    </div>

                    <h1 className="text-xl md:text-2xl font-serif font-black text-[#3D2B1D] text-center">Partner Onboarding</h1>
                    <p className="text-gray-400 text-[9px] md:text-[10px] text-center mt-1 mb-5 uppercase tracking-[0.2em] font-bold">Authorized Acharya Network</p>

                    <div className="w-full flex bg-[#F6F3F0] p-1 rounded-xl mb-5">
                        <Link to="/partner-signin" className="flex-1 py-2 text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">Sign In</Link>
                        <button className="flex-1 py-2 text-[10px] font-black rounded-lg bg-white text-orange-600 shadow-sm cursor-default uppercase tracking-widest">Register</button>
                    </div>

                    <StepIndicator currentStep={step} />

                    {error && (
                        <div className="mb-5 w-full p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                            <p className="text-red-700 text-[10px] font-bold uppercase">{error}</p>
                        </div>
                    )}

                    {/* STEP 1: Details */}
                    {step === 1 && (
                        <div className="w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Full Name</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <User className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Gotra</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Fingerprint className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="Optional" value={formData.gotra} onChange={(e) => setFormData({ ...formData, gotra: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Mobile</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 text-gray-700 border-r border-gray-300 font-bold text-sm flex items-center">
                                            +91
                                        </div>
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Email</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Mail className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="acharya@mail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Pandit Type</label>
                                    <div className="relative">
                                        <select
                                            name="panditType"
                                            value={formData.panditType}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-xl border border-gray-300 bg-[#FBF9F7] text-[#3D2B1D] outline-none font-bold text-[13px] appearance-none cursor-pointer focus:border-orange-500 transition-all pr-10"
                                        >
                                            <option value="Standard">Standard Pandit</option>
                                            <option value="Senior">Senior Pandit</option>
                                            <option value="Acharya">Acharya</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Upload Cert/ID</label>
                                    <div className="relative">
                                        <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" />
                                        <label htmlFor="file-upload" className="flex flex-col items-start w-full p-3 rounded-xl border border-dashed border-gray-300 bg-orange-50/50 cursor-pointer hover:bg-orange-100 transition-all">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[12px] text-gray-500 font-bold truncate">
                                                    {formData.document ? formData.document.name : "Select file"}
                                                </span>
                                                <Plus size={16} className="text-orange-500 shrink-0" />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1 w-full">
                                <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Street Address</label>
                                <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                    <Home className="ml-3 my-auto text-gray-300" size={16} />
                                    <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="Street, Landmark" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1 relative" ref={stateListRef}>
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">State</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all overflow-hidden relative">
                                        <input
                                            className="w-full px-3 py-3 bg-transparent outline-none text-xs font-bold text-[#3D2B1D] pr-8"
                                            placeholder="Search state..."
                                            value={formData.state}
                                            onFocus={() => setShowStateList(true)}
                                            onChange={(e) => {
                                                setFormData({ ...formData, state: e.target.value });
                                                setShowStateList(true);
                                            }}
                                        />
                                        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none transition-transform ${showStateList ? 'rotate-180' : ''}`} />
                                    </div>
                                    {showStateList && (
                                        <div className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {INDIAN_STATES.filter(s => s.toLowerCase().includes(formData.state.toLowerCase())).length > 0 ? (
                                                INDIAN_STATES.filter(s => s.toLowerCase().includes(formData.state.toLowerCase())).map(state => (
                                                    <div
                                                        key={state}
                                                        onClick={() => {
                                                            setFormData({ ...formData, state });
                                                            setShowStateList(false);
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer text-xs font-bold text-[#3D2B1D] border-b border-gray-50"
                                                    >
                                                        {state}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-xs text-gray-400 italic">No states found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">City</label>
                                    <input className="w-full bg-[#FBF9F7] border border-gray-300 rounded-xl px-3 py-3 outline-none text-xs font-bold text-[#3D2B1D]" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">Pincode</label>
                                    <input className="w-full bg-[#FBF9F7] border border-gray-300 rounded-xl px-3 py-3 outline-none text-xs font-bold text-[#3D2B1D]" maxLength={6} placeholder="Pin" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })} />
                                </div>
                            </div>

                            <button onClick={handleNextToPayment} className="w-full py-4 mt-2 bg-orange-400 text-white font-black rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center text-[10px] uppercase tracking-widest h-14">
                                Next: Payment Details →
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Payment */}
                    {step === 2 && (
                        <div className="w-full space-y-5">
                            <div className="flex bg-[#F6F3F0] p-1 rounded-xl">
                                <button onClick={() => setPaymentMethod('bank')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'bank' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}>
                                    <Building2 size={12} /> Bank
                                </button>
                                <button onClick={() => setPaymentMethod('upi')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'upi' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}>
                                    <Smartphone size={12} /> UPI
                                </button>
                            </div>

                            {paymentMethod === 'bank' ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">Account Holder</label>
                                        <input name="accountHolderName" className="w-full px-3 py-3 bg-[#FBF9F7] border border-gray-300 rounded-xl outline-none text-sm font-bold text-[#3D2B1D]" placeholder="Name" value={formData.accountHolderName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">Bank Name</label>
                                        <input name="bankName" className="w-full px-3 py-3 bg-[#FBF9F7] border border-gray-300 rounded-xl outline-none text-sm font-bold text-[#3D2B1D]" placeholder="e.g. SBI" value={formData.bankName} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">A/C Number</label>
                                            <input name="bankAccountNumber" type="password" className="w-full px-3 py-3 bg-[#FBF9F7] border border-gray-300 rounded-xl outline-none text-sm font-bold text-[#3D2B1D]" value={formData.bankAccountNumber} onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">Confirm A/C</label>
                                            <input name="confirmBankAccountNumber" className="w-full px-3 py-3 bg-[#FBF9F7] border border-gray-300 rounded-xl outline-none text-sm font-bold text-[#3D2B1D]" value={formData.confirmBankAccountNumber} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">IFSC Code</label>
                                        <input name="ifscCode" className="w-full px-3 py-3 bg-[#FBF9F7] border border-gray-300 rounded-xl outline-none text-sm font-bold text-[#3D2B1D] uppercase" maxLength={11} value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">UPI ID</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Smartphone className="ml-3 my-auto text-gray-300" size={16} />
                                        <input name="upiId" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" placeholder="acharya@upi" value={formData.upiId} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest h-14">← Back</button>
                                <button onClick={handleNextToSecurity} className="flex-[2] py-4 bg-orange-400 text-white font-black rounded-xl shadow-lg active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest h-14">Next: Security →</button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Security */}
                    {step === 3 && (
                        <div className="w-full space-y-6">
                            <div className="text-center">
                                <h3 className="text-base font-black text-[#3D2B1D]">Create Password</h3>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Secure your account</p>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">Password</label>
                                    <div className="relative flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Lock className="ml-3 my-auto text-gray-300" size={16} />
                                        <input type={showPassword ? "text" : "password"} name="password" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] pr-10" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-orange-500"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1">Confirm Password</label>
                                    <div className="relative flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Lock className="ml-3 my-auto text-gray-300" size={16} />
                                        <input type={showPassword ? "text" : "password"} name="confirmPassword" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] pr-10" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Password Requirements - Real-time Checklist */}
                                {formData.password.length > 0 && (
                                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 space-y-1.5 mb-4">
                                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1">Password Requirements</p>
                                        {[
                                            { ok: formData.password.length >= 6, label: "At least 6 characters" },
                                            { ok: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0, label: "Passwords match" },
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
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest h-14">← Back</button>
                                <button onClick={handleFinalRegister} disabled={isLoading} className="flex-[2] py-4 bg-[#2D1B0B] text-white font-black rounded-xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center text-[10px] uppercase tracking-[0.2em] h-14">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Complete Onboarding"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 w-full flex justify-center mt-4">
                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full">
                            <ShieldCheck size={12} strokeWidth={3} /> SECURE PROTOCOL
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnerSignUp;