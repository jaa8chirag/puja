import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../Components/quill-content.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/${id}`);
        if (!res.ok) throw new Error('Blog nahi mila');
        const data = await res.json();
        setBlog(data.blog || data);
      } catch (e) {
        setError(e.message || 'Blog load karne mein error aaya');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF4E1] font-sans text-[#2D1A00]">

      {/* Top accent line */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #e8892200, #e88922 30%, #f59e0b 50%, #e88922 70%, #e8892200)' }} />

      {/* Subtle mandala bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.025]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='60' cy='60' r='55' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='40' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Ccircle cx='60' cy='60' r='25' fill='none' stroke='%23b45309' stroke-width='1'/%3E%3Cpath d='M60 5 L65 55 L60 115 L55 55 Z' fill='none' stroke='%23b45309' stroke-width='0.5'/%3E%3Cpath d='M5 60 L55 65 L115 60 L55 55 Z' fill='none' stroke='%23b45309' stroke-width='0.5'/%3E%3C/svg%3E")`, backgroundSize: '120px 120px' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">

        {/* Back Button */}
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center gap-2 text-orange-600/70 hover:text-orange-700 transition-colors text-sm mb-8 group font-semibold"
        >
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
          Back to Blog Page
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="animate-spin inline-block w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full" />
            <p className="text-orange-600/60 text-sm font-medium">Blog load ho raha hai...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button onClick={() => navigate('/blogs')}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors">
              Back to Blog
            </button>
          </div>
        )}

        {/* Blog Content */}
        {blog && !loading && (
          <article>

            {/* ── Hero Section ── */}
            <div className="mb-8">
              {/* Category + Tag */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {blog.category && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500 text-white shadow-sm">
                    {blog.category}
                  </span>
                )}
                {blog.tag && (
                  <span className="text-xs px-3 py-1 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-medium">
                    {blog.tag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-[#7c2d00]"
                style={{ fontFamily: "'Georgia', serif" }}>
                {blog.title}
              </h1>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-orange-200" />
                <span className="text-orange-400 text-sm">🛕</span>
                <div className="h-px flex-1 bg-orange-200" />
              </div>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-orange-700/60 font-medium pb-5 border-b border-orange-200">
                {blog.author && <span className="flex items-center gap-1">✍️ {blog.author}</span>}
                {blog.date && <span className="flex items-center gap-1">📅 {blog.date}</span>}
                {blog.created_at && !blog.date && (
                  <span className="flex items-center gap-1">📅 {new Date(blog.created_at).toLocaleDateString('hi-IN')}</span>
                )}
                {blog.readTime && <span className="flex items-center gap-1">⏱ {blog.readTime} read</span>}
                {blog.read_time && !blog.readTime && <span className="flex items-center gap-1">⏱ {blog.read_time}</span>}
                {blog.views > 0 && <span className="flex items-center gap-1">👁 {blog.views}</span>}
              </div>
            </div>

            {/* ── Featured Image ── */}
            {blog.image_url && (
              <div className="rounded-2xl overflow-hidden mb-8 border border-orange-200"
                style={{ boxShadow: '0 4px 24px rgba(180,83,9,0.12)' }}>
                <img
                  src={blog.image_url.startsWith('http') ? blog.image_url : blog.image_url.startsWith('/uploads/') ? `${API_BASE_URL.replace('/api', '')}${blog.image_url}` : `${API_BASE_URL}/uploads/${blog.image_url}`}
                  alt={blog.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
              </div>
            )}

            {/* ── Blog Body ── */}
            <div className="bg-white rounded-2xl border border-orange-200 p-6 md:p-8"
              style={{ boxShadow: '0 2px 16px rgba(180,83,9,0.06)' }}>
              {blog.excerpt && (
                <p className="text-lg font-medium text-orange-900/80 mb-6 italic leading-relaxed border-l-4 border-orange-300 pl-4">
                  {blog.excerpt}
                </p>
              )}
              <BlogContent content={blog.content || blog.description || ''} />
            </div>

            {/* ── Share / Back ── */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-orange-200">
              <button onClick={() => navigate('/blogs')}
                className="flex items-center gap-2 text-orange-600/70 hover:text-orange-700 transition-colors text-sm group font-semibold">
                <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
                Read more Blogs
              </button>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border font-semibold transition-all
                  ${copied
                    ? 'border-green-400 text-green-700 bg-green-50'
                    : 'border-orange-200 text-orange-600/70 hover:border-orange-400 hover:text-orange-700 bg-white hover:bg-orange-50'}`}>
                {copied ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
            </div>

          </article>
        )}

        <div className="text-center mt-14 pb-4">
          <div className="h-px w-32 mx-auto bg-orange-200 mb-4" />
          <p className="text-orange-700/40 text-xs font-medium">🛕 Vedic Gyan Bhandar · Jyotish aur Dharma ka Prachar</p>
        </div>
      </div>
    </div>
  );
}

// ── Blog Content Renderer ─────────────────────────────────────
function BlogContent({ content }) {
  if (!content?.trim()) return (
    <p className="text-orange-400/60 text-sm italic">Content not available.</p>
  );

  // Check if content contains HTML tags (likely from Quill)
  const containsHTML = /<\/?[a-z][\s\S]*>/i.test(content);

  if (containsHTML) {
    return (
      <div
        className="quill-content text-sm leading-relaxed"
        style={{ fontFamily: "'Georgia', serif" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed" style={{ fontFamily: "'Georgia', serif" }}>
      {content.split('\n').map((raw, i) => {
        const l = raw.trim();
        if (!l) return <div key={i} className="h-3" />;

        if (l.startsWith('## '))
          return (
            <h2 key={i} className="text-[#7c2d00] font-bold text-xl mt-6 mb-2 pb-2 border-b border-orange-200"
              style={{ fontFamily: "'Georgia', serif" }}>
              {l.slice(3)}
            </h2>
          );
        if (l.startsWith('### '))
          return (
            <h3 key={i} className="text-orange-700 font-semibold text-lg mt-5 mb-1"
              style={{ fontFamily: "'Georgia', serif" }}>
              {l.slice(4)}
            </h3>
          );
        if (l.startsWith('#### '))
          return (
            <h4 key={i} className="text-orange-600 font-medium text-base mt-4"
              style={{ fontFamily: "'Georgia', serif" }}>
              {l.slice(5)}
            </h4>
          );

        if (/^[-*•]/.test(l))
          return (
            <div key={i} className="flex items-start gap-2 ml-4 my-1">
              <span className="text-orange-500 mt-1.5 shrink-0 text-[8px]">◆</span>
              <span className="text-[#3d1500]/80">{l.replace(/^[-*•]\s+/, '')}</span>
            </div>
          );

        if (/^\d+\./.test(l)) {
          const num = l.match(/^(\d+)/)[1];
          const rest = l.replace(/^\d+\.\s*/, '');
          return (
            <div key={i} className="flex items-start gap-3 ml-4 my-1">
              <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">
                {num}
              </span>
              <span className="text-[#3d1500]/80">{rest}</span>
            </div>
          );
        }

        if (l === '---')
          return <hr key={i} className="border-orange-200 my-4" />;

        return (
          <p key={i} className="text-[#3d1500]/75 my-1.5 leading-7">{l}</p>
        );
      })}
    </div>
  );
}