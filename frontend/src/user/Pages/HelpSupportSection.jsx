import React, { useState, useEffect } from "react";
import {
  Phone,
  Mail,
  ChevronRight,
  ArrowLeft,
  Headphones,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const HelpSupportSection = () => {
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState({ phone: null, email: null });
  const [faqs, setFaqs] = useState([]); // ✅ Dynamic FAQs State
  const [loadingFaqs, setLoadingFaqs] = useState(true);

  useEffect(() => {
    // ── Fetch Contact Info (Personal Info Table) ──
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/personal-info`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const active = json.data.find((item) => item.is_active === 1);
          if (active) {
            setContactInfo({ phone: active.phone_name, email: active.email });
          }
        }
      } catch (error) {
        console.error("❌ HelpSupport contact fetch error:", error);
      }
    };

    // ── Fetch Dynamic FAQs from Backend ──
    const fetchFaqs = async () => {
      setLoadingFaqs(true);
      try {
        // Aapka backend route: /api/faq/get-all
        const res = await fetch(`${API_BASE_URL}/admin/faq/get-all`);
        const json = await res.json();
        if (json.success) {
          setFaqs(json.faqs);
        }
      } catch (error) {
        console.error("❌ FAQ fetch error:", error);
      } finally {
        setLoadingFaqs(false);
      }
    };

    fetchContactInfo();
    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 md:p-8 font-sans antialiased text-[#2D2D2D]">
      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button
          className="flex items-center gap-1 text-gray-500 text-sm font-bold mb-8 hover:text-orange-500 transition-colors"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md">
            <span className="text-2xl font-bold">?</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            How can we help you?
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Choose a way to reach us or browse FAQs
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div
            onClick={() => navigate("/help/support")}
            className="cursor-pointer"
          >
            <ContactCard
              icon={<Headphones className="text-green-500" size={24} />}
              title="Talk to Support"
              sub="Live assistance"
            />
          </div>
          <a href={`tel:${contactInfo.phone}`}>
            <ContactCard
              icon={<Phone className="text-blue-500" size={24} />}
              title="Call Support"
              sub={contactInfo.phone ?? "Loading..."}
            />
          </a>
          <a href={`mailto:${contactInfo.email}`}>
            <ContactCard
              icon={<Mail className="text-purple-500" size={24} />}
              title="Email Us"
              sub={contactInfo.email ?? "Loading..."}
            />
          </a>
        </div>

        {/* FAQ Section (UI exact same as before) */}
        <div className="bg-white rounded-[2rem] border border-orange-100 p-6 md:p-8 shadow-sm mb-10">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
            Frequently Asked Questions
          </h3>
          <div className="flex flex-col">
            {loadingFaqs ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            ) : faqs.length > 0 ? (
              faqs.map((faq) => (
                <FAQItem key={faq.id} q={faq.question} a={faq.answer} />
              ))
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">
                No FAQs found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ContactCard = ({ icon, title, sub }) => (
  <div className="bg-white p-4 h-full rounded-2xl border border-orange-200 text-center flex flex-col items-center hover:shadow-xl hover:border-orange-300 transition-all duration-300">
    <div className="mb-4 bg-gray-50 p-4 rounded-full">{icon}</div>
    <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
    <p className="text-xs text-gray-400 font-medium">{sub}</p>
  </div>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="py-3 cursor-pointer border-b border-orange-50 last:border-none"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center gap-4">
        <span className="text-[15px] text-gray-700 font-bold leading-tight pr-5">
          {q}
        </span>
        <ChevronRight
          size={18}
          className={`text-orange-400 transition-transform duration-300 shrink-0 ${open ? "rotate-90" : ""}`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? "max-h-96 mt-3 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <p className="text-[14px] text-gray-500 leading-relaxed font-medium">
          {a}
        </p>
      </div>
    </div>
  );
};

export default HelpSupportSection;
