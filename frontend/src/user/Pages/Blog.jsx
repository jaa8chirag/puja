import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const CATEGORIES = ["All", "Jyotish", "Vastu", "Puja Vidhi", "Rashifal", "Upay"];

export default function Blog() {
  const navigate = useNavigate();

  const [blogs, setBlogs]             = useState([]);
  const [featured, setFeatured]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [active, setActive]           = useState("All");
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");

  // ── Fetch blogs ─────────────────────────────────────────────
  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true); setError('');
      try {
        const params = new URLSearchParams();
        if (active !== "All") params.set("category", active);
        if (search)           params.set("search", search);
        params.set("limit", "20");

        const res  = await fetch(`${API_BASE_URL}/blogs?${params}`);
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

  // Search debounce 500ms
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
    return `http://localhost:5000/api/uploads/${url}`;
  };

  const gridBlogs = featured ? blogs.filter(b => b.id !== featured.id) : blogs;

  return (
    <div className="min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at 15% 10%, #3d1500 0%, #1a0800 50%, #080400 100%)', fontFamily: "'Georgia', serif" }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-amber-100"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.05,
            }} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <p className="text-amber-600/50 text-xs tracking-[0.3em] uppercase mb-2">ॐ ज्ञान का प्रकाश</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3"
            style={{ background: 'linear-gradient(135deg,#fcd34d,#f59e0b,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Vedic Gyan Bhandar
          </h1>
          <p className="text-amber-500/60 text-sm">Jyotish · Vastu · Puja Vidhi · Upay</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-6">
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Blog dhundhen..."
              className="w-full bg-black/30 border border-amber-800/40 rounded-full px-5 py-3 text-amber-100 placeholder-amber-800/60 focus:outline-none focus:border-amber-500 text-sm pr-10"
            />
            <span className="absolute right-4 top-3 text-amber-700">🔍</span>
          </div>
        </div>

        {/* ── Category Filter ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-7">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border
                ${active === cat
                  ? 'bg-amber-600 text-white border-amber-500 shadow-lg'
                  : 'bg-black/30 text-amber-500/70 border-amber-800/40 hover:border-amber-600/50 hover:text-amber-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="animate-spin inline-block w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full" />
            <p className="text-amber-600/60 text-sm">Blogs load ho rahe hain...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-300 font-semibold mb-1">{error}</p>
            <button onClick={() => { setActive("All"); setSearchInput(""); }}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }}>
              Dobara Try Karein
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Featured Post ── */}
            {featured && (
              <div className="mb-10">
                <p className="text-amber-600/50 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-8 h-px bg-amber-700/50 inline-block" />
                  Featured
                  <span className="w-8 h-px bg-amber-700/50 inline-block" />
                </p>
                <div
                  className="relative rounded-2xl overflow-hidden cursor-pointer group min-h-[220px]"
                  onClick={() => navigate(`/blogs/${featured.id}`)}
                  style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
                >
                  {buildImageUrl(featured.image_url) ? (
                    <img
                      src={buildImageUrl(featured.image_url)}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-amber-900/60" />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.78))' }} />

                  <div className="relative p-7 md:p-10 flex flex-col justify-end min-h-[220px]">
                    <div className="flex items-center gap-2 mb-3">
                      {featured.category && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-amber-200 border border-amber-500/30">
                          {featured.category}
                        </span>
                      )}
                      {featured.tag && (
                        <span className="text-xs px-3 py-1 rounded-full bg-black/30 text-amber-300/70 border border-amber-800/30">
                          {featured.tag}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug group-hover:text-amber-200 transition-colors">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-amber-100/70 text-sm leading-relaxed mb-5 max-w-2xl line-clamp-2">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 text-xs text-amber-300/60 flex-wrap">
                        {featured.author    && <span>✍️ {featured.author}</span>}
                        {featured.created_at && <span>📅 {new Date(featured.created_at).toLocaleDateString('hi-IN')}</span>}
                        {featured.read_time && <span>⏱ {featured.read_time} read</span>}
                        {featured.views > 0 && <span>👁 {featured.views}</span>}
                      </div>
                      <span className="text-xs font-bold px-4 py-2 rounded-full text-white"
                        style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }}>
                        Padhen →
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
                <p className="text-amber-500/60">No blogs found.</p>
                <button onClick={() => { setActive("All"); setSearchInput(""); }}
                  className="mt-4 text-xs text-amber-600 hover:text-amber-400 underline">
                  Reset All
                </button>
              </div>
            )}

            {/* ── Blog Grid ── */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

        <div className="text-center mt-16 text-amber-900/50 text-xs space-y-1">
          <p>🛕 Vedic Gyan Bhandar · Jyotish aur Dharma ka Prachar</p>
          <p>Har nirṇay ke liye yogya Jyotishi se salah lein.</p>
        </div>
      </div>
    </div>
  );
}

// ── Blog Card ─────────────────────────────────────────────────
function BlogCard({ blog, imageUrl, onRead }) {
  const GRADIENTS = [
    'from-red-900/80 to-amber-900/60',
    'from-emerald-900/80 to-teal-900/60',
    'from-amber-900/80 to-yellow-900/60',
    'from-violet-900/80 to-purple-900/60',
    'from-blue-900/80 to-indigo-900/60',
    'from-rose-900/80 to-red-900/60',
  ];
  const gradient = GRADIENTS[blog.id % GRADIENTS.length];

  return (
    <div
      onClick={onRead}
      className="group cursor-pointer rounded-2xl overflow-hidden border border-amber-800/30 hover:border-amber-600/50 transition-all duration-300 hover:-translate-y-1"
      style={{ background: 'rgba(20,8,0,0.6)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
    >
      {/* Image / Gradient top */}
      <div className="relative h-36 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl opacity-20">🛕</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,4,0,0.8))' }} />
        {blog.tag && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-amber-200">
              {blog.tag}
            </span>
          </div>
        )}
        {blog.read_time && (
          <div className="absolute top-3 right-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-amber-300/70">
              ⏱ {blog.read_time}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {blog.category && (
          <span className="text-xs text-amber-600/60 uppercase tracking-wider font-medium">
            {blog.category}
          </span>
        )}
        <h3 className="text-amber-100 font-bold text-sm mt-1 mb-2 leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="text-amber-100/50 text-xs leading-relaxed line-clamp-3 mb-4">
            {blog.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between border-t border-amber-800/20 pt-3">
          <div>
            {blog.author && <p className="text-amber-400/70 text-xs font-medium">{blog.author}</p>}
            {blog.created_at && (
              <p className="text-amber-700/50 text-xs">
                {new Date(blog.created_at).toLocaleDateString('hi-IN')}
              </p>
            )}
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg text-white group-hover:scale-105 transition-transform"
            style={{ background: 'linear-gradient(135deg,#d97706cc,#92400e88)' }}>
            Padhen →
          </span>
        </div>
      </div>
    </div>
  );
}