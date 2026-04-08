// ============================================
// AgentPanel.jsx - CustomerCare Side
// JWT token automatically localStorage se uthata hai
// Route: /agent  (sirf customerCare + admin dekhein)
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

export default function AgentPanel() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState({});
  const [inputText, setInputText] = useState("");
  const [userTyping, setUserTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notification, setNotification] = useState(null);
  const [unread, setUnread] = useState({});

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const notifTimeoutRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeSessionId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(SOCKET_URL, { 
      auth: { token },
      transports: ["polling", "websocket"]
    });
    socketRef.current = socket;

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("agent:sessions", (existingSessions) => {
      setSessions(existingSessions);
      const msgs = {};
      existingSessions.forEach((s) => { msgs[s.sessionId] = s.messages || []; });
      setMessages(msgs);
    });

    socket.on("agent:new-session", (session) => {
      setSessions((prev) => { if (prev.find((s) => s.sessionId === session.sessionId)) return prev; return [session, ...prev]; });
      setMessages((prev) => ({ ...prev, [session.sessionId]: [] }));
      setUnread((prev) => ({ ...prev, [session.sessionId]: true }));
      showNotif(`🔔 Naya user: ${session.userName}`);
    });

    socket.on("agent:session-updated", (session) => {
      setSessions((prev) => prev.map((s) => s.sessionId === session.sessionId ? session : s));
    });

    socket.on("message:received", (msg) => {
      setMessages((prev) => ({ ...prev, [msg.sessionId]: [...(prev[msg.sessionId] || []), msg] }));
      if (msg.senderType === "user") setUnread((prev) => ({ ...prev, [msg.sessionId]: true }));
    });

    socket.on("typing:show", ({ senderType }) => { if (senderType === "user") setUserTyping(true); });
    socket.on("typing:hide", () => setUserTyping(false));
    socket.on("session:closed", ({ sessionId }) => {
      setSessions((prev) => prev.map((s) => s.sessionId === sessionId ? { ...s, status: "closed" } : s));
    });

    return () => socket.disconnect();
  }, []);

  const showNotif = (text) => {
    setNotification(text);
    clearTimeout(notifTimeoutRef.current);
    notifTimeoutRef.current = setTimeout(() => setNotification(null), 4000);
  };

  const acceptSession = (sessionId) => {
    socketRef.current.emit("agent:accept-session", { sessionId });
    setActiveSessionId(sessionId);
    setUnread((prev) => ({ ...prev, [sessionId]: false }));
  };

  const selectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setUnread((prev) => ({ ...prev, [sessionId]: false }));
  };

  const sendMessage = useCallback(() => {
    const session = sessions.find((s) => s.sessionId === activeSessionId);
    if (!inputText.trim() || !activeSessionId || session?.status !== "active") return;
    socketRef.current.emit("message:send", { sessionId: activeSessionId, text: inputText.trim() });
    setInputText("");
    socketRef.current.emit("typing:stop", { sessionId: activeSessionId });
  }, [inputText, activeSessionId, sessions]);

  const handleTyping = (e) => {
    setInputText(e.target.value);
    if (!activeSessionId) return;
    socketRef.current.emit("typing:start", { sessionId: activeSessionId, senderType: "agent" });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => socketRef.current.emit("typing:stop", { sessionId: activeSessionId }), 1500);
  };

  const closeSession = () => {
    if (!activeSessionId) return;
    socketRef.current.emit("session:close", { sessionId: activeSessionId });
  };

  const activeSession = sessions.find((s) => s.sessionId === activeSessionId);
  const activeMessages = activeSessionId ? messages[activeSessionId] || [] : [];
  const statusColor = { waiting: "#fbbf24", active: "#4ade80", closed: "#94a3b8" };
  const statusLabel = { waiting: "Wait", active: "Live", closed: "Band" };
  const waitingCount = sessions.filter((s) => s.status === "waiting").length;

  return (
    <div style={{ display: "flex", height: "100vh", background: "#08080f", fontFamily: "'Segoe UI', system-ui, sans-serif", color: "white", overflow: "hidden" }}>
      {notification && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", padding: "12px 20px", borderRadius: "14px", boxShadow: "0 8px 30px rgba(99,102,241,0.4)", zIndex: 9999, fontSize: "14px", fontWeight: "600", animation: "slideIn 0.3s ease" }}>
          {notification}
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: "300px", background: "#0d0d1a", borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))" }}>
          <div style={{ fontSize: "17px", fontWeight: "800", background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🎧 Customer Care</div>
          <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "5px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: isConnected ? "#4ade80" : "#ef4444", display: "inline-block", boxShadow: isConnected ? "0 0 6px #4ade80" : "none" }} />
            {isConnected ? "Online" : "Offline"}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px", gap: "8px" }}>
          {[{ label: "Total", count: sessions.length, color: "#818cf8" }, { label: "Live", count: sessions.filter((s) => s.status === "active").length, color: "#4ade80" }, { label: "Wait", count: waitingCount, color: "#fbbf24" }].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "800", color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "#475569" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>💬</div>
              <div>No users found.</div>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.sessionId} onClick={() => selectSession(session.sessionId)} style={{ padding: "14px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", background: activeSessionId === session.sessionId ? "rgba(99,102,241,0.12)" : "transparent", borderLeft: activeSessionId === session.sessionId ? "3px solid #6366f1" : "3px solid transparent", transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "15px", position: "relative" }}>
                      {session.userName.charAt(0).toUpperCase()}
                      {unread[session.sessionId] && <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", border: "2px solid #0d0d1a" }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{session.userName}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{new Date(session.startedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px", background: `${statusColor[session.status]}18`, color: statusColor[session.status], border: `1px solid ${statusColor[session.status]}33` }}>{statusLabel[session.status]}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeSession ? (
          <>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "18px" }}>{activeSession.userName.charAt(0).toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>{activeSession.userName}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{activeSession.userEmail || activeSession.sessionId}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {activeSession.status === "waiting" && <button onClick={() => acceptSession(activeSession.sessionId)} style={{ padding: "9px 22px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "22px", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>✅ Accept Karen</button>}
                {activeSession.status === "active" && <button onClick={closeSession} style={{ padding: "9px 22px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "22px", color: "#f87171", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>✕ Band Karen</button>}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {activeMessages.length === 0 && (
                <div style={{ textAlign: "center", color: "#475569", marginTop: "80px" }}>
                  <div style={{ fontSize: "50px", marginBottom: "12px" }}>💬</div>
                  <div style={{ color: "#94a3b8" }}>No messages yet.</div>
                  {activeSession.status === "waiting" && <div style={{ marginTop: "8px", color: "#818cf8", fontSize: "14px" }}>Accept karo chat shuru karne ke liye</div>}
                </div>
              )}

              {activeMessages.map((msg) =>
                msg.type === "system" ? (
                  <div key={msg.id} style={{ textAlign: "center", fontSize: "12px", color: "#818cf8", background: "rgba(99,102,241,0.08)", padding: "6px 14px", borderRadius: "20px", margin: "2px auto", border: "1px solid rgba(99,102,241,0.12)" }}>{msg.text}</div>
                ) : (
                  <div key={msg.id} style={{ display: "flex", flexDirection: msg.senderType === "agent" ? "row-reverse" : "row", alignItems: "flex-end", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: msg.senderType === "agent" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                      {msg.senderType === "agent" ? "🎧" : msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ maxWidth: "62%" }}>
                      <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px", textAlign: msg.senderType === "agent" ? "right" : "left" }}>{msg.senderName}</div>
                      <div style={{ padding: "12px 16px", borderRadius: msg.senderType === "agent" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.senderType === "agent" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.07)", color: "white", fontSize: "14px", lineHeight: "1.6", wordBreak: "break-word" }}>{msg.text}</div>
                      <div style={{ fontSize: "10px", color: "#475569", marginTop: "3px", textAlign: msg.senderType === "agent" ? "right" : "left" }}>{new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                )
              )}

              {userTyping && <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic" }}>{activeSession.userName} likh raha hai...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "12px", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
              <input value={inputText} onChange={handleTyping} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} disabled={activeSession?.status !== "active"} placeholder={activeSession?.status === "active" ? "Reply likhein..." : activeSession?.status === "waiting" ? "Pehle accept karein" : "Chat band ho gayi"} style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "25px", padding: "12px 20px", color: "white", fontSize: "14px", outline: "none" }} onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.5)")} onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.2)")} />
              <button onClick={sendMessage} disabled={activeSession?.status !== "active" || !inputText.trim()} style={{ padding: "12px 24px", background: activeSession?.status === "active" && inputText.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: "25px", color: "white", cursor: activeSession?.status === "active" && inputText.trim() ? "pointer" : "not-allowed", fontWeight: "700", fontSize: "14px" }}>Bhejo ➤</button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#475569" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎧</div>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>Customer Care Panel</div>
            <div>Choose a session from the left menu.</div>
            {waitingCount > 0 && <div style={{ marginTop: "12px", color: "#fbbf24", fontWeight: "600" }}>{waitingCount} user{waitingCount > 1 ? "s" : ""} intezaar mein hain!</div>}
          </div>
        )}
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}