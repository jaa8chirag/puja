import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { LifeBuoy } from "lucide-react";

export default function AIPanditBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);

  const connectSocket = () => {
    // ✅ Smart URL: Local pe VITE_SOCKET_URL use karega, Server pe relative path
    const socketUrl = window.location.hostname === "localhost" 
      ? import.meta.env.VITE_SOCKET_URL.replace(/\/$/, "") 
      : "";

    socketRef.current = io(`${socketUrl}/pandit`, {
      path: "/socket.io/",
      transports: ["polling"],
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      setMessages([
        {
          text: "🙏 Om Namah Shivay! I am the Pandit Ji of Sri Vedic Puja Kendra.",
          sender: "bot",
        },
      ]);
    });

    socketRef.current.on("ai_response", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setIsTyping(false);
    });

    socketRef.current.on("disconnect", () => setConnected(false));
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setMessages([]);
      setConnected(false);
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      connectSocket();
    } else {
      setIsOpen(false);
      disconnectSocket();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping || !connected) return;
    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userText, sender: "user" }]);
    socketRef.current.emit("ai_query", { text: userText });
    setIsTyping(true);
  };

  const formatText = (text) =>
    text.split("\n").map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));

  // ── Puja Cards Component ─────────────────────────────────
  const PujaCards = ({ cards }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "6px",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            background: "linear-gradient(135deg, #fffbf0, #fff8e1)",
            border: `1px solid ${card.severity === "HIGH" ? "#fca5a5" : card.severity === "MODERATE" ? "#fcd34d" : "#86efac"}`,
            borderRadius: "16px",
            padding: "14px",
            boxShadow: "0 2px 12px rgba(120,53,15,0.08)",
          }}
        >
          {/* Dosha name + severity badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <div
              style={{ fontSize: "14px", fontWeight: "700", color: "#78350f" }}
            >
              {card.doshaName}
            </div>
            <div
              style={{
                background:
                  card.severity === "HIGH"
                    ? "#fee2e2"
                    : card.severity === "MODERATE"
                      ? "#fef3c7"
                      : "#f0fdf4",
                color:
                  card.severity === "HIGH"
                    ? "#b91c1c"
                    : card.severity === "MODERATE"
                      ? "#92400e"
                      : "#166534",
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "20px",
              }}
            >
              {card.severity}
            </div>
          </div>

          {/* Urgency line */}
          <div
            style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}
          >
            {card.urgency}
          </div>

          {/* One-line reason */}
          <div
            style={{ fontSize: "12px", color: "#b45309", fontWeight: "600", marginBottom: "8px", fontStyle: "italic" }}
          >
            Purpose: {card.reason}
          </div>

          {/* Puja name */}
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#92400e",
              marginBottom: "4px",
            }}
          >
            🪔{" "}
            {card.pujaName
              ?.split(" ")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </div>

          {/* Price */}
          {card.price && (
            <div
              style={{
                fontSize: "12px",
                color: "#15803d",
                fontWeight: "600",
                marginBottom: "10px",
              }}
            >
              💰 {card.price}
            </div>
          )}

          {/* Book button */}
          <button
            onClick={() => (window.location.href = card.bookingUrl)}
            style={{
              background:
                card.severity === "HIGH"
                  ? "linear-gradient(135deg, #dc2626, #991b1b)"
                  : card.severity === "MODERATE"
                    ? "linear-gradient(135deg, #d97706, #92400e)"
                    : "linear-gradient(135deg, #16a34a, #14532d)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "9px 16px",
              cursor: "pointer",
              width: "100%",
              fontSize: "13px",
              fontWeight: "700",
              boxShadow: "0 4px 12px rgba(120,53,15,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.filter = "brightness(1.15)")}
            onMouseLeave={(e) => (e.target.style.filter = "brightness(1)")}
          >
            {card.severity === "HIGH"
              ? "🔴 Book Now — Urgent"
              : card.severity === "MODERATE"
                ? "🟡 Book Puja"
                : "🟢 Book Puja"}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[9999] pf">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600;700&display=swap');
        .pf { font-family: 'Noto Serif Devanagari', Georgia, serif; }
        .scroll-area::-webkit-scrollbar { width: 3px; }
        .scroll-area::-webkit-scrollbar-thumb { background: #78350f; border-radius: 10px; }

        @media (max-width: 640px) {
          .chat-window {
            position: fixed !important;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
          }
        }
      `}</style>

      {/* 🔱 Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="group relative flex items-center justify-center p-2 rounded-full transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 ring-offset-orange-50"
          aria-label="Connect with Pandit Ji"
        >
          {/* 1. Bahut Halka Saffron Aura (Soft Glow) */}
          <div className="absolute inset-0 bg-orange-600/10 rounded-full animate-pulse blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          {/* 2. Soft Outer Pulse (Border Only) */}
          <div className="absolute inset-[-4px] rounded-full border border-orange-500/10 group-hover:border-orange-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* 3. Main Premium Picture Container */}
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-orange-500 to-orange-700 rounded-full p-[3px] shadow-2xl transition-all duration-700 ease-out border-2 border-orange-600 group-hover:border-orange-800 group-hover:scale-110 group-hover:shadow-[0_15px_40px_rgba(194,65,12,0.4)]">

            {/* Inner Saffron Ring */}
            <div className="w-full h-full rounded-full border-2 border-orange-700/50 group-hover:border-orange-900 transition-colors duration-500 overflow-hidden relative bg-orange-50">

              {/* 4. The Real Pandit Ji Photograph (Aapki Vector Image) */}
              <img
                src="https://www.creativehatti.com/wp-content/uploads/2022/12/Pandit-ji-vector-mascot-logo-template-23-small.jpg"
                alt="Pandit Ji Avatar"
                // YAHAN BADLAV KIYE HAIN:
                // 1. 'scale-125' joda gaya hai image ko 25% zoom karne ke liye.
                // 2. 'group-hover:scale-135' lagaya hai taaki hover par aur 10% zoom ho.
                className="w-full h-full object-cover scale-125 grayscale-[10%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-135"
              />

              {/* 5. Subtle Orange Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-950/20 via-transparent to-orange-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-700"></div>
            </div>

            {/* 6. Shubh Tilak Dot (Status Indicator) */}
            <div className="absolute top-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-lg"></div>
          </div>

          {/* Glossy Overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/10 via-transparent to-transparent opacity-40"></div>
        </button>
      )}

      {/* 🔱 Chat Window */}
      {isOpen && (
        <div className="chat-window w-[360px] md:w-[420px] h-[600px] md:h-[600px] flex flex-col rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-[5px] border-amber-900/30 bg-[#fffdf7] animate-in zoom-in-95 duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#78350f] to-[#b45309] px-4 md:px-6 py-4 md:py-5 text-white flex justify-between items-center shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/20 overflow-hidden shadow-inner flex-shrink-0">
                <img
                  src="https://www.creativehatti.com/wp-content/uploads/2022/12/Pandit-ji-vector-mascot-logo-template-23-small.jpg"
                  alt="Pandit Ji"
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <div>
                <h2 className="font-bold text-lg md:text-xl leading-none">
                  Smart Pandit Ji
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-red-400"}`}
                  ></div>
                  <span className="text-[10px] uppercase font-bold text-amber-100">
                    Live
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 md:px-5 py-5 md:py-6 space-y-5 md:space-y-6 scroll-area bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"} items-end`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[85%] px-4 md:px-5 py-3 md:py-4 rounded-[1.8rem] text-[14px] md:text-[15px] leading-relaxed shadow-sm pf ${m.sender === "user"
                    ? "bg-[#78350f] text-amber-50 rounded-br-none"
                    : "bg-white text-slate-800 rounded-tl-none border-l-[6px] border-amber-600 shadow-amber-900/5"
                    }`}
                >
                  {/* Normal text */}
                  {formatText(m.text)}

                  {/* Puja Cards — sirf tab dikhao jab pujaCards array ho */}
                  {m.pujaCards && m.pujaCards.length > 0 && (
                    <PujaCards cards={m.pujaCards} />
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-1.5 px-4 py-3 rounded-2xl bg-amber-100/50 w-fit">
                <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-amber-700 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 md:p-5 bg-white border-t border-amber-100 flex gap-2 md:gap-3 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question here..."
              className="flex-1 bg-amber-50/50 border border-amber-100 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[14px] md:text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-600/20 pf"
            />
            <button
              onClick={handleSend}
              disabled={!connected || isTyping || !input.trim()}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#78350f] flex items-center justify-center text-white shadow-lg shadow-amber-900/30 hover:brightness-125 transition-all disabled:opacity-30 flex-shrink-0"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
