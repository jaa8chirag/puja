import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/${id}`);
        if (!res.ok) throw new Error('Blog nahi mila');
        const data = await res.json();
        // Backend response: { success: true, blog: {...} } ya seedha blog object
        setBlog(data.blog || data);
      } catch (e) {
        setError(e.message || 'Blog load karne mein error aaya');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  return (
    <div className="min-h-screen text-white"
      style={{ background: 'radial-gradient(ellipse at 15% 10%, #3d1500 0%, #1a0800 50%, #080400 100%)', fontFamily: "'Georgia', serif" }}>

      {/* Stars */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-amber-100"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.05,
            }} />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center gap-2 text-amber-500/70 hover:text-amber-300 transition-colors text-sm mb-8 group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Wapas Blogs par
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="animate-spin inline-block w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full" />
            <p className="text-amber-600/60 text-sm">Blog load ho raha hai...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-300 font-semibold mb-2">{error}</p>
            <button onClick={() => navigate('/blogs')}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#d97706,#92400e)' }}>
              Blogs par Wapas Jayen
            </button>
          </div>
        )}

        {/* Blog Content */}
        {blog && !loading && (
          <article>

            {/* ── Hero Section ── */}
            <div className="mb-8">
              {/* Category + Tag */}
              <div className="flex items-center gap-2 mb-4">
                {blog.category && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-900/50 border border-amber-700/40 text-amber-400">
                    {blog.category}
                  </span>
                )}
                {blog.tag && (
                  <span className="text-xs px-3 py-1 rounded-full bg-black/30 border border-amber-800/30 text-amber-600/70">
                    {blog.tag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ background: 'linear-gradient(135deg,#fcd34d,#f59e0b,#d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {blog.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-amber-600/60 pb-5 border-b border-amber-800/30">
                {blog.author && <span>✍️ {blog.author}</span>}
                {blog.date && <span>📅 {blog.date}</span>}
                {blog.readTime && <span>⏱ {blog.readTime} read</span>}
              </div>
            </div>

            {/* ── Featured Image ── */}
            {blog.image_url && (
              <div className="rounded-2xl overflow-hidden mb-8 border border-amber-800/30"
                style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
                <img
                  src={blog.image_url.startsWith('http') ? blog.image_url : `http://localhost:5000/api/uploads/${blog.image_url}`}
                  alt={blog.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* ── Blog Body ── */}
            <div className="bg-amber-950/20 border border-amber-800/20 rounded-2xl p-6 md:p-8">
              <BlogContent content={blog.content || blog.description || ''} />
            </div>

            {/* ── Share / Back ── */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-amber-800/30">
              <button onClick={() => navigate('/blogs')}
                className="flex items-center gap-2 text-amber-500/70 hover:text-amber-300 transition-colors text-sm group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Aur Blogs Padhen
              </button>
              <button
                onClick={() => { navigator.clipboard?.writeText(window.location.href); }}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-amber-800/40 text-amber-500/70 hover:border-amber-600/50 hover:text-amber-300 transition-all">
                🔗 Link Copy Karen
              </button>
            </div>

          </article>
        )}

        <div className="text-center mt-14 text-amber-900/50 text-xs">
          <p>🛕 Vedic Gyan Bhandar · Jyotish aur Dharma ka Prachar</p>
        </div>
      </div>
    </div>
  );
}

// ── Blog Content Renderer ─────────────────────────────────────
// Backend se aya hua content render karta hai
// Plain text, markdown-style headings, bullets sab handle karta hai
function BlogContent({ content }) {
  if (!content?.trim()) return (
    <p className="text-amber-700/50 text-sm italic">Content abhi available nahi hai.</p>
  );

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {content.split('\n').map((raw, i) => {
        const l = raw.trim();
        if (!l) return <div key={i} className="h-3" />;
        if (l.startsWith('## '))
          return <h2 key={i} className="text-amber-300 font-bold text-xl mt-6 mb-2 border-b border-amber-800/30 pb-2">{l.slice(3)}</h2>;
        if (l.startsWith('### '))
          return <h3 key={i} className="text-amber-400 font-semibold text-lg mt-5 mb-1">{l.slice(4)}</h3>;
        if (l.startsWith('#### '))
          return <h4 key={i} className="text-amber-500 font-medium text-base mt-4">{l.slice(5)}</h4>;
        if (/^[-*•]/.test(l))
          return (
            <div key={i} className="flex items-start gap-2 ml-4 my-1">
              <span className="text-amber-600 mt-1 shrink-0 text-xs">◆</span>
              <span className="text-amber-100/75">{l.replace(/^[-*•]\s+/, '')}</span>
            </div>
          );
        if (/^\d+\./.test(l)) {
          const num = l.match(/^(\d+)/)[1], rest = l.replace(/^\d+\.\s*/, '');
          return (
            <div key={i} className="flex items-start gap-3 ml-4 my-1">
              <span className="bg-amber-700/40 text-amber-300 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">{num}</span>
              <span className="text-amber-100/75">{rest}</span>
            </div>
          );
        }
        if (l === '---')
          return <hr key={i} className="border-amber-800/30 my-4" />;
        return <p key={i} className="text-amber-100/75 my-1.5">{l}</p>;
      })}
    </div>
  );
}