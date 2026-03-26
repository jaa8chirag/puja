// pages/ContactUs.jsx
import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function ContactUs() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ name: "", email: "", message: "" });
  const [sent,    setSent]    = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/pages/contact-us`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(
          typeof d.page.sections === "string"
            ? JSON.parse(d.page.sections)
            : d.page.sections
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#FFF4E1] flex items-center justify-center">
      <p className="text-orange-600 font-bold animate-pulse">Loading...</p>
    </div>
  );

  const s = data || {};
  const inputClass = "w-full bg-gray-50 border border-orange-200 rounded-xl px-3 py-3 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-500 transition-all text-sm font-medium";

  return (
    <div className="min-h-screen bg-[#FFF4E1] text-[#2D1A00]">
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e8892200, #e88922 30%, #f59e0b 50%, #e88922 70%, #e8892200)' }} />

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 py-14 text-center">
        <p className="text-orange-500/60 text-[10px] tracking-[0.4em] uppercase mb-3 font-bold">ॐ</p>
        <h1 className="text-4xl md:text-5xl font-black mb-3 text-[#7c2d00]"
          style={{ fontFamily: "'Georgia', serif" }}>
          {s.hero_title || "Contact Us"}
        </h1>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d97706)' }} />
          <span className="text-orange-500 text-lg">🛕</span>
          <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #d97706, transparent)' }} />
        </div>
        <p className="text-orange-700/70 text-base font-medium">{s.hero_subtitle}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Contact Info */}
          <div className="space-y-4">

            {s.email && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl shrink-0">
                  <Mail size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500/70 mb-0.5">Email</p>
                  <a href={`mailto:${s.email}`} className="text-sm font-semibold text-[#3d1500] hover:text-orange-600 transition-colors">
                    {s.email}
                  </a>
                </div>
              </div>
            )}

            {s.phone && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-orange-100 p-3 rounded-xl shrink-0">
                  <Phone size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500/70 mb-0.5">Phone</p>
                  <a href={`tel:${s.phone}`} className="text-sm font-semibold text-[#3d1500] hover:text-orange-600 transition-colors">
                    {s.phone}
                  </a>
                </div>
              </div>
            )}

            {s.whatsapp && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-xl shrink-0">
                  <FaWhatsapp size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-green-600/70 mb-0.5">WhatsApp</p>
                  <a href={`https://wa.me/${s.whatsapp.replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="text-sm font-semibold text-[#3d1500] hover:text-green-600 transition-colors">
                    {s.whatsapp}
                  </a>
                </div>
              </div>
            )}

            {s.address && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-xl shrink-0">
                  <MapPin size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500/70 mb-0.5">Address</p>
                  <p className="text-sm font-medium text-[#3d1500] leading-relaxed">{s.address}</p>
                </div>
              </div>
            )}

            {(s.timing_title || s.timing_text) && (
              <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-xl shrink-0">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-orange-500/70 mb-0.5">{s.timing_title}</p>
                  <p className="text-sm font-medium text-[#3d1500]">{s.timing_text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-[#7c2d00] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
              {s.form_title || "Sandesh Bhejein"}
            </h2>
            <p className="text-xs text-orange-500/60 font-medium mb-5">{s.form_subtitle}</p>

            {sent ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🙏</div>
                <p className="text-green-600 font-bold">Aapka sandesh pahunch gaya!</p>
                <p className="text-xs text-gray-500 mt-1">Hum jald hi contact karenge</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Aapka Naam</label>
                  <input type="text" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Poora naam" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Email</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="aapka@email.com" className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Sandesh</label>
                  <textarea rows={4} value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Aapka sawaal ya sandesh..." className={inputClass} />
                </div>
                <button
                  onClick={() => setSent(true)}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm"
                >
                  <Send size={14} /> Bhejein
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        {s.map_embed_url && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-orange-200 shadow-sm h-64">
            <iframe src={s.map_embed_url} width="100%" height="100%"
              style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade" title="Location Map" />
          </div>
        )}
      </div>
    </div>
  );
}