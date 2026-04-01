import { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft, User, Mail, Loader2, ShieldCheck,
    Fingerprint, Home, ChevronDown, Plus,
    CreditCard, Building2, Hash, Smartphone, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi"
];

const StepIndicator = ({ currentStep }) => {
    const steps = [
        { label: 'Details', num: 1 },
        { label: 'Payment', num: 2 },
        { label: 'Verify', num: 3 },
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
    const [error, setError] = useState("");
    const [showStateList, setShowStateList] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('bank');

    const [formData, setFormData] = useState({
        name: '', gotra: '', phone: '', email: '',
        address: '', city: '', state: '', pincode: '',
        role: 'pandit', panditType: 'Standard', document: null,
        accountHolderName: '',
        bankAccountNumber: '',
        confirmBankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        upiId: '',
        otp: ''
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

    // STEP 1 → STEP 2
    const handleNextToPayment = () => {
        if (!formData.name || !formData.phone || !formData.city ||
            !formData.state || !formData.address ||
            !formData.pincode || !formData.document) {
            setError("Kripya sabhi jankari bharein aur document upload karein.");
            return;
        }
        setError("");
        setStep(2);
    };

    // STEP 2 → STEP 3
    const handleSendOTP = async () => {
        setError("");

        if (paymentMethod === 'bank') {
            if (!formData.accountHolderName || !formData.bankAccountNumber || !formData.bankName || !formData.ifscCode) {
                setError("Kripya sabhi bank details bharein.");
                return;
            }
            if (formData.bankAccountNumber !== formData.confirmBankAccountNumber) {
                setError("Bank account number match nahi kar raha. Dobara check karein.");
                return;
            }
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
            if (!ifscRegex.test(formData.ifscCode.toUpperCase())) {
                setError("Invalid IFSC code format (e.g. SBIN0001234).");
                return;
            }
        } else {
            if (!formData.upiId) {
                setError("Kripya UPI ID darj karein.");
                return;
            }
            if (!formData.upiId.includes('@')) {
                setError("Invalid UPI ID format (e.g. name@upi).");
                return;
            }
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/user/signup-request`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    gotra: formData.gotra
                })
            });
            const data = await res.json();
            if (res.ok) {
                setStep(3);
            } else {
                setError(data.message || "Registration process mein dikkat aayi.");
            }
        } catch {
            setError("Divine connection interrupted. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // STEP 3 — Final Verify
    const handleFinalVerify = async (e) => {
        if (e) e.preventDefault();
        if (formData.otp.length !== 6) {
            setError("Please enter valid 6 digit OTP.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'document' && key !== 'confirmBankAccountNumber' && formData[key] !== null && formData[key] !== '') {
                    dataToSend.append(key, formData[key]);
                }
            });
            dataToSend.append('paymentMethod', paymentMethod);
            if (formData.document) {
                dataToSend.append('document', formData.document);
            }

            const response = await fetch(`${API_BASE_URL}/user/signup-verify`, {
                method: "POST",
                body: dataToSend
            });
            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Invalid OTP code.");
                return;
            }

            localStorage.setItem('token', data.token);
            navigate('/partner/dashboard');

        } catch {
            setError("Verification failed.");
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

                <div className="bg-white rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-orange-50/50 p-5 md:p-8 flex flex-col items-center relative">

                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4 border border-gray-100 overflow-hidden">
                        <img src="/img/download.jpg" alt="Logo" className="w-full h-full object-cover p-2" />
                    </div>

                    <h1 className="text-xl md:text-2xl font-serif font-black text-[#3D2B1D] text-center">Partner Onboarding</h1>
                    <p className="text-gray-400 text-[9px] md:text-[10px] text-center mt-1 mb-5 uppercase tracking-[0.2em] font-bold">Authorized Acharya Network</p>

                    <div className="w-full flex bg-[#F6F3F0] p-1 rounded-xl mb-5">
                        <Link to="/partnerSignIn" className="flex-1 py-2 text-[10px] font-black text-gray-400 text-center uppercase tracking-widest">Sign In</Link>
                        <button className="flex-1 py-2 text-[10px] font-black rounded-lg bg-white text-orange-600 shadow-sm cursor-default uppercase tracking-widest">Register</button>
                    </div>

                    <StepIndicator currentStep={step} />

                    {error && (
                        <div className="mb-5 w-full p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                            <p className="text-red-700 text-[10px] font-bold uppercase">{error}</p>
                        </div>
                    )}

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Full Name</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <User className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="Enter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Gotra</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Fingerprint className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="Optional" value={formData.gotra} onChange={(e) => setFormData({ ...formData, gotra: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Mobile</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all overflow-hidden">
                                        <span className="pl-3 py-3 text-gray-400 font-black text-xs border-r border-gray-300 pr-2">+91</span>
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D]" maxLength={10} placeholder="00000 00000" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Email</label>
                                    <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                        <Mail className="ml-3 my-auto text-gray-300" size={16} />
                                        <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="acharya@mail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Select Pandit Type</label>
                                    <select name="panditType" value={formData.panditType} onChange={handleChange} className="w-full p-3 rounded-xl border border-gray-300 bg-white text-gray-700 focus:ring-1 focus:ring-orange-400 outline-none font-medium text-[14px]">
                                        <option value="Standard">Standard Pandit</option>
                                        <option value="Senior">Senior Pandit</option>
                                        <option value="Acharya">Acharya</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Upload Identity/Cert</label>
                                    <div className="relative">
                                        <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" />
                                        <label htmlFor="file-upload" className="flex flex-col items-start w-full p-3 rounded-xl border border-dashed border-gray-300 bg-orange-50/50 cursor-pointer hover:bg-orange-100 transition-all">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[13px] text-gray-500 font-medium truncate">
                                                    {formData.document ? formData.document.name : "Choose file..."}
                                                </span>
                                                <Plus size={18} className="text-orange-500 shrink-0" />
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-bold mt-1">Only JPEG, PNG and PDF are allowed.</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Address</label>
                                <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                    <Home className="ml-3 my-auto text-gray-300" size={16} />
                                    <input className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="Street, Landmark" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1 relative" ref={stateListRef}>
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">State</label>
                                    <div onClick={() => setShowStateList(!showStateList)} className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl cursor-pointer py-3 px-3 justify-between items-center transition-all focus-within:border-orange-500">
                                        <span className="text-xs font-bold text-[#3D2B1D] truncate">{formData.state || 'State'}</span>
                                        <ChevronDown size={14} className={`text-gray-300 transition-transform ${showStateList ? 'rotate-180' : ''}`} />
                                    </div>
                                    {showStateList && (
                                        <div className="absolute z-[100] w-full sm:w-52 mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl max-h-48 overflow-y-auto">
                                            {INDIAN_STATES.map(state => (
                                                <div key={state} onClick={() => { setFormData({ ...formData, state }); setShowStateList(false); }} className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer text-xs font-bold text-[#3D2B1D] border-b border-gray-50">{state}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">City</label>
                                    <div className="bg-[#FBF9F7] border border-gray-300 rounded-xl px-3 py-3 flex items-center">
                                        <input className="w-full bg-transparent outline-none text-xs font-bold text-[#3D2B1D]" placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-[#8C7A6B] uppercase tracking-wider">Pincode</label>
                                    <div className="bg-[#FBF9F7] border border-gray-300 rounded-xl px-3 py-3 flex items-center">
                                        <input className="w-full bg-transparent outline-none text-xs font-bold text-[#3D2B1D]" maxLength={6} placeholder="Pin" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })} />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleNextToPayment} className="w-full py-4 mt-4 bg-orange-400 text-white font-black rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center text-[10px] uppercase tracking-[0.2em] h-14">
                                Next: Payment Details →
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="w-full space-y-5">
                            <div className="text-center mb-2">
                                <h3 className="text-base font-black text-[#3D2B1D]">Payment Details</h3>
                                <p className="text-[10px] text-gray-400 mt-1">Payments aapke is account mein bheje jaayenge</p>
                            </div>

                            <div className="flex bg-[#F6F3F0] p-1 rounded-xl">
                                <button onClick={() => { setPaymentMethod('bank'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'bank' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}>
                                    <Building2 size={12} /> Bank Account
                                </button>
                                <button onClick={() => { setPaymentMethod('upi'); setError(''); }} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${paymentMethod === 'upi' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}>
                                    <Smartphone size={12} /> UPI
                                </button>
                            </div>

                            {paymentMethod === 'bank' && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Account Holder Name</label>
                                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                            <User className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="accountHolderName" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="As per bank records" value={formData.accountHolderName} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Bank Name</label>
                                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                            <Building2 className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="bankName" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="e.g. State Bank of India" value={formData.bankName} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Account Number</label>
                                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                            <CreditCard className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="bankAccountNumber" type="password" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="Enter account number" value={formData.bankAccountNumber} onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value.replace(/\D/g, '') })} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">Confirm Account Number</label>
                                        <div className={`flex bg-[#FBF9F7] border rounded-xl focus-within:border-orange-500 transition-all ${formData.confirmBankAccountNumber && formData.bankAccountNumber !== formData.confirmBankAccountNumber ? 'border-red-400' : 'border-gray-300'}`}>
                                            <CreditCard className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="confirmBankAccountNumber" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="Re-enter account number" value={formData.confirmBankAccountNumber} onChange={handleChange} />
                                            {formData.confirmBankAccountNumber && formData.bankAccountNumber === formData.confirmBankAccountNumber && (
                                                <CheckCircle2 className="mr-3 my-auto text-green-400" size={16} />
                                            )}
                                        </div>
                                        {formData.confirmBankAccountNumber && formData.bankAccountNumber !== formData.confirmBankAccountNumber && (
                                            <p className="text-[9px] text-red-500 font-bold ml-1 mt-1">Account numbers match nahi kar rahe</p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">IFSC Code</label>
                                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                            <Hash className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="ifscCode" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300 uppercase" placeholder="e.g. SBIN0001234" maxLength={11} value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })} />
                                        </div>
                                        <p className="text-[9px] text-gray-400 ml-1">Format: 4 letters + 0 + 6 alphanumeric (e.g. HDFC0001234)</p>
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <ShieldCheck size={14} className="text-orange-400 mt-0.5 shrink-0" />
                                        <p className="text-[9px] text-orange-700 font-bold leading-relaxed">Aapki bank details end-to-end encrypted hain. Sirf payment transfer ke liye use ki jaayengi.</p>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'upi' && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-[#8C7A6B] uppercase ml-1 tracking-wider">UPI ID</label>
                                        <div className="flex bg-[#FBF9F7] border border-gray-300 rounded-xl focus-within:border-orange-500 transition-all">
                                            <Smartphone className="ml-3 my-auto text-gray-300" size={16} />
                                            <input name="upiId" className="w-full px-3 py-3 bg-transparent outline-none text-sm font-bold text-[#3D2B1D] placeholder:font-normal placeholder:text-gray-300" placeholder="yourname@paytm / @gpay / @ybl" value={formData.upiId} onChange={handleChange} />
                                        </div>
                                        <p className="text-[9px] text-gray-400 ml-1">Supported: Google Pay, PhonePe, Paytm, BHIM, etc.</p>
                                    </div>
                                    <div className="flex items-center gap-3 px-1">
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Accepted:</span>
                                        {['@okaxis', '@ybl', '@paytm', '@gpay', '@oksbi'].map(h => (
                                            <span key={h} className="text-[9px] font-black text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{h}</span>
                                        ))}
                                    </div>
                                    <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                        <ShieldCheck size={14} className="text-orange-400 mt-0.5 shrink-0" />
                                        <p className="text-[9px] text-orange-700 font-bold leading-relaxed">UPI ID verify karke hi payment bheja jaayega. Sahi ID darj karein.</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-2">
                                <button onClick={() => { setStep(1); setError(''); }} className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-xl active:scale-[0.98] transition-all text-[10px] uppercase tracking-widest h-14">
                                    ← Back
                                </button>
                                <button onClick={handleSendOTP} disabled={isLoading} className="flex-[2] py-4 bg-orange-400 text-white font-black rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center text-[10px] uppercase tracking-[0.15em] h-14">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP →"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="w-full space-y-6 text-center py-4">
                            <div className="space-y-3">
                                <h3 className="text-xl font-bold text-[#3D2B1D]">Sacred Code</h3>
                                <p className="text-xs text-gray-400">Sent to <span className="text-orange-600 font-bold">+91 {formData.phone}</span></p>
                                <input type="text" maxLength={6} className="w-full py-4 bg-[#FBF9F7] border-2 border-gray-300 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-orange-500 outline-none transition-all" placeholder="000000" value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })} />
                            </div>
                            <button onClick={handleFinalVerify} disabled={isLoading || formData.otp.length < 6} className="w-full py-4 bg-orange-400 text-white font-bold rounded-xl shadow-xl active:scale-[0.98] transition-all text-xs uppercase tracking-widest h-14 flex items-center justify-center">
                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify & Complete"}
                            </button>
                            <button onClick={() => { setStep(2); setError(''); }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-orange-600">
                                ← Modify Payment Details
                            </button>
                        </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 w-full flex justify-center mt-4">
                        <div className="flex items-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-100/50">
                            <ShieldCheck size={12} strokeWidth={3} /> SECURE ONBOARDING
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 mb-4 text-center">
                <p className="text-gray-400 text-xs">
                    Need help? <span className="text-orange-600 font-bold cursor-pointer">Contact Support</span>
                </p>
            </div>
        </div>
    );
};

export default PartnerSignUp;