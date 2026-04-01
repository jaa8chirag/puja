import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Users,
  BookOpen,
  UserCheck,
  LayoutDashboard,
  LogOut,
  Search,
  Menu,
  X,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Headphones,
  Loader2,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Tag,
  AlignLeft,
  CheckCheck,
  ChartArea,
  Send,
  MessageCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

/* ── Status configs ── */
const STATUS_CFG = {
  pending: {
    badge: "bg-amber-400/10 text-amber-400 border border-amber-400/25",
    dot: "bg-amber-400",
  },
  accepted: {
    badge: "bg-violet-400/10 text-violet-400 border border-violet-400/25",
    dot: "bg-violet-400",
  },
  completed: {
    badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25",
    dot: "bg-emerald-400",
  },
  declined: {
    badge: "bg-rose-400/10 text-rose-400 border border-rose-400/25",
    dot: "bg-rose-400",
  },
};
const getStatus = (s) =>
  STATUS_CFG[s?.toLowerCase()] || {
    badge: "bg-slate-700 text-slate-400 border border-slate-600",
    dot: "bg-slate-500",
  };

const QUERY_STATUS_CFG = {
  Open: {
    badge: "bg-amber-400/10 text-amber-400 border border-amber-400/25",
    dot: "bg-amber-400",
  },
  Resolved: {
    badge: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/25",
    dot: "bg-emerald-400",
  },
  Closed: {
    badge: "bg-slate-500/10 text-slate-400 border border-slate-500/25",
    dot: "bg-slate-500",
  },
};
const getQueryStatus = (s) =>
  QUERY_STATUS_CFG[s] || {
    badge: "bg-slate-700 text-slate-400 border border-slate-600",
    dot: "bg-slate-500",
  };

/* ── Small reusables ── */
const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};
const QueryStatusBadge = ({ status }) => {
  const cfg = getQueryStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
};
const IdBadge = ({ id }) => (
  <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2 py-0.5 rounded-md">
    #{id}
  </span>
);

