import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Clock, Search } from "lucide-react";
import { stripHtml } from "../../utils/stripHtml";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const CATEGORIES = ["All", "Jyotish", "Vastu", "Puja Vidhi", "Rashifal", "Upay"];

const formatOrdinalDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('en-IN', { month: 'long' });
  const year = date.getFullYear();

  let suffix = 'th';
  if (day % 10 === 1 && day !== 11) suffix = 'st';
  else if (day % 10 === 2 && day !== 12) suffix = 'nd';
  else if (day % 10 === 3 && day !== 13) suffix = 'rd';

  return `${day}${suffix} ${month} ${year}`;
};

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

          <div className="relative max-w-2xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500"
              size={20}
            />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search for Blogs, Vastu, or Jyotish..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-orange-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[#3b2a1a] text-sm"
            />
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
              <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-orange-200" />
                  <span className="text-orange-500/70 text-[10px] uppercase tracking-[0.4em] font-bold">Featured Spotlight</span>
                  <div className="h-px flex-1 bg-orange-200" />
                </div>

                <div
                  className="relative flex flex-col md:flex-row rounded-[32px] overflow-hidden cursor-pointer group bg-white border border-orange-100 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-200/50"
                  onClick={() => navigate(`/blogs/${featured.id}`)}
                  style={{ boxShadow: '0 20px 50px -12px rgba(180,83,9,0.12)' }}
                >
                  {/* Left Side: Image */}
                  <div className="w-full md:w-[55%] h-64 md:h-[400px] overflow-hidden relative">
                    {buildImageUrl(featured.image_url) ? (
                      <img
                        src={buildImageUrl(featured.image_url)}
                        alt={featured.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-50">
                        <span className="text-7xl opacity-20">🛕</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>

                  {/* Right Side: Content */}
                  <div className="w-full md:w-[45%] p-8 md:p-12 flex flex-col justify-center text-left">
                    <div className="flex items-center gap-2 mb-4 text-[11px] font-medium uppercase tracking-[0.15em] text-stone-400">
                      <span>Featured</span>
                      <span className="opacity-40">·</span>
                      <span>{featured.category || 'Vedic Gyan'}</span>
                    </div>

                    <h2 className="text-xl md:text-3xl font-bold text-[#2D1A00] mb-4 leading-tight group-hover:text-orange-600 transition-colors"
                      style={{ fontFamily: "'Georgia', serif", wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      {featured.title}
                    </h2>

                    <div className="text-stone-500 text-sm md:text-base leading-relaxed mb-6 line-clamp-3 overflow-hidden" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
                      {stripHtml(featured.content || featured.excerpt || featured.description || '')}
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-stone-400 mt-2">
                      {featured.author && <span>{featured.author}</span>}
                      <span className="opacity-40">·</span>
                      {featured.created_at && <span>{formatOrdinalDate(featured.created_at)}</span>}
                      <span className="opacity-40">·</span>
                      {featured.read_time && <span>{featured.read_time} read</span>}
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
            loading="lazy"
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
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {blog.category && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white">
              {blog.category}
            </span>
          )}
          {blog.tag && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-medium">
              {blog.tag}
            </span>
          )}
        </div>

        <h3 className="text-[#2D1A00] font-bold text-[17px] mb-2 leading-snug group-hover:text-orange-600 transition-colors line-clamp-2"
          style={{ fontFamily: "'Georgia', serif", wordBreak: 'normal', overflowWrap: 'break-word' }}>
          {blog.title}
        </h3>

        {(blog.excerpt || blog.content || blog.description) && (
          <p className="text-stone-500 text-[14px] leading-relaxed line-clamp-3" style={{ wordBreak: 'normal', overflowWrap: 'break-word' }}>
            {blog.excerpt || stripHtml(blog.content || blog.description || '')}
          </p>
        )}
      </div>
        <div className="px-5 pb-5 mt-auto">
          <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
            {blog.author && <span>{blog.author}</span>}
            {blog.author && (blog.created_at || blog.read_time) && <span className="opacity-40">·</span>}
            {blog.created_at && <span>{formatOrdinalDate(blog.created_at)}</span>}
            {blog.created_at && blog.read_time && <span className="opacity-40">·</span>}
            {blog.read_time && <span>{blog.read_time} read</span>}
          </div>
        </div>
    </div>
  );
}