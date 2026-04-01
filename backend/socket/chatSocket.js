// socket/chatSocket.js
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sessions } from "../controllers/chatController.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const onlineAgents = {};

const verifySocketToken = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("Token nahi mila"));

    const decoded = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [decoded.id || decoded.userId]
    );

    if (!rows.length) return next(new Error("User nahi mila"));

    socket.user = rows[0];
    next();
  } catch (err) {
    next(new Error("Invalid token: " + err.message));
  }
};

const initChatSocket = (io) => {
  io.use(verifySocketToken);

  io.on("connection", (socket) => {
    const { id: userId, name, email, role } = socket.user;

    // ── AGENT JOIN ──────────────────────────────
    if (role === "customerCare" || role === "admin") {
      onlineAgents[socket.id] = { userId, name, email, role, socketId: socket.id };
      socket.join("agents-room");

      // Waiting aur active sessions bhejo — messages ke saath
      const openSessions = Object.values(sessions).filter(
        (s) => s.status === "waiting" || s.status === "active"
      );
      socket.emit("agent:sessions", openSessions);
      socket.to("agents-room").emit("agent:online", { userId, name });
    }

    // ── USER: Chat shuru karo ───────────────────
    socket.on("user:start-chat", () => {
      if (role !== "user") {
        socket.emit("error", { message: "Sirf users chat shuru kar sakte hain" });
        return;
      }

      // Agar pehle se session hai to wahi de do
      const existingSession = Object.values(sessions).find(
        (s) => s.userId === userId && s.status !== "closed"
      );

      if (existingSession) {
        socket.join(existingSession.sessionId);
        socket.emit("user:session", {
          sessionId: existingSession.sessionId,
          status: existingSession.status,
          agentName: existingSession.agentName || null,
        });

        // Purane messages bhi bheho user ko
        if (existingSession.messages.length > 0) {
          socket.emit("user:history", {
            sessionId: existingSession.sessionId,
            messages: existingSession.messages,
          });
        }
        return;
      }

      // Naya session banao
      const sessionId = `chat_${userId}_${Date.now()}`;
      sessions[sessionId] = {
        sessionId,
        userId,
        userName: name,
        userEmail: email,
        agentSocketId: null,
        agentId: null,
        agentName: null,
        messages: [],
        status: "waiting",
        startedAt: new Date().toISOString(),
        closedAt: null,
      };

      socket.join(sessionId);
      socket.emit("user:session", { sessionId, status: "waiting" });
      io.to("agents-room").emit("agent:new-session", sessions[sessionId]);
    });

    // ── AGENT: Session accept karo ──────────────
    socket.on("agent:accept-session", ({ sessionId }) => {
      if (role !== "customerCare" && role !== "admin") {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      const session = sessions[sessionId];
      if (!session) {
        socket.emit("error", { message: "Session nahi mili" });
        return;
      }
      if (session.status === "active") {
        socket.emit("error", { message: "Pehle se kisi ne le liya" });
        return;
      }

      session.agentSocketId = socket.id;
      session.agentId = userId;
      session.agentName = name;
      session.status = "active";

      socket.join(sessionId);

      // Sabko batao session accept hua
      io.to(sessionId).emit("session:accepted", {
        sessionId,
        agentName: name,
        agentId: userId,
      });
      io.to("agents-room").emit("agent:session-updated", session);

      // ✅ Agent ko waiting messages ki history bheho
      if (session.messages.length > 0) {
        socket.emit("agent:history", {
          sessionId,
          messages: session.messages,
        });
      }
    });

    // ── MESSAGE bhejo ───────────────────────────
    socket.on("message:send", ({ sessionId, text }) => {
      const session = sessions[sessionId];

      if (!session) {
        socket.emit("error", { message: "Session nahi mili" });
        return;
      }

      // ✅ "waiting" aur "active" dono allow — sirf "closed" block
      if (session.status === "closed") {
        socket.emit("error", { message: "Chat band ho gayi hai" });
        return;
      }

      const isSessionUser = session.userId === userId;
      const isSessionAgent = session.agentId === userId;

      // Waiting mein sirf user message kar sakta hai
      if (session.status === "waiting" && !isSessionUser) {
        socket.emit("error", { message: "Session abhi active nahi hai" });
        return;
      }

      if (!isSessionUser && !isSessionAgent) {
        socket.emit("error", { message: "Aap is chat mein nahi hain" });
        return;
      }

      if (!text || !text.trim()) {
        socket.emit("error", { message: "Message khali nahi ho sakta" });
        return;
      }

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        sessionId,
        senderId: userId,
        senderName: name,
        senderRole: role,
        senderType: role === "user" ? "user" : "agent",
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      session.messages.push(message);

      // ✅ Waiting mein sirf agents-room ko bhejo (user khud dekh raha hai)
      if (session.status === "waiting") {
        socket.emit("message:received", message);         // user ko confirm
        io.to("agents-room").emit("message:received", message); // agents ko
      } else {
        io.to(sessionId).emit("message:received", message); // active — room mein sabko
      }
    });

    // ── TYPING ──────────────────────────────────
    socket.on("typing:start", ({ sessionId }) => {
      socket.to(sessionId).emit("typing:show", {
        senderName: name,
        senderType: role === "user" ? "user" : "agent",
      });
    });

    socket.on("typing:stop", ({ sessionId }) => {
      socket.to(sessionId).emit("typing:hide", {
        senderType: role === "user" ? "user" : "agent",
      });
    });

    // ── SESSION cancel karo (user ne wait chhodi) ──
    socket.on("session:cancel", ({ sessionId }) => {
      const session = sessions[sessionId];
      if (!session) return;
      if (session.userId !== userId) {
        socket.emit("error", { message: "Access denied" });
        return;
      }
      if (session.status !== "waiting") return;

      session.status = "closed";
      session.closedAt = new Date().toISOString();
      session.closedBy = name;

      io.to(sessionId).emit("session:closed", {
        sessionId,
        closedBy: name,
        closedByRole: role,
      });
      io.to("agents-room").emit("agent:session-updated", session);
    });

    // ── SESSION band karo ───────────────────────
    socket.on("session:close", ({ sessionId }) => {
      const session = sessions[sessionId];
      if (!session) return;

      if (session.userId !== userId && session.agentId !== userId) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      session.status = "closed";
      session.closedAt = new Date().toISOString();
      session.closedBy = name;

      io.to(sessionId).emit("session:closed", {
        sessionId,
        closedBy: name,
        closedByRole: role,
      });
      io.to("agents-room").emit("agent:session-updated", session);
    });

    // ── DISCONNECT ──────────────────────────────
    socket.on("disconnect", () => {
      if (onlineAgents[socket.id]) {
        delete onlineAgents[socket.id];
        socket.to("agents-room").emit("agent:offline", { userId, name });
      }

      // User disconnect hua aur session waiting mein tha to close karo
      const userSession = Object.values(sessions).find(
        (s) => s.userId === userId && s.status === "waiting"
      );
      if (userSession) {
        userSession.status = "closed";
        userSession.closedAt = new Date().toISOString();
        io.to("agents-room").emit("agent:session-updated", userSession);
      }
    });
  });
};

export default initChatSocket;