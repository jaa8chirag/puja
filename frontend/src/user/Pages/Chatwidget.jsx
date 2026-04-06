// ============================================
// src/user/Components/ChatWidget.jsx
// Sirf "user" role walo ko dikhega
// ============================================

import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function ChatWidget() {

    const token = localStorage.getItem("token");

    let decoded = null;
    try {
        if (token) decoded = jwtDecode(token);
    } catch (err) {
        console.log("Invalid token:", err);
    }

    if (!decoded || decoded.role !== "user") return null;

    const [isOpen, setIsOpen] = useState(window.location.pathname === "/chat");
    const [sessionId, setSessionId] = useState(null);
    const [status, setStatus] = useState("idle");
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [agentName, setAgentName] = useState(null);
    const [agentTyping, setAgentTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, agentTyping]);

    useEffect(() => {
        if (isOpen) setUnreadCount(0);
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const connectSocket = useCallback(() => {
        if (!token) { setError("Login karein chat ke liye"); return; }
        if (socketRef.current?.connected) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
            autoConnect: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            setError(null);
            setStatus("connecting");
            socket.emit("user:start-chat");
        });

        socket.on("connect_error", (err) => {
            console.log(err);
            setError("Connection failed. Try again.");
            setStatus("idle");
        });

        socket.on("user:session", ({ sessionId, status, agentName }) => {
            setSessionId(sessionId);
            setStatus(status);
            if (agentName) setAgentName(agentName);
        });

        // ✅ Reconnect pe purane messages restore karo
        socket.on("user:history", ({ messages: historyMessages }) => {
            if (historyMessages?.length > 0) {
                setMessages(historyMessages);
            }
        });

        socket.on("session:accepted", ({ agentName }) => {
            setAgentName(agentName);
            setStatus("active");
            setMessages((prev) => [
                ...prev,
                { id: "sys_" + Date.now(), type: "system", text: `${agentName} ne chat join ki! 👋` },
            ]);
        });

        socket.on("message:received", (msg) => {
            setMessages((prev) => {
                // Duplicate check
                if (prev.find((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            if (msg.senderType === "agent" && !isOpen) {
                setUnreadCount((c) => c + 1);
            }
        });

        socket.on("typing:show", ({ senderType }) => {
            if (senderType === "agent") setAgentTyping(true);
        });
        socket.on("typing:hide", () => setAgentTyping(false));

        socket.on("session:closed", ({ closedBy, closedByRole }) => {
            setStatus("closed");
            setMessages((prev) => [
                ...prev,
                {
                    id: "sys_close_" + Date.now(),
                    type: "system",
                    text: closedByRole === "agent"
                        ? `${closedBy} ne chat band ki.`
                        : "Chat session band ho gayi.",
                },
            ]);
        });

        socket.on("error", ({ message }) => setError(message));
    }, [token, isOpen]);

    const openChat = () => {
        setIsOpen(true);
        if (status === "idle") {
            setMessages([]);
            connectSocket();
        }
    };

    // ✅ "waiting" aur "active" dono mein send allow
    const sendMessage = useCallback(() => {
        if (!inputText.trim() || !sessionId) return;
        if (status !== "active" && status !== "waiting") return;

        socketRef.current.emit("message:send", { sessionId, text: inputText.trim() });
        setInputText("");
        socketRef.current.emit("typing:stop", { sessionId });
    }, [inputText, sessionId, status]);

    const handleTyping = (e) => {
        setInputText(e.target.value);
        if (!sessionId) return;
        if (status !== "active" && status !== "waiting") return;

        socketRef.current.emit("typing:start", { sessionId });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(
            () => socketRef.current?.emit("typing:stop", { sessionId }),
            1500
        );
    };

    const startNewChat = () => {
        if (socketRef.current) socketRef.current.disconnect();
        socketRef.current = null;
        setSessionId(null);
        setMessages([]);
        setAgentName(null);
        setStatus("idle");
        setTimeout(() => connectSocket(), 100);
    };

    const endChat = () => {
        if (!sessionId || !socketRef.current) return;
        socketRef.current.emit("session:close", { sessionId });
        setStatus("closed");
        setMessages((prev) => [
            ...prev,
            {
                id: "sys_user_close_" + Date.now(),
                type: "system",
                text: "Aapne chat band kar di.",
            },
        ]);
    };

    const cancelRequest = () => {
        if (!sessionId || !socketRef.current) return;
        socketRef.current.emit("session:cancel", { sessionId });
        setStatus("closed");
        setMessages((prev) => [
            ...prev,
            {
                id: "sys_user_cancel_" + Date.now(),
                type: "system",
                text: "Aapne chat request cancel kar di.",
            },
        ]);
    };

    // ✅ Input disabled sirf "idle", "connecting", "closed" mein
    const isInputDisabled = status !== "active" && status !== "waiting";

    const inputPlaceholder =
        status === "active" ? "Type a message..." :
        status === "waiting" ? "Type a message — connecting to an agent..." :
        status === "connecting" ? "Connecting to agent..." : "Start a conversation...";

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={isOpen ? () => setIsOpen(false) : openChat}
                style={{
                    position: "fixed", bottom: "24px", right: "24px",
                    width: "60px", height: "60px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                    border: "none", cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(249,115,22,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 9999, transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute", top: "-4px", right: "-4px",
                        background: "#7c3aed", color: "white", borderRadius: "50%",
                        width: "20px", height: "20px", fontSize: "11px", fontWeight: "800",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid white",
                    }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
                {isOpen ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                ) : (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: "fixed", bottom: "96px", right: "24px",
                    width: "360px", height: "520px",
                    background: "#fff8f0",
                    borderRadius: "20px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(249,115,22,0.15)",
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    zIndex: 9998,
                    fontFamily: "'Segoe UI', system-ui, sans-serif",
                    animation: "chatPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                    {/* Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #f97316, #ef4444)",
                        color: "white",
                        padding: "10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span>Live Support</span>
                            {/* ✅ Status indicator header mein */}
                            {status === "waiting" && (
                                <span style={{
                                    fontSize: "10px", background: "rgba(255,255,255,0.2)",
                                    padding: "2px 8px", borderRadius: "20px"
                                }}>
                                    ⏳ Searching for an agent...
                                </span>
                            )}
                            {status === "active" && agentName && (
                                <span style={{
                                    fontSize: "10px", background: "rgba(255,255,255,0.2)",
                                    padding: "2px 8px", borderRadius: "20px"
                                }}>
                                    ✓ {agentName}
                                </span>
                            )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center" }}>
                            {(status === "waiting" || status === "active") && (
                                <button
                                    onClick={status === "waiting" ? cancelRequest : endChat}
                                    style={{
                                        background: "rgba(255,255,255,0.2)",
                                        border: "none", color: "white",
                                        borderRadius: "20px", padding: "4px 10px",
                                        cursor: "pointer", fontSize: "11px", marginRight: "8px"
                                    }}
                                >
                                    {status === "waiting" ? "Cancel" : "End"}
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: "transparent", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "#fef2f2", borderBottom: "1px solid #fecaca",
                            padding: "8px 16px", fontSize: "12px", color: "#dc2626", textAlign: "center"
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: "auto", padding: "14px",
                        display: "flex", flexDirection: "column", gap: "10px",
                        background: "#fff8f0"
                    }}>
                        {/* Waiting state — messages nahi hain tab */}
                        {status === "waiting" && messages.length === 0 && (
                            <div style={{
                                display: "flex", flexDirection: "column", alignItems: "center",
                                justifyContent: "center", flex: 1, color: "#9ca3af", gap: "10px"
                            }}>
                                <div style={{ fontSize: "38px", animation: "chatPulse 2s infinite" }}>⏳</div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontWeight: "600", color: "#374151", fontSize: "14px" }}>
                                        Connecting to an agent...
                                    </div>
                                    <div style={{ fontSize: "12px", marginTop: "4px" }}>
                                        Leave a message; the agent will receive it once connected.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Waiting mein messages hain — chhota notice dikhao */}
                        {status === "waiting" && messages.length > 0 && (
                            <div style={{
                                textAlign: "center", fontSize: "11px", color: "#f97316",
                                background: "#fff7ed", padding: "5px 12px", borderRadius: "20px",
                                margin: "0 auto", border: "1px solid #fed7aa"
                            }}>
                                ⏳Connecting to an agent — your messages are in queue and will be delivered shortly.
                            </div>
                        )}

                        {messages.map((msg) =>
                            msg.type === "system" ? (
                                <div key={msg.id} style={{
                                    textAlign: "center", fontSize: "11px", color: "#f97316",
                                    background: "#fff7ed", padding: "5px 12px", borderRadius: "20px",
                                    margin: "2px auto", border: "1px solid #fed7aa"
                                }}>
                                    {msg.text}
                                </div>
                            ) : (
                                <div key={msg.id} style={{
                                    display: "flex",
                                    flexDirection: msg.senderType === "user" ? "row-reverse" : "row",
                                    alignItems: "flex-end", gap: "8px"
                                }}>
                                    {msg.senderType === "agent" && (
                                        <div style={{
                                            width: "28px", height: "28px", borderRadius: "50%",
                                            background: "linear-gradient(135deg, #f97316, #ef4444)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "12px", flexShrink: 0
                                        }}>🙏</div>
                                    )}
                                    <div style={{ maxWidth: "72%" }}>
                                        <div style={{
                                            padding: "9px 13px",
                                            borderRadius: msg.senderType === "user"
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                            background: msg.senderType === "user"
                                                ? "linear-gradient(135deg, #f97316, #ef4444)"
                                                : "white",
                                            color: msg.senderType === "user" ? "white" : "#1f2937",
                                            fontSize: "13px", lineHeight: "1.55",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                            wordBreak: "break-word",
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{
                                            fontSize: "10px", color: "#9ca3af", marginTop: "3px",
                                            textAlign: msg.senderType === "user" ? "right" : "left"
                                        }}>
                                            {new Date(msg.timestamp).toLocaleTimeString("en-IN", {
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                        {agentTyping && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px"
                                }}>🙏</div>
                                <div style={{
                                    background: "white", padding: "10px 14px",
                                    borderRadius: "16px 16px 16px 4px",
                                    display: "flex", gap: "4px",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
                                }}>
                                    {[0, 1, 2].map((i) => (
                                        <span key={i} style={{
                                            width: "6px", height: "6px", background: "#f97316",
                                            borderRadius: "50%", display: "inline-block",
                                            animation: `chatBounce 1.2s ${i * 0.15}s ease-in-out infinite`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Closed */}
                    {status === "closed" && (
                        <div style={{
                            padding: "10px 14px", borderTop: "1px solid #fed7aa",
                            textAlign: "center", background: "#fff8f0"
                        }}>
                            <button
                                onClick={startNewChat}
                                style={{
                                    padding: "9px 22px",
                                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                                    border: "none", borderRadius: "20px", color: "white",
                                    cursor: "pointer", fontWeight: "600", fontSize: "13px"
                                }}
                            >
                                🔄 Nayi Chat Shuru Karein
                            </button>
                        </div>
                    )}

                    {/* Input — ✅ waiting mein bhi enabled */}
                    {status !== "closed" && (
                        <div style={{
                            padding: "10px 12px", borderTop: "1px solid #fed7aa",
                            display: "flex", gap: "8px", background: "white", flexShrink: 0
                        }}>
                            <input
                                value={inputText}
                                onChange={handleTyping}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                disabled={isInputDisabled}
                                placeholder={inputPlaceholder}
                                style={{
                                    flex: 1, background: "#f9fafb",
                                    border: "1px solid #e5e7eb", borderRadius: "20px",
                                    padding: "10px 16px", color: "#1f2937",
                                    fontSize: "13px", outline: "none", transition: "border-color 0.2s",
                                    opacity: isInputDisabled ? 0.5 : 1,
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={isInputDisabled || !inputText.trim()}
                                style={{
                                    width: "42px", height: "42px", borderRadius: "50%",
                                    background: (!isInputDisabled && inputText.trim())
                                        ? "linear-gradient(135deg, #f97316, #ef4444)"
                                        : "#f3f4f6",
                                    border: "none",
                                    cursor: (!isInputDisabled && inputText.trim()) ? "pointer" : "not-allowed",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, transition: "all 0.2s",
                                }}
                            >
                                <svg width="17" height="17" viewBox="0 0 24 24"
                                    fill={(!isInputDisabled && inputText.trim()) ? "white" : "#9ca3af"}>
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                @keyframes chatPopIn { from { transform: scale(0.85) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
                @keyframes chatBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
                @keyframes chatPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </>
    );
}