const StatCard = ({ label, value, icon, gradient, iconColor }) => (
  <div
    className={`rounded-2xl border border-white/5 p-4 md:p-5 bg-gradient-to-br ${gradient} hover:-translate-y-0.5 transition-transform duration-200`}
  >
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 border ${iconColor.bg} ${iconColor.border}`}
    >
      <span className={iconColor.text}>{icon}</span>
    </div>
    <div className="font-mono text-2xl md:text-3xl font-bold text-slate-100 tracking-tight leading-none mb-1">
      {value}
    </div>
    <div className="text-[10px] md:text-[11px] text-slate-500 font-medium uppercase tracking-wider">
      {label}
    </div>
  </div>
);

const TableCard = ({ title, count, children }) => (
  <div className="bg-gradient-to-br from-[#0d1829] to-[#080f1c] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/[0.04]">
      <span className="text-sm font-bold text-slate-200 tracking-tight">
        {title}
      </span>
      <span className="font-mono text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/15 px-2.5 py-1 rounded-full">
        {count}
      </span>
    </div>
    {children}
  </div>
);

const LoadingRow = ({ cols }) => (
  <tr>
    <td colSpan={cols} className="py-16 text-center">
      <Loader2
        size={22}
        className="animate-spin text-blue-500/50 mx-auto mb-2"
      />
      <span className="text-xs text-slate-600">Loading...</span>
    </td>
  </tr>
);
const Th = ({ children, center }) => (
  <th
    className={`px-4 md:px-5 py-3.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap ${center ? "text-center" : "text-left"}`}
  >
    {children}
  </th>
);

/* ════════════════════════════════════════════
   TOAST COMPONENT
════════════════════════════════════════════ */
const ToastNotification = ({ toasts }) => {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold text-white"
          style={{
            animation: "toastSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            background:
              toast.type === "new-session"
                ? "linear-gradient(135deg, #7c3aed, #4f46e5)"
                : "linear-gradient(135deg, #1d4ed8, #4338ca)",
            borderColor:
              toast.type === "new-session"
                ? "rgba(167,139,250,0.3)"
                : "rgba(96,165,250,0.3)",
            boxShadow:
              toast.type === "new-session"
                ? "0 8px 32px rgba(124,58,237,0.4)"
                : "0 8px 32px rgba(29,78,216,0.4)",
          }}
        >
          <span className="text-xl flex-shrink-0">
            {toast.type === "new-session" ? "🧑" : "💬"}
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider opacity-70 mb-0.5">
              {toast.type === "new-session" ? "New User" : "New Message From:"}
            </p>
            <p className="text-[13px] truncate">{toast.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════
   CHAT SUPPORT PANEL
════════════════════════════════════════════ */
const ChatSupportPanel = ({
  token,
  globalSocket,
  initialSessions,
  initialMessages,
  onSessionsChange,
  onMessagesChange,
}) => {
  const socketRef = useRef(globalSocket);

  // Dashboard se aaye hue sessions/messages se initialize karo — tab events miss nahi honge
  const [sessions, setSessions] = useState(initialSessions || []);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState(initialMessages || {});
  const [inputText, setInputText] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(
    globalSocket?.connected || false,
  );
  const [unread, setUnread] = useState({});
  const [mobileView, setMobileView] = useState("list");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Sirf mount pe ek baar initial data set karo — baad mein socket events khud update karenge
  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current) {
      didInit.current = true;
      if (initialSessions?.length) setSessions(initialSessions);
      if (Object.keys(initialMessages || {}).length)
        setMessages(initialMessages);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeSessionId]);

  useEffect(() => {
    const socket = globalSocket;
    if (!socket) return;

    socketRef.current = socket;
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onSessions = (existing) => {
      setSessions(existing);
      onSessionsChange?.(existing);
      const msgs = {};
      existing.forEach((s) => {
        msgs[s.sessionId] = s.messages || [];
      });
      setMessages(msgs);
      onMessagesChange?.(msgs);
    };

    const onNewSession = (session) => {
      setSessions((prev) => {
        const updated = prev.find((s) => s.sessionId === session.sessionId)
          ? prev
          : [session, ...prev];
        onSessionsChange?.(updated);
        return updated;
      });
      setMessages((prev) => {
        if (prev[session.sessionId]) return prev;
        const updated = { ...prev, [session.sessionId]: [] };
        onMessagesChange?.(updated);
        return updated;
      });
      setUnread((prev) => ({ ...prev, [session.sessionId]: true }));
    };

    const onSessionUpdated = (session) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.sessionId === session.sessionId ? session : s,
        );
        onSessionsChange?.(updated);
        return updated;
      });
    };

    const onMessage = (msg) => {
      setMessages((prev) => {
        const existing = prev[msg.sessionId] || [];
        if (existing.find((m) => m.id === msg.id)) return prev;
        const updated = { ...prev, [msg.sessionId]: [...existing, msg] };
        onMessagesChange?.(updated);
        return updated;
      });
      if (msg.senderType === "user")
        setUnread((prev) => ({ ...prev, [msg.sessionId]: true }));
    };

    const onTypingShow = ({ senderType }) => {
      if (senderType === "user") setUserTyping(true);
    };
    const onTypingHide = () => setUserTyping(false);
    const onSessionClosed = ({ sessionId }) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.sessionId === sessionId ? { ...s, status: "closed" } : s,
        );
        onSessionsChange?.(updated);
        return updated;
      });
    };

    const onAgentHistory = ({ sessionId, messages: historyMsgs }) => {
      setMessages((prev) => {
        const existing = prev[sessionId] || [];
        const merged = [...historyMsgs];
        existing.forEach((m) => {
          if (!merged.find((hm) => hm.id === m.id)) merged.push(m);
        });
        merged.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const updated = { ...prev, [sessionId]: merged };
        onMessagesChange?.(updated);
        return updated;
      });
    };

    socket.on("agent:history", onAgentHistory);

    // cleanup mein bhi:
    socket.off("agent:history", onAgentHistory);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("agent:sessions", onSessions);
    socket.on("agent:new-session", onNewSession);
    socket.on("agent:session-updated", onSessionUpdated);
    socket.on("message:received", onMessage);
    socket.on("typing:show", onTypingShow);
    socket.on("typing:hide", onTypingHide);
    socket.on("session:closed", onSessionClosed);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("agent:sessions", onSessions);
      socket.off("agent:new-session", onNewSession);
      socket.off("agent:session-updated", onSessionUpdated);
      socket.off("message:received", onMessage);
      socket.off("typing:show", onTypingShow);
      socket.off("typing:hide", onTypingHide);
      socket.off("session:closed", onSessionClosed);
    };
  }, [globalSocket]);

  const acceptSession = (sessionId) => {
    socketRef.current.emit("agent:accept-session", { sessionId });
    setActiveSessionId(sessionId);
    setUnread((prev) => ({ ...prev, [sessionId]: false }));
    setMobileView("chat");
  };

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setUnread((prev) => ({ ...prev, [sessionId]: false }));
    setMobileView("chat");
  };

  const sendMessage = useCallback(() => {
    const session = sessions.find((s) => s.sessionId === activeSessionId);
    if (!inputText.trim() || !activeSessionId || session?.status !== "active")
      return;
    socketRef.current.emit("message:send", {
      sessionId: activeSessionId,
      text: inputText.trim(),
    });
    setInputText("");
    socketRef.current.emit("typing:stop", { sessionId: activeSessionId });
  }, [inputText, activeSessionId, sessions]);

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!activeSessionId) return;
    socketRef.current.emit("typing:start", {
      sessionId: activeSessionId,
      senderType: "agent",
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(
      () =>
        socketRef.current?.emit("typing:stop", { sessionId: activeSessionId }),
      1500,
    );
  };

  const closeSession = () => {
    if (!activeSessionId) return;
    socketRef.current.emit("session:close", { sessionId: activeSessionId });
  };

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId);
  const activeMessages = activeSessionId ? messages[activeSessionId] || [] : [];
  const waitingCount = sessions.filter((s) => s.status === "waiting").length;

  const statusBadge = {
    waiting: "bg-amber-400/10 text-amber-400 border-amber-400/25",
    active: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
    closed: "bg-slate-500/10 text-slate-400 border-slate-500/25",
  };
  const statusDot = {
    waiting: "bg-amber-400",
    active: "bg-emerald-400",
    closed: "bg-slate-500",
  };
  const statusLabel = { waiting: "Wait", active: "Live", closed: "Close" };

  /* ── Sessions List ── */
  const SessionsList = () => (
    <div
      className={`flex flex-col bg-gradient-to-br from-[#0d1829] to-[#080f1c] border border-white/5 rounded-2xl overflow-hidden w-full md:w-72 md:flex-shrink-0 ${mobileView === "chat" ? "hidden md:flex" : "flex"} md:h-[calc(100vh-10rem)]`}
    >
      <div className="px-5 py-4 border-b border-white/[0.04] bg-gradient-to-r from-blue-500/[0.08] to-indigo-500/[0.05]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-blue-400" />
            <span className="text-sm font-bold text-slate-200">Live Chats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-rose-400"}`}
              style={isConnected ? { boxShadow: "0 0 6px #4ade80" } : {}}
            />
            <span className="text-[10px] text-slate-500">
              {isConnected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          {[
            {
              label: "Total",
              count: sessions.length,
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              label: "Live",
              count: sessions.filter((s) => s.status === "active").length,
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              label: "Wait",
              count: waitingCount,
              color: "text-amber-400",
              bg: "bg-amber-500/10 border-amber-500/20",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`flex-1 text-center py-1.5 rounded-lg border ${s.bg}`}
            >
              <div className={`font-mono text-base font-bold ${s.color}`}>
                {s.count}
              </div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 py-16">
            <MessageSquare size={32} className="opacity-40" />
            <span className="text-xs">No users found.</span>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.sessionId}
              onClick={() => selectSession(session.sessionId)}
              className={`px-4 py-3.5 cursor-pointer border-b border-white/[0.03] transition-all duration-150 ${activeSessionId === session.sessionId ? "bg-blue-500/[0.08] border-l-2 border-l-blue-500" : "hover:bg-white/[0.02] border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 flex items-center justify-center font-bold text-blue-300 text-[13px]">
                      {session.userName.charAt(0).toUpperCase()}
                    </div>
                    {unread[session.sessionId] && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#080f1c]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-200 truncate">
                      {session.userName}
                    </p>
                    <p className="text-[10px] text-slate-600">
                      {new Date(session.startedAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ml-1 ${statusBadge[session.status] || "bg-slate-700 text-slate-400 border-slate-600"}`}
                >
                  {statusLabel[session.status]}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  /* ── Chat Window ── */
  const ChatWindow = () => {
    const inputRef = useRef(null);
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    return (
      <div
        className={`flex flex-col flex-1 min-w-0 bg-gradient-to-br from-[#0d1829] to-[#080f1c] border border-white/5 rounded-2xl overflow-hidden md:h-[calc(100vh-10rem)] ${mobileView === "list" ? "hidden md:flex" : "flex"}`}
      >
        {activeSession ? (
          <>
            {/* Header */}
            <div className="px-4 md:px-6 py-4 border-b border-white/[0.04] flex items-center justify-between bg-[#05080f]/40 flex-shrink-0 gap-2">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex-shrink-0"
                >
                  <ChevronRight size={14} className="rotate-180" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border border-blue-500/20 flex items-center justify-center font-bold text-blue-300 text-[15px] flex-shrink-0">
                  {activeSession.userName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-200 truncate">
                    {activeSession.userName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {activeSession.userEmail || activeSession.sessionId}
                  </p>
                </div>
                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ml-1 ${statusBadge[activeSession.status] || ""}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${statusDot[activeSession.status]}`}
                  />
                  {activeSession.status === "active"
                    ? "Live"
                    : activeSession.status === "waiting"
                      ? "Waiting"
                      : "Close"}
                </span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {activeSession.status === "waiting" && (
                  <button
                    onClick={() => acceptSession(activeSession.sessionId)}
                    className="flex items-center gap-1 md:gap-1.5 px-3 py-2 rounded-xl text-[11px] md:text-[12px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                  >
                    <CheckCircle size={12} /> Accept
                  </button>
                )}
                {activeSession.status === "active" && (
                  <button
                    onClick={closeSession}
                    className="flex items-center gap-1 md:gap-1.5 px-3 py-2 rounded-xl text-[11px] md:text-[12px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                  >
                    <XCircle size={12} /> End
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 flex flex-col gap-3 bg-[#060d1a]/30">
              {activeMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-600 gap-3 mt-16">
                  <MessageSquare size={36} className="opacity-30" />
                  <span className="text-xs">No message yet.</span>
                  {activeSession.status === "waiting" && (
                    <span className="text-[11px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-center">
                      Accept to start the chat.
                    </span>
                  )}
                </div>
              )}
              {activeMessages.map((msg) =>
                msg.type === "system" ? (
                  <div
                    key={msg.id}
                    className="text-center text-[11px] text-blue-400/70 bg-blue-500/[0.06] border border-blue-500/15 px-4 py-1.5 rounded-full mx-auto"
                  >
                    {msg.text}
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 md:gap-2.5 ${msg.senderType === "agent" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${msg.senderType === "agent" ? "bg-blue-500/20 border border-blue-500/30 text-blue-300" : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300"}`}
                    >
                      {msg.senderType === "agent" ? (
                        <Headphones size={13} />
                      ) : (
                        msg.senderName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] md:max-w-[65%] flex flex-col ${msg.senderType === "agent" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`px-3 md:px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed break-words ${msg.senderType === "agent" ? "bg-gradient-to-br from-blue-600/80 to-indigo-600/80 text-white rounded-br-sm border border-blue-500/30" : "bg-[#0d1829] border border-white/[0.06] text-slate-200 rounded-bl-sm"}`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-600 mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ),
              )}
              {userTyping && (
                <p className="text-[11px] text-slate-500 italic px-1">
                  {activeSession.userName} likh raha hai...
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-white/[0.04] flex gap-2 md:gap-3 bg-[#05080f]/60 flex-shrink-0">
              <input
                ref={inputRef}
                value={inputText}
                onChange={handleTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                disabled={activeSession?.status !== "active"}
                placeholder={
                  activeSession?.status === "active"
                    ? "Reply likhein..."
                    : activeSession?.status === "waiting"
                      ? "Accept the chat first..."
                      : "The chat is over."
                }
                className="flex-1 bg-[#0a1220] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/30 disabled:opacity-40 transition"
              />
              <button
                onClick={sendMessage}
                disabled={
                  activeSession?.status !== "active" || !inputText.trim()
                }
                className="flex items-center gap-1.5 px-4 md:px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-500/30 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[0_4px_15px_rgba(59,130,246,0.2)]"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Bhejo</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
            <MessageSquare size={40} className="opacity-20" />
            <span className="text-sm">Koi session select karein</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <SessionsList />
      <ChatWindow />
      <style>{`@keyframes ccBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }`}</style>
    </div>
  );
};

/* ════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════ */
const CustomerCareDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pandits, setPandits] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [panditSearch, setPanditSearch] = useState("");
  const [assignPrice, setAssignPrice] = useState();
  const [queries, setQueries] = useState([]);
  const [queryPage, setQueryPage] = useState(1);
  const [queryTotalPages, setQueryTotalPages] = useState(1);
  const [queryTotal, setQueryTotal] = useState(0);
  const [queryStatusFilter, setQueryStatusFilter] = useState("");
  const [querySearch, setQuerySearch] = useState("");
  const [queryActionLoading, setQueryActionLoading] = useState(null);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [selectedPanditPrice, setSelectedPanditPrice] = useState({});

  // ── Global notification + socket state ──
  const [toasts, setToasts] = useState([]);
  const [chatBadgeCount, setChatBadgeCount] = useState(0);
  const [globalSocket, setGlobalSocket] = useState(null);

  // ── Sessions + messages dashboard level pe store — tab ChatSupportPanel mount ho tab miss na ho ──
  const [chatSessions, setChatSessions] = useState([]);
  const [chatMessages, setChatMessages] = useState({});

  const toastIdRef = useRef(0);
  const activeTabRef = useRef("overview");

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const navigate = useNavigate();

  // ── Toast add / auto remove ──
  const addToast = useCallback((message, type) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4500,
    );
  }, []);

  // ── Global socket — poori dashboard lifetime chalega ──
  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token }, transports: ["polling"] });
    setGlobalSocket(socket);

    // Existing sessions — dashboard level pe store karo taaki ChatSupportPanel mount hone pe miss na ho
    socket.on("agent:sessions", (existing) => {
      setChatSessions(existing);
      const msgs = {};
      existing.forEach((s) => {
        msgs[s.sessionId] = s.messages || [];
      });
      setChatMessages(msgs);
    });

    // Naya user aaya
    socket.on("agent:new-session", (session) => {
      setChatSessions((prev) =>
        prev.find((s) => s.sessionId === session.sessionId)
          ? prev
          : [session, ...prev],
      );
      setChatMessages((prev) => ({ ...prev, [session.sessionId]: [] }));
      if (activeTabRef.current !== "chatsupport") {
        setChatBadgeCount((prev) => prev + 1);
        addToast(`${session.userName} ne chat shuru ki`, "new-session");
      }
    });

    // Session updated
    socket.on("agent:session-updated", (session) => {
      setChatSessions((prev) =>
        prev.map((s) => (s.sessionId === session.sessionId ? session : s)),
      );
    });

    // Naya message aaya
    socket.on("message:received", (msg) => {
      setChatMessages((prev) => {
        const existing = prev[msg.sessionId] || [];
        if (existing.find((m) => m.id === msg.id)) return prev;
        return { ...prev, [msg.sessionId]: [...existing, msg] };
      });
      if (msg.senderType === "user" && activeTabRef.current !== "chatsupport") {
        setChatBadgeCount((prev) => prev + 1);
        addToast(
          `${msg.senderName}: ${msg.text.slice(0, 40)}${msg.text.length > 40 ? "..." : ""}`,
          "message",
        );
      }
    });

    // Session closed
    socket.on("session:closed", ({ sessionId }) => {
      setChatSessions((prev) =>
        prev.map((s) =>
          s.sessionId === sessionId ? { ...s, status: "closed" } : s,
        ),
      );
    });

    return () => socket.disconnect();
  }, [token]);

  // ── activeTab change hone pe ref bhi update karo ──
  const handleTabChange = (tabId) => {
    activeTabRef.current = tabId;
    setActiveTab(tabId);
    if (tabId === "chatsupport") setChatBadgeCount(0); // badge reset
    setIsSidebarOpen(false);
  };

  /* ── Fetchers ── */
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customerCare/dashboard`,
        config,
      );
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchPandits = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customerCare/allPandits`,
        config,
      );
      setPandits(res.data.pandits || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/customerCare/allUsers`,
        config,
      );
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchQuery = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/customerCare/support-queries?page=${queryPage}&limit=10`;
      if (queryStatusFilter) url += `&status=${queryStatusFilter}`;
      const res = await axios.get(url, config);
      setQueries(res.data.queries || []);
      setQueryTotal(res.data.total || 0);
      setQueryTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "pujas") fetchBookings();
    if (activeTab === "pandits") fetchPandits();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "querys") fetchQuery();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "querys") fetchQuery();
  }, [queryPage, queryStatusFilter]);
  useEffect(() => {
    if (assignModalOpen) fetchPandits();
  }, [assignModalOpen]);

  /* ── Actions ── */
  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/customerCare/update-status/${id}`,
        { status },
        config,
      );
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };
  const updateQueryStatus = async (id, status) => {
    setQueryActionLoading(id);
    try {
      await axios.put(
        `${API_BASE_URL}/customerCare/support-queries/${id}/status`,
        { status },
        config,
      );
      await fetchQuery();
    } catch (err) {
      console.error(err);
    } finally {
      setQueryActionLoading(null);
    }
  };
  const assignPandit = async (panditId, price) => {
    if (!selectedBookingId) return;
    if (!price || price <= 0) {
      alert("Please enter a valid price");
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/customerCare/assign-pandit/${selectedBookingId}`,
        { panditId, price },
        config,
      );
      setAssignModalOpen(false);
      setSelectedBookingId(null);
      setSelectedPanditPrice({});
      fetchBookings();
    } catch (err) {
      alert("Assign Failed");
    }
  };
  const handleLogout = () => {
    localStorage.clear();
    navigate("/customerCare/signIn");
  };

  /* ── Filtered lists ── */
  const filteredBookings = bookings.filter((b) =>
    b.puja_name?.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredPandits = pandits.filter(
    (p) =>
      p.phone.includes(panditSearch) ||
      p.name.toLowerCase().includes(panditSearch.toLowerCase()),
  );
  const filteredQueries = queries.filter(
    (q) =>
      q.subject?.toLowerCase().includes(querySearch.toLowerCase()) ||
      q.user_name?.toLowerCase().includes(querySearch.toLowerCase()),
  );

  const navItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "pujas", icon: BookOpen, label: "Puja Requests" },
    { id: "users", icon: Users, label: "Users" },
    { id: "pandits", icon: UserCheck, label: "Pandits" },
    { id: "querys", icon: MessageSquare, label: "Support Queries" },
    { id: "chatsupport", icon: ChartArea, label: "Chat Support" },
  ];

  const stats = [
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: <BookOpen size={20} />,
      gradient: "from-[#0d1829] to-[#080f1c]",
      iconColor: {
        bg: "bg-blue-500/15",
        border: "border-blue-500/20",
        text: "text-blue-400",
      },
    },
    {
      label: "Pending",
      value: bookings.filter((b) => b.status === "pending").length,
      icon: <Clock size={20} />,
      gradient: "from-[#0d1829] to-[#080f1c]",
      iconColor: {
        bg: "bg-amber-500/15",
        border: "border-amber-500/20",
        text: "text-amber-400",
      },
    },
    {
      label: "Completed",
      value: bookings.filter((b) => b.status === "completed").length,
      icon: <CheckCircle size={20} />,
      gradient: "from-[#0d1829] to-[#080f1c]",
      iconColor: {
        bg: "bg-emerald-500/15",
        border: "border-emerald-500/20",
        text: "text-emerald-400",
      },
    },
    {
      label: "Total Users",
      value: users.length,
      icon: <Users size={20} />,
      gradient: "from-[#0d1829] to-[#080f1c]",
      iconColor: {
        bg: "bg-violet-500/15",
        border: "border-violet-500/20",
        text: "text-violet-400",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[#060d1a] text-slate-300 flex">
      {/* ── Global Toast Notifications ── */}
      <ToastNotification toasts={toasts} />

      {/* Sidebar overlay mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[240px] md:w-[260px] z-50 flex flex-col bg-gradient-to-b from-[#0d1829] to-[#0a1220] border-r border-blue-500/[0.07] transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="px-5 md:px-6 py-6 md:py-7 border-b border-white/[0.04]">
          <div className="flex items-center gap-2.5 bg-gradient-to-r from-blue-500/15 to-indigo-500/10 border border-blue-400/20 rounded-xl px-3.5 py-2.5 w-fit">
            <Headphones size={18} className="text-blue-400" />
            <span className="font-bold text-sm bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              CarePortal
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-2.5 tracking-wider uppercase">
            Customer Support
          </p>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${activeTab === item.id
                  ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/8 text-blue-300 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.06)_inset]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent"
                }`}
            >
              {/* Icon + badge */}
              <div className="relative flex-shrink-0">
                <item.icon size={17} />
                {/* ── RED BADGE — sirf chatsupport pe, sirf jab active nahi ── */}
                {item.id === "chatsupport" &&
                  chatBadgeCount > 0 &&
                  activeTab !== "chatsupport" && (
                    <span
                      className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#0a1220] leading-none"
                      style={{
                        animation:
                          "badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    >
                      {chatBadgeCount > 9 ? "9+" : chatBadgeCount}
                    </span>
                  )}
              </div>

              <span className="flex-1 text-left">{item.label}</span>

              {/* Glowing dot */}
              {item.id === "chatsupport" &&
                chatBadgeCount > 0 &&
                activeTab !== "chatsupport" && (
                  <span
                    className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"
                    style={{ boxShadow: "0 0 6px #f43f5e" }}
                  />
                )}

              {activeTab === item.id && (
                <ChevronRight size={14} className="ml-auto text-blue-400" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-500/[0.07] border border-rose-500/15 hover:bg-rose-500/[0.12] hover:border-rose-500/25 transition-all"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col md:ml-[260px] min-w-0">
        {/* TOPBAR */}
        <header className="sticky top-0 z-30 h-16 bg-[#0d1829]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-sm md:text-base font-bold text-slate-200 tracking-tight">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
              {navItems.find((n) => n.id === activeTab)?.label}
            </div>
          </div>
          {(activeTab === "pujas" || activeTab === "querys") && (
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder={
                  activeTab === "pujas" ? "Search puja..." : "Search queries..."
                }
                value={activeTab === "pujas" ? search : querySearch}
                onChange={(e) =>
                  activeTab === "pujas"
                    ? setSearch(e.target.value)
                    : setQuerySearch(e.target.value)
                }
                className="bg-[#0f172a]/80 border border-blue-500/10 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-300 placeholder:text-slate-600 w-36 sm:w-52 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30"
              />
            </div>
          )}
        </header>

        {/* CONTENT */}
        <div className="p-4 md:p-8 flex-1">
          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                {stats.map((s, i) => (
                  <StatCard key={i} {...s} />
                ))}
              </div>
              <TableCard
                title="Recent Puja Requests"
                count={`${bookings.length} total`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[400px]">
                    <thead className="bg-[#05080f]/60 border-b border-white/[0.03]">
                      <tr>
                        <Th>ID</Th>
                        <Th>Puja</Th>
                        <Th>User</Th>
                        <Th>Status</Th>
                        <Th>Price</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.025]">
                      {loading ? (
                        <LoadingRow cols={5} />
                      ) : (
                        bookings.slice(0, 6).map((b) => (
                          <tr
                            key={b.id}
                            className="hover:bg-blue-500/[0.03] transition-colors"
                          >
                            <td className="px-4 md:px-5 py-4">
                              <IdBadge id={b.id} />
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <p className="font-semibold text-slate-200">
                                {b.puja_name}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {b.puja_type}
                              </p>
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <p className="font-semibold text-slate-200">
                                {b.user_name}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {b.user_phone}
                              </p>
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <StatusBadge status={b.status} />
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <span className="font-mono font-bold text-emerald-400 text-sm">
                                ₹{b.total_price}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </TableCard>
            </>
          )}

          {/* ── PUJAS ── */}
          {activeTab === "pujas" && (
            <TableCard
              title="All Puja Bookings"
              count={`${filteredBookings.length} results`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[700px]">
                  <thead className="bg-[#05080f]/60 border-b border-white/[0.03]">
                    <tr>
                      <Th>ID</Th>
                      <Th>Puja Details</Th>
                      <Th>Customer</Th>
                      <Th>Schedule</Th>
                      <Th>Price</Th>
                      <Th>Status</Th>
                      <Th>Pandit Info</Th>
                      <Th center>Actions</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.025]">
                    {loading ? (
                      <LoadingRow cols={7} />
                    ) : (
                      filteredBookings.map((puja) => (
                        <tr
                          key={puja.id}
                          className="hover:bg-blue-500/[0.03] transition-colors"
                        >
                          <td className="px-4 md:px-5 py-4">
                            <IdBadge id={puja.id} />
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <p className="font-semibold text-slate-200">
                              {puja.puja_name}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                              {puja.puja_type}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-600">
                              <MapPin size={9} /> {puja.city}, {puja.state}
                            </div>
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <p className="font-semibold text-slate-200">
                              {puja.user_name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                              <Phone size={9} /> {puja.user_phone}
                            </div>
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-300">
                              <CalendarDays
                                size={10}
                                className="text-slate-500"
                              />
                              {new Date(puja.preferred_date).toLocaleDateString(
                                "en-IN",
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 italic">
                              <Clock size={9} /> {puja.preferred_time}
                            </div>
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              ₹{puja.total_price}
                            </span>
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <StatusBadge status={puja.status} />
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            {puja.pandit_name ? (
                              <div>
                                <p className="font-semibold text-slate-200 text-[11px]">
                                  {puja.pandit_name}
                                </p>
                                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                  ₹{puja.pandit_price || "—"}
                                </p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="px-4 md:px-5 py-4">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              {puja.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedBookingId(puja.id);
                                      setAssignModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition"
                                  >
                                    Assign
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateStatus(puja.id, "declined")
                                    }
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {puja.status === "accepted" && (
                                <button
                                  onClick={() =>
                                    updateStatus(puja.id, "completed")
                                  }
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TableCard>
          )}

          {/* ── PANDITS / USERS ── */}

          {(activeTab === "pandits" || activeTab === "users") && (
            <TableCard
              title={activeTab === "pandits" ? "All Pandits" : "All Users"}
              count={`${(activeTab === "pandits" ? pandits : users).length} total`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[550px]">
                  <thead className="bg-[#05080f]/60 border-b border-white/[0.03]">
                    <tr>
                      <Th>ID</Th>
                      <Th>Details</Th>
                      <Th>Contact</Th>
                      <Th>Address</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.025]">
                    {loading ? (
                      <LoadingRow cols={5} />
                    ) : (
                      (activeTab === "pandits" ? pandits : users).map(
                        (person, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-500/[0.03] transition-colors"
                          >
                            <td className="px-4 md:px-5 py-4">
                              <IdBadge id={person.id} />
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[11px] flex-shrink-0">
                                  {person.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-200">
                                    {person.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    Gotra: {person.gotra || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
                                <Phone size={9} className="text-slate-500" />{" "}
                                {person.phone}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                                <Mail size={9} /> {person.email || "—"}
                              </div>
                            </td>
                            <td className="px-4 md:px-5 py-4">
                              <p className="text-slate-300 text-[11px] max-w-[140px] truncate">
                                {person.address_line1 || "N/A"}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                                <MapPin size={9} /> {person.city} {person.state}
                              </div>
                            </td>

                            {/* ── STATUS COLUMN ── */}
                            <td className="px-4 md:px-5 py-4">
                              {activeTab === "pandits" ? (
                                // Pandit — Online / Offline
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${person.is_online
                                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/25"
                                      : "bg-slate-400/10 text-slate-400 border-slate-400/25"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${person.is_online
                                        ? "bg-emerald-400"
                                        : "bg-red-400"
                                      }`}
                                  />
                                  {person.is_online ? "Online" : "Offline"}
                                </span>
                              ) : (
                                // User — Active / Blocked
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${person.is_blocked
                                      ? "bg-rose-400/10 text-rose-400 border-rose-400/25"
                                      : "bg-emerald-400/10 text-emerald-400 border-emerald-400/25"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${person.is_blocked
                                        ? "bg-rose-400"
                                        : "bg-emerald-400"
                                      }`}
                                  />
                                  {person.is_blocked ? "Blocked" : "Active"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </TableCard>
          )}

          {/* ── SUPPORT QUERIES ── */}
          {activeTab === "querys" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total",
                    value: queryTotal,
                    color: "text-blue-400",
                    bg: "bg-blue-500/10 border-blue-500/20",
                  },
                  {
                    label: "Open",
                    value: queries.filter((q) => q.status === "Open").length,
                    color: "text-amber-400",
                    bg: "bg-amber-500/10 border-amber-500/20",
                  },
                  {
                    label: "Resolved",
                    value: queries.filter((q) => q.status === "Resolved")
                      .length,
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10 border-emerald-500/20",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`flex items-center justify-between px-3 md:px-4 py-3 rounded-xl border ${s.bg}`}
                  >
                    <span
                      className={`text-[10px] md:text-[11px] font-semibold uppercase tracking-wider ${s.color} opacity-70`}
                    >
                      {s.label}
                    </span>
                    <span
                      className={`font-mono text-lg md:text-xl font-bold ${s.color}`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  {
                    val: "",
                    label: "All",
                    active: "bg-blue-500/15 text-blue-400 border-blue-500/25",
                  },
                  {
                    val: "Open",
                    label: "Open",
                    active:
                      "bg-amber-500/15 text-amber-400 border-amber-500/25",
                  },
                  {
                    val: "Resolved",
                    label: "Resolved",
                    active:
                      "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
                  },
                  {
                    val: "Closed",
                    label: "Closed",
                    active:
                      "bg-slate-500/15 text-slate-400 border-slate-500/25",
                  },
                ].map((f) => (
                  <button
                    key={f.val}
                    onClick={() => {
                      setQueryStatusFilter(f.val);
                      setQueryPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${queryStatusFilter === f.val ? f.active : "bg-transparent text-slate-500 border-white/[0.06] hover:border-white/[0.12]"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <TableCard title="Support Queries" count={`${queryTotal} total`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead className="bg-[#05080f]/60 border-b border-white/[0.03]">
                      <tr>
                        <Th>ID</Th>
                        <Th>User</Th>
                        <Th>Category</Th>
                        <Th>Subject & Message</Th>
                        <Th>Date</Th>
                        <Th center>Status</Th>
                        <Th center>Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.025]">
                      {loading ? (
                        <LoadingRow cols={7} />
                      ) : filteredQueries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center">
                            <MessageSquare
                              size={28}
                              className="mx-auto mb-2 text-slate-700"
                            />
                            <span className="text-xs text-slate-600">
                              No queries found
                            </span>
                          </td>
                        </tr>
                      ) : (
                        filteredQueries.map((q) => (
                          <React.Fragment key={q.id}>
                            <tr
                              className={`transition-colors hover:bg-blue-500/[0.03] ${queryActionLoading === q.id ? "opacity-40 pointer-events-none" : ""}`}
                              onClick={() =>
                                setExpandedQuery(
                                  expandedQuery === q.id ? null : q.id,
                                )
                              }
                            >
                              <td className="px-4 md:px-5 py-4">
                                <IdBadge id={q.id} />
                              </td>
                              <td className="px-4 md:px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[11px] flex-shrink-0">
                                    {q.user_name?.charAt(0).toUpperCase() ||
                                      "?"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-200">
                                      {q.user_name || "Unknown"}
                                    </p>
                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                                      <Mail size={8} /> {q.user_email || "—"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 md:px-5 py-4">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold whitespace-nowrap">
                                  <Tag size={8} /> {q.category}
                                </span>
                              </td>
                              <td className="px-4 md:px-5 py-4 max-w-[200px]">
                                <p className="font-semibold text-slate-200 truncate">
                                  {q.subject}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                                  {q.message}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedQuery(
                                      expandedQuery === q.id ? null : q.id,
                                    );
                                  }}
                                  className="mt-1 text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition"
                                >
                                  <AlignLeft size={9} />{" "}
                                  {expandedQuery === q.id
                                    ? "Hide"
                                    : "Read full"}
                                </button>
                              </td>
                              <td className="px-4 md:px-5 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-1 text-[11px] text-slate-300">
                                  <CalendarDays
                                    size={9}
                                    className="text-slate-500"
                                  />
                                  {new Date(q.created_at).toLocaleDateString(
                                    "en-IN",
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5 ml-3.5">
                                  {new Date(q.created_at).toLocaleTimeString(
                                    "en-IN",
                                    { hour: "2-digit", minute: "2-digit" },
                                  )}
                                </div>
                              </td>
                              <td className="px-4 md:px-5 py-4 text-center">
                                <QueryStatusBadge status={q.status} />
                              </td>
                              <td className="px-4 md:px-5 py-4">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {q.status === "Open" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQueryStatus(q.id, "Resolved");
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition whitespace-nowrap"
                                    >
                                      {queryActionLoading === q.id ? (
                                        <Loader2
                                          size={11}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <CheckCheck size={11} />
                                      )}{" "}
                                      Resolve
                                    </button>
                                  )}
                                  {q.status !== "Closed" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateQueryStatus(q.id, "Closed");
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 transition whitespace-nowrap"
                                    >
                                      <XCircle size={11} /> Close
                                    </button>
                                  )}
                                  {q.status === "Closed" && (
                                    <span className="text-[10px] text-slate-600 italic">
                                      No actions
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {expandedQuery === q.id && (
                              <tr className="bg-[#05080f]/40">
                                <td colSpan={7} className="px-6 md:px-8 py-4">
                                  <div className="bg-[#0a1220] border border-white/[0.06] rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <AlignLeft
                                        size={12}
                                        className="text-blue-400"
                                      />
                                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        Full Message
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                      {q.message}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Phone size={9} /> {q.user_phone || "—"}
                                      </span>
                                      <span className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <Mail size={9} /> {q.user_email || "—"}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {queryTotalPages > 1 && (
                  <div className="flex justify-between items-center px-4 md:px-6 py-3 border-t border-white/[0.04] flex-wrap gap-3">
                    <span className="text-[11px] text-slate-500">
                      Page <b className="text-slate-400">{queryPage}</b> /{" "}
                      <b className="text-slate-400">{queryTotalPages}</b>
                    </span>
                    <div className="flex gap-1">
                      <button
                        disabled={queryPage === 1}
                        onClick={() => setQueryPage(queryPage - 1)}
                        className="px-3 py-1 text-[11px] font-semibold bg-[#05080f]/60 border border-white/[0.06] rounded-lg disabled:opacity-30 hover:bg-white/[0.04] transition text-slate-400"
                      >
                        Prev
                      </button>
                      {Array.from(
                        { length: Math.min(queryTotalPages, 5) },
                        (_, i) => {
                          const pg =
                            queryTotalPages <= 5
                              ? i + 1
                              : queryPage <= 3
                                ? i + 1
                                : queryPage >= queryTotalPages - 2
                                  ? queryTotalPages - 4 + i
                                  : queryPage - 2 + i;
                          return (
                            <button
                              key={pg}
                              onClick={() => setQueryPage(pg)}
                              className={`w-7 h-7 text-[11px] font-bold rounded-lg transition ${queryPage === pg ? "bg-blue-600 text-white" : "bg-[#05080f]/60 border border-white/[0.06] text-slate-500 hover:bg-white/[0.04]"}`}
                            >
                              {pg}
                            </button>
                          );
                        },
                      )}
                      <button
                        disabled={queryPage === queryTotalPages}
                        onClick={() => setQueryPage(queryPage + 1)}
                        className="px-3 py-1 text-[11px] font-semibold bg-[#05080f]/60 border border-white/[0.06] rounded-lg disabled:opacity-30 hover:bg-white/[0.04] transition text-slate-400"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </TableCard>
            </div>
          )}

          {/* ── CHAT SUPPORT ── */}
          {activeTab === "chatsupport" && (
            <ChatSupportPanel
              token={token}
              globalSocket={globalSocket}
              initialSessions={chatSessions}
              initialMessages={chatMessages}
              onSessionsChange={setChatSessions}
              onMessagesChange={setChatMessages}
            />
          )}
        </div>
      </main>

      {/* ── ASSIGN PANDIT MODAL ── */}
      {assignModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) =>
            e.target === e.currentTarget && setAssignModalOpen(false)
          }
        >
          <div className="bg-gradient-to-br from-[#0d1829] to-[#080f1c] border border-blue-400/12 rounded-2xl p-5 md:p-6 w-full max-w-4xl shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  <UserCheck size={15} className="text-blue-400" />
                </div>
                <span className="font-bold text-slate-200">Assign Pandit</span>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={panditSearch}
                onChange={(e) => setPanditSearch(e.target.value)}
                className="w-full bg-[#05080f]/80 border border-white/[0.06] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500/25"
              />
            </div>

            <div className="max-h-64 md:max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredPandits.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-600">
                  No pandits found
                </div>
              ) : (
                filteredPandits.map((pandit) => (
                  <div
                    key={pandit.id}
                    className="flex items-center justify-between bg-[#05080f]/60 border border-white/[0.04] rounded-xl px-3.5 py-3 hover:border-blue-500/20 hover:bg-blue-500/[0.04] transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-7 h-7 flex-shrink-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-[11px]">
                          {pandit.name?.charAt(0).toUpperCase()}
                        </div>
                        {/* ✅ Online/Offline dot on avatar */}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#080f1c] ${pandit.is_online ? "bg-emerald-400" : "bg-slate-500"
                            }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {pandit.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[10px] text-slate-500">
                            {pandit.phone}
                          </p>
                          {/* ✅ Online/Offline badge */}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${pandit.is_online
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-slate-400/10 text-slate-400"
                              }`}
                          >
                            {pandit.is_online ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <input
                        type="number"
                        placeholder="₹ Price"
                        value={selectedPanditPrice[pandit.id] || ""}
                        onChange={(e) =>
                          setSelectedPanditPrice((prev) => ({
                            ...prev,
                            [pandit.id]: e.target.value,
                          }))
                        }
                        className="w-20 bg-[#05080f]/80 border border-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/25 focus:border-emerald-500/25"
                      />
                      <button
                        onClick={() => {
                          // ✅ Offline hai to confirm popup, online hai to seedha assign
                          if (!pandit.is_online) {
                            if (
                              window.confirm(
                                `⚠️ ${pandit.name} He is currently offline. Do you still want to assign it?`,
                              )
                            ) {
                              assignPandit(
                                pandit.id,
                                selectedPanditPrice[pandit.id],
                              );
                            }
                          } else {
                            assignPandit(
                              pandit.id,
                              selectedPanditPrice[pandit.id],
                            );
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.04] flex justify-end">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/18 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes toastSlideIn { from { opacity:0; transform:translateX(60px) scale(0.95); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes badgePop     { 0%{transform:scale(0)} 70%{transform:scale(1.3)} 100%{transform:scale(1)} }
      `}</style>
    </div>
  );
};

export default CustomerCareDashboard;
