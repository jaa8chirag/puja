import React, { useState, useRef, useEffect } from "react";
import {
  Headphones,
  Phone,
  Mail,
  Send,
  ChevronDown,
  ArrowLeft,
  MessageSquare,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatWidget from "./Chatwidget";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const HelpSection = () => {
  const navigate = useNavigate();
  const submitLock = useRef(false); // 🔥 Prevent double submit

  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [conversations, setConversations] = useState([]);
  const [contactInfo, setContactInfo] = useState({ phone: null, email: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/puja/my-support-queries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setConversations(Array.isArray(result) ? result : result.data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/admin/personal-info`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const active = json.data.find((item) => item.is_active === 1);
          if (active) {
            setContactInfo({
              phone: active.phone_name,
              email: active.email,
            });
          }
        }
      } catch (error) {
        console.error("❌ Footer contact fetch error:", error);
      }
    };

    fetchContactInfo();
  }, []);

  const [formData, setFormData] = useState({
    category: "General Query",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Double submit protection
    if (submitLock.current) return;
    submitLock.current = true;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/puja/support-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (response.ok && result.success) {
        alert("✅ Query submitted successfully!");
        setFormData({
          category: "General Query",
          subject: "",
          message: "",
        });
      } else {
        alert("❌ " + (result.message || "Failed to submit query"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Network Error: Failed to send message");
    } finally {
      setLoading(false);
      submitLock.current = false; // 🔓 Unlock
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF4E1] p-4 md:p-8 font-sans">
      <div className="max-w-xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 mb-6 font-medium hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200 text-white">
            <Headphones size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Talk to Our Executive
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Our support team is here to help you
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-4 rounded-3xl border border-orange-200 flex items-center gap-4 shadow-sm">
            <div className="bg-orange-100 p-3 rounded-2xl text-orange-500">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">
                Call Now
              </p>
              <p className="text-sm font-bold text-gray-700">
                {contactInfo.phone ?? "Loading..."}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-orange-200 flex items-center gap-4 shadow-sm">
            <div className="bg-orange-100 p-3 rounded-2xl text-orange-500">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">
                Email Us
              </p>
              <p className="text-sm font-bold text-gray-700">
                {contactInfo.email ?? "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 rounded-[15px] border mb-8 border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 font-bold text-gray-800 text-lg">
            <Send size={18} className="text-orange-500 rotate-[-20deg]" />
            <span>Send a Message</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                Category
              </label>
              <div className="relative mt-1">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                    })
                  }
                  className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-sm font-medium outline-none appearance-none focus:border-orange-400"
                >
                  <option>General Query</option>
                  <option>Booking Issue</option>
                  <option>Refund</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                Subject
              </label>
              <input
                required
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subject: e.target.value,
                  })
                }
                placeholder="Brief description of your issue"
                className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-sm font-medium mt-1 outline-none focus:border-orange-400"
              />
            </div>

            {/* Message */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">
                Message
              </label>
              <textarea
                required
                rows="4"
                value={formData.message}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    message: e.target.value,
                  })
                }
                placeholder="Describe your issue in detail..."
                className="w-full bg-orange-50/50 border border-orange-100 rounded-2xl p-4 text-sm font-medium mt-1 outline-none focus:border-orange-400 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-100 hover:bg-orange-600 transition-all active:scale-95 disabled:bg-gray-300"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>

        {/* My Support Tickets Section */}
        <div className="bg-white rounded-[1rem] border border-orange-200 p-6 md:p-8 shadow-sm mb-8">
          <h3 className="text-xl font-serif font-bold text-gray-800 mb-6">
            My Support Tickets
          </h3>

          {loading ? (
            <div className="py-20 text-center flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 font-medium">
                Fetching your tickets...
              </p>
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((query, i) => (
                <div
                  key={i}
                  className="p-5 bg-white rounded-2xl border border-orange-200 shadow-sm hover:border-orange-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-gray-800 mb-1">
                        {query.subject}
                      </h4>
                      <p className="text-sm text-gray-500 leading-relaxed mb-4">
                        {query.message}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                        query.status === "Open"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {query.status === "Open" ? "● Open" : "✓ Resolved"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-md uppercase">
                      {query.category}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock size={12} />
                      {new Date(query.created_at).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold">
                No support tickets found
              </p>
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
};

export default HelpSection;
