# Call.io MERN Stack Learning Hub

Welcome! This folder is designed to help you transition from **"vibe coding"** (writing code based on templates and intuition without knowing why it works) to **"understanding the metal"** (understanding the protocols, mechanisms, and optimizations under the hood).

We will explore concepts **vertically**—from the user's action in the React UI down to the MongoDB database and back, looking at performance, security, and architectures.

---

## 🗺️ Curriculum Overview

Click any of the directories below to dive into the lessons and runnable demo codes.

### 🧱 [Module 0: MERN Stack Fundamentals — START HERE](./module-0-mern-fundamentals/README.md)
*   **What is MERN?**: MongoDB, Express, React, Node.js — what each one does and why they fit together.
*   **Tooling Explained**: npm, package.json, node_modules, Vite, .env files, nodemon, ES Modules vs CommonJS.
*   **Your Project Decoded**: Full directory map of Call.io with every file's purpose, the MVC pattern, SPA architecture, and the complete request lifecycle from button click to database and back.
*   **JavaScript Essentials**: async/await, destructuring, spread operator, arrow functions, optional chaining.
*   **Glossary**: Every term (API, REST, Middleware, Schema, ODM, JWT, Hashing, Salt, CORS, WebSocket, SPA, JSX, Virtual DOM, Context, Hook, Prop, State, Ref, Bundle, HMR) defined in one place.
*   **Runnable Demo**: An interactive middleware pipeline tracer — fire API requests and watch them flow through every Express layer in real time.

---

### 🔌 [Module 1: The Client-Server Connection (Request-Response, APIs, & CORS)](./module-1-architecture/README.md)
*   **Vertical Flow**: React (Axios) ➡️ HTTP Protocol ➡️ Express Server ➡️ CORS Middleware.
*   **Questions Answered**: What is Node.js vs. Express? How do headers and request bodies flow? Why does the browser block my backend requests with CORS, and how do we resolve it securely?
*   **Runnable Demo**: A separate client and server script where you can intentionally trigger, debug, and fix a CORS error.

### 💾 [Module 2: Data Persistence (MongoDB & Mongoose Schema Design)](./module-2-databases/README.md)
*   **Vertical Flow**: Express Controller ➡️ Mongoose Schema ➡️ MongoDB Driver ➡️ Database Engine.
*   **Questions Answered**: Why NoSQL? How do pre-save hooks hash passwords? How do Mongoose validations prevent dirty data? How does bcrypt keep passwords secure?
*   **Runnable Demo**: A standalone command-line Node.js application to connect to MongoDB, perform model queries, trigger validation errors, and check hashed passwords.

### 🔐 [Module 3: Authentication & Security (Stateless JWT)](./module-3-auth/README.md)
*   **Vertical Flow**: React Login Form ➡️ Express Auth Route ➡️ JWT Signing ➡️ LocalStorage ➡️ Bearer Headers ➡️ Express Auth Middleware.
*   **Questions Answered**: What is stateless auth? How does a JWT verify a user's identity without a database session look-up? How do middlewares protect routes?
*   **Runnable Demo**: A complete registration and login server featuring secure token-signing and a protected `/api/profile` route.

### ⚡ [Module 4: Real-time Communication (WebSockets & Socket.io)](./module-4-sockets/README.md)
*   **Vertical Flow**: React (Socket.io Client) ➡️ WebSocket Handshake ➡️ Node.js Socket.io Server ➡️ Rooms/Rooms Event Broadcasts ➡️ Redis Adapter.
*   **Questions Answered**: How do WebSockets differ from HTTP? How do persistent TCP connections work? What are rooms? Why do we need Redis when scaling sockets across multiple server instances?
*   **Runnable Demo**: A miniature web chat room server that lets multiple browser windows send real-time messages and typing indicators to each other.

### ⚛️ [Module 5: Modern React State & Optimization (Hooks, Context, & Refs)](./module-5-react/README.md)
*   **Vertical Flow**: React Component Lifecycle ➡️ State Updates ➡️ virtual DOM reconciliation ➡️ Ref mutations.
*   **Questions Answered**: When does a component re-render? Why use `useRef` for values that shouldn't trigger renders (like typing timeouts)? How do `useCallback` and `useMemo` prevent unnecessary calculations?
*   **Runnable Demo**: A visual React app showcasing rendering counts, showing how parent renders affect children and how memoization mitigates it.

---

## 🚀 How to Use this Hub

1.  **Read the Guides**: Every module directory has a `README.md` containing detailed explanations, conceptual diagrams, and code snippets from your actual `call.io` project.
2.  **Run the Demos**: Each module has a `demo/` subdirectory. To run the demo:
    *   Open your terminal in that specific `demo` directory.
    *   Run `npm install` (or the specific command listed in the module's guide).
    *   Run the start command (usually `npm run dev` or `node server.js`).
    *   Open your browser or run the client code to interact with the demo.
3.  **Cross-reference your Project**: Compare the demo code to your actual `call.io` code files to see how the production implementation handles identical requirements.
