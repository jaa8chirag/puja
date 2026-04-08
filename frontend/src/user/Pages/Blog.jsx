import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const CATEGORIES = ["All", "Jyotish", "Vastu", "Puja Vidhi", "Rashifal", "Upay"];

export default function Blog() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams();
        if (active !== "All") params.set("category", active);
        if (search) params.set("search", search);
        params.set("limit", "20");

        const res = await fetch(`${API_BASE_URL}/blogs?${params}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.error);

        const list = data.blogs || [];
        setBlogs(list);
        setFeatured(active === "All" && !search && list.length > 0 ? list[0] : null);
      } catch (e) {
        setError(e.message || 'Blogs load nahi ho sake');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [active, search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `${API_BASE_URL.replace('/api', '')}${url}`;
    return `${API_BASE_URL}/uploads/${url}`;
  };

  const gridBlogs = featured ? blogs.filter(b => b.id !== featured.id) : blogs;

  return (
    <div className="min-h-screen bg-[#FFF4E1] font-sans text-[#2D1A00]">

      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e8892200, #e88922 30%, #f59e0b 50%, #e88922 70%, #e8892200)' }} />

      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='55' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='40' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='25' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Cpath d='M60 5 L65 55 L60 115 L55 55 Z' fill='none' stroke='%23b45309' stroke-width='0.5'/%3E%3Cpath d='M5 60 L55 65 L115 60 L55 55 Z' fill='none' stroke='%23b45309' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '120px 120px' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p className="text-orange-500/60 text-[10px] tracking-[0.4em] uppercase mb-3 font-bold">ॐ ज्ञान का प्रकाश</p>

          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
            style={{ color: '#7c2d00', fontFamily: "'Georgia', serif", textShadow: '0 2px 12px rgba(180,83,9,0.15)' }}>
            Vedic Gyan Bhandar
          </h1>

          <div className="flex items-center justify-center gap-3 mt-2 mb-6">
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, transparent, #d97706)' }} />
            <span className="text-orange-600/50 text-xs tracking-[0.25em] uppercase font-semibold">Jyotish · Vastu · Puja Vidhi · Upay</span>
            <div className="h-px w-16" style={{ background: 'linear-gradient(90deg, #d97706, transparent)' }} />
          </div>

          <div className="relative max-w-md mx-auto">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search Blog..."
              className="w-full bg-white/70 border border-orange-200 rounded-2xl px-5 py-3.5 text-[#3d1500] placeholder-orange-300/70 focus:outline-none focus:border-orange-400 focus:bg-white text-sm shadow-sm transition-all"
              style={{ fontFamily: "'Georgia', serif" }}
            />
            <span className="absolute right-4 top-3.5 text-orange-400 text-sm">🔍</span>
          </div>
        </div>

        {/* ── Category Filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border-2 shadow-sm
                ${active === cat
                  ? 'bg-orange-600 text-white border-orange-600 shadow-orange-200 shadow-md'
                  : 'bg-white/60 text-orange-700/70 border-orange-200 hover:border-orange-400 hover:text-orange-700 hover:bg-white'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="animate-spin inline-block w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-orange-600/60 text-sm font-medium">Blogs load ho rahe hain...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-semibold mb-1">{error}</p>
            <button onClick={() => { setActive("All"); setSearchInput(""); }}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Featured Post ── */}
            {featured && (
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-orange-200" />
                  <span className="text-orange-500/70 text-[10px] uppercase tracking-[0.35em] font-bold">Featured</span>
                  <div className="h-px flex-1 bg-orange-200" />
                </div>

                <div
                  className="relative rounded-3xl overflow-hidden cursor-pointer group min-h-[280px] border border-orange-200"
                  onClick={() => navigate(`/blogs/${featured.id}`)}
                  style={{ boxShadow: '0 8px 40px rgba(180,83,9,0.12)' }}
                >
                  {buildImageUrl(featured.image_url) ? (
                    <img
                      src={buildImageUrl(featured.image_url)}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #7c2d00 0%, #b45309 50%, #d97706 100%)' }} />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(30,8,0,0.82) 100%)' }} />
                  <div className="absolute inset-0 rounded-3xl ring-2 ring-transparent group-hover:ring-orange-400/40 transition-all duration-300" />

                  <div className="relative p-7 md:p-10 flex flex-col justify-end min-h-[280px]">
                    <div className="flex items-center gap-2 mb-3">
                      {featured.category && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/90 text-white">
                          {featured.category}
                        </span>
                      )}
                      {featured.tag && (
                        <span className="text-xs px-3 py-1 rounded-full bg-black/30 text-orange-200 border border-orange-400/30 backdrop-blur-sm">
                          {featured.tag}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug group-hover:text-orange-100 transition-colors"
                      style={{ fontFamily: "'Georgia', serif", textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-orange-100/70 text-sm leading-relaxed mb-5 max-w-2xl line-clamp-2">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 text-xs text-orange-200/60 flex-wrap">
                        {featured.author && <span>✍️ {featured.author}</span>}
                        {featured.created_at && <span>📅 {new Date(featured.created_at).toLocaleDateString('hi-IN')}</span>}
                        {featured.read_time && <span>⏱ {featured.read_time} read</span>}
                        {featured.views > 0 && <span>👁 {featured.views}</span>}
                      </div>
                      <span className="text-xs font-bold px-5 py-2 rounded-full text-white border border-orange-400/50 bg-orange-600/80 backdrop-blur-sm group-hover:bg-orange-600 transition-colors">
                        Information →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── No Results ── */}
            {blogs.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-orange-600/60 font-medium">Koi blog nahi mila.</p>
                <button onClick={() => { setActive("All"); setSearchInput(""); }}
                  className="mt-4 text-xs text-orange-600 hover:text-orange-800 underline font-semibold">
                  Reset All
                </button>
              </div>
            )}

            {/* ── Blog Grid ── */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridBlogs.map(blog => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    imageUrl={buildImageUrl(blog.image_url)}
                    onRead={() => navigate(`/blogs/${blog.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="text-center mt-16 pb-4">
          <div className="h-px w-32 mx-auto bg-orange-200 mb-4" />
          <p className="text-orange-700/40 text-xs font-medium">🛕 Vedic Gyan Bhandar · Jyotish aur Dharma ka Prachar</p>
          <p className="text-orange-500/30 text-xs mt-1">Har nirṇay ke liye yogya Jyotishi se salah lein.</p>
        </div>
      </div>
    </div>
  );
}

