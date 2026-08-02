# Module 4: Real-time Communication (Socket.io WebSockets)

In this module, we will explore how we establish instant, bi-directional communication between your client and server. We will look at WebSockets, the event emitter model of Socket.io, rooms, and how to scale this architecture with Redis.

---

## ⚡ 1. HTTP vs. WebSockets: From Pull to Push

Normally, HTTP operates on a **Pull** model: the client must initiate a request to get any updates. If you want a real-time chat with HTTP, you have to do **Polling** (sending a request every 2 seconds to check: "Any new messages?"). This wastes CPU cycles, database capacity, and bandwidth.

**WebSockets (WS)** provide a persistent, bi-directional, full-duplex TCP connection:
1.  **Handshake**: The client starts with an HTTP request asking: *"Can we upgrade our connection to a WebSocket?"*
2.  **Persistent Connection**: The server accepts, and the connection remains open.
3.  **Push Model**: Either side can send data at any time without headers overhead. The server can push data to the client instantly the millisecond it receives it.

---

## 🏗️ 2. The Socket.io Event Model & Rooms

**Socket.io** is a library built on top of WebSockets. It handles connection drops, automatic reconnects, and provides an event-driven framework and a "Rooms" system.

### Events: Emitting & Listening
Socket.io uses an event-based system:
*   `socket.emit('event_name', data)`: Sends an event with data.
*   `socket.on('event_name', (data) => { ... })`: Registers a listener for an event.

### What are Rooms?
Rooms are virtual channels that sockets can join or leave. When you emit an event to a room, only the clients inside that room receive it:
`io.to(roomId).emit('message', data)`

### Real-Time Flow in Call.io
Let's look at how the real-time messages and reading receipts flow in your project.

#### A. Client sends a message:
In [ChatContext.jsx](file:///d:/WebDev/Projects/call.io/frontend/src/context/ChatContext.jsx) lines 57–66:
```javascript
const sendMessage = useCallback((text) => {
  if (!socket || !activeChat || !text.trim()) return;
  socket.emit("chat:send", {
    to: activeChat._id,
    text: text.trim(),
  });
}, [socket, activeChat]);
```

#### B. Server handles it and pushes to recipient:
In `backend/src/sockets/socketServer.js`, when the server receives `"chat:send"`, it:
1. Validates the recipient.
2. Saves the message to MongoDB.
3. Pushes the message to the recipient's socket connection using `"chat:receive"`.

#### C. Recipient receives it:
In [ChatContext.jsx](file:///d:/WebDev/Projects/call.io/frontend/src/context/ChatContext.jsx) lines 80–115, the client listens to `socket.on("chat:receive", handleReceive)`. When received, it updates the `messagesMap` state, triggering a React re-render, making the chat message pop up on the screen instantly.

---

## 🔴 3. Scaling WebSockets: Why do we need Redis?

When a user connects via WebSockets, the open TCP connection resides in the **memory of that specific server instance**.

If your application grows and you deploy **three server instances** (behind a load balancer) to handle the traffic:
*   User A connects to **Server 1**.
*   User B connects to **Server 2**.
*   User A tries to chat with User B.
*   Server 1 receives User A's socket message, but it doesn't know where User B is because User B's socket connection is living on Server 2!

```text
[ User A ] ──WS──> [ Server 1 ]          [ Server 2 ] <──WS── [ User B ]
                         │                    ▲
                         └─────( Redis )──────┘ (Adapter syncs events)
```

### The Solution: Redis Adapter
By installing `@socket.io/redis-adapter` (as seen in [package.json](file:///d:/WebDev/Projects/call.io/backend/package.json) line 12), all Server instances connect to a central **Redis** instance:
1. Server 1 publishes the event to Redis: *"Hey, broadcast this message to User B!"*
2. Redis broadcasts the event to all server instances.
3. Server 2 receives it from Redis, realizes User B is connected to it, and pushes the event to User B's open WebSocket.

In [server.js](file:///d:/WebDev/Projects/call.io/backend/src/server.js) lines 16–26:
```javascript
async function start() {
  await connectDB();
  await connectRedis(); // Starts Redis adapter so servers can communicate.
  
  const server = http.createServer(app);
  setupSocket(server);
  
  server.listen(env.port, () => ...);
}
```

---

## 🏃 Run the Demo: Real-Time Chat Engine

We have built a simple chat engine demo. It starts a Socket.io server and serves an HTML chat page. 
You can open **multiple browser tabs** of the page and observe:
*   Instant messaging (chat messages pop up instantly).
*   Real-time typing indicators ("User 2 is typing...").

### Steps to Run:
1. Open a terminal in `learning-hub/module-4-sockets/demo`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the socket server:
   ```bash
   npm run start
   ```
4. Open the link in the terminal in **two separate browser windows** (side-by-side).
5. Type in the text box and press Enter to see Socket.io events executing in real-time.
