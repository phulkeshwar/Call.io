import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the index.html page as static file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
  // Generate a random nickname for the socket connection
  const username = `User-${socket.id.substring(0, 4)}`;
  console.log(`[Socket Server] Client connected: ${username} (Socket ID: ${socket.id})`);

  // Send the username back to the client
  socket.emit("welcome", { username });

  // Broadcast to all other sockets that a new user joined
  socket.broadcast.emit("notification", {
    message: `${username} joined the chat.`,
  });

  // Listen for message events from client
  socket.on("chat:message", (data) => {
    console.log(`[Socket Server] Message from ${username}: "${data.text}"`);
    
    // Broadcast message to everyone *else*
    socket.broadcast.emit("chat:receive", {
      from: username,
      text: data.text,
      timestamp: new Date().toLocaleTimeString(),
    });
  });

  // Listen for typing events from client
  socket.on("chat:typing", (data) => {
    socket.broadcast.emit("chat:typing", {
      from: username,
      isTyping: data.isTyping,
    });
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log(`[Socket Server] Client disconnected: ${username}`);
    socket.broadcast.emit("notification", {
      message: `${username} left the chat.`,
    });
  });
});

const PORT = 5052;
server.listen(PORT, () => {
  console.log("\x1b[32m%s\x1b[0m", `\n💬 WebSocket Server running at: http://localhost:${PORT}`);
  console.log("\x1b[33m%s\x1b[0m", `👉 Open http://localhost:${PORT} in two different browser windows to test real-time chat!\n`);
});