// ── Blog Card ─────────────────────────────────────────────────
function BlogCard({ blog, imageUrl, onRead }) {
  const FALLBACK_COLORS = [
    { from: '#7c2d00', to: '#b45309' },
    { from: '#14532d', to: '#065f46' },
    { from: '#7c3aed', to: '#4c1d95' },
    { from: '#1e3a5f', to: '#1e40af' },
    { from: '#831843', to: '#9f1239' },
    { from: '#78350f', to: '#d97706' },
  ];
  const clr = FALLBACK_COLORS[blog.id % FALLBACK_COLORS.length];

  return (
    <div
      onClick={onRead}
      className="group cursor-pointer rounded-2xl overflow-hidden bg-white hover:border-orange-400 transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
      style={{ boxShadow: '0 2px 16px rgba(180,83,9,0.07)', transition: 'all 0.3s ease' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 36px rgba(180,83,9,0.16)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(180,83,9,0.07)'}
    >
      {/* Image — no badges on top */}
      <div className="relative h-56 overflow-hidden shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${clr.from}, ${clr.to})` }}>
            <span className="text-6xl opacity-20">🛕</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Date + Read time — image jaisa style */}

        <h3 className="text-orange-800 font-bold text-[17px] mb-2 leading-snug group-hover:text-orange-700 transition-colors line-clamp-2"
          style={{ fontFamily: "'Georgia', serif" }}>
          {blog.title}
        </h3>

        {blog.excerpt && (
          <p className="text-orange-700 text-[14px] leading-relaxed line-clamp-3">
            {blog.excerpt}
          </p>
        )}
      </div>
        <div className="flex justify-between p-4 px-6">
          {blog.created_at && (
            <span className="flex items-center gap-1.5 text-[13px] text-orange-800">
              <span className="text-[12px]">📅</span>
              {new Date(blog.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          {blog.read_time && (
            <span className="flex items-center gap-1.5 text-[13px] text-orange-800">
              <span className="text-[12px]">🕐</span>
              {blog.read_time}
            </span>
          )}
        </div>
    </div>
  );
}