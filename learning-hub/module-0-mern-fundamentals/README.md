# Module 0: MERN Stack — The Complete Foundation

> **Read this module first.** Every term, tool, file, and concept you encounter in this project is explained here from absolute scratch. After this, the vertical modules (1–5) will make complete sense.

---

## 🧱 Part 1: What is "MERN"?

MERN is an acronym for four technologies that, when combined, let you build a complete web application using **only JavaScript** — from the browser to the database:

```text
M ─ MongoDB     → The Database          (stores your data as JSON documents)
E ─ Express.js  → The Backend Framework  (handles API routes & business logic)
R ─ React       → The Frontend Library   (builds the interactive user interface)
N ─ Node.js     → The Runtime Engine     (executes JavaScript outside the browser)
```

### Why is this powerful?
Before MERN, you'd write the frontend in JavaScript, the backend in PHP/Python/Java, and queries in SQL. You had to context-switch between 3–4 languages constantly. With MERN, **every layer speaks JavaScript**.

---

## 🖥️ Part 2: Understanding Each Technology

### 2.1 Node.js — The Engine

**What it is**: Node.js is **not** a language. It's not a framework. It's a **runtime environment** — a program that can execute JavaScript code directly on your operating system (outside of a web browser).

**The story**: JavaScript was born in 1995 to run only inside web browsers (Chrome, Firefox, etc.). In 2009, Ryan Dahl took Chrome's V8 JavaScript engine (the part that actually compiles and runs JS), wrapped it with OS-level APIs (file system, networking, processes), and released it as **Node.js**. Suddenly, JavaScript could run servers, CLI tools, and desktop apps.

**What it gives you**:
- `fs` module → read/write files on your hard drive
- `http` module → create web servers and handle network requests
- `path` module → work with file/directory paths
- `process` module → access environment variables, exit codes
- **npm** → the package manager (covered below)

**In your project**: When you run `node src/server.js`, Node.js reads your JavaScript file and executes it on your machine — no browser involved.

---

### 2.2 Express.js — The Backend Framework

**What it is**: A minimal, unopinionated **web framework** that runs on top of Node.js. While Node.js can create a raw HTTP server, Express makes it practical by giving you:
- A **routing system** (`app.get("/api/users", handler)`)
- A **middleware pipeline** (functions that run before your route handler)
- Simple request/response helpers (`.json()`, `.status()`, etc.)

**Analogy**: If Node.js is the engine of a car, Express is the steering wheel, pedals, and dashboard. You *could* drive with raw wires, but Express gives you the controls.

**In your project** — [app.js](file:///d:/WebDev/Projects/call.io/backend/src/app.js):
```javascript
import express from "express";
export const app = express();      // Create an Express application instance

app.use(express.json());           // Middleware: parse incoming JSON request bodies
app.use("/api/auth", authRoutes);  // Route: everything starting with /api/auth → authRoutes
app.use(errorHandler);             // Middleware: catches any unhandled errors
```

---

### 2.3 MongoDB — The Database

**What it is**: A **NoSQL document database**. Instead of tables with rigid rows and columns (like MySQL/PostgreSQL), MongoDB stores data as flexible **JSON-like documents** inside **collections**.

**Key terms**:
| SQL Term | MongoDB Term | Example |
|----------|-------------|---------|
| Database | Database | `callUs` |
| Table | Collection | `users`, `messages` |
| Row | Document | `{ name: "Pankaj", email: "..." }` |
| Column | Field | `name`, `email`, `password` |
| Schema | *(optional, enforced by Mongoose)* | Defined in your code |

**Why NoSQL for MERN?**
Documents are stored as **BSON** (Binary JSON) — they look exactly like JavaScript objects. There's no translation layer between your code and your data. You think in objects, you store objects.

**In your project**: Your MongoDB Atlas cluster at `callUs.wdcsjbc.mongodb.net` stores two collections: `users` and `messages`. Connection happens in [db.js](file:///d:/WebDev/Projects/call.io/backend/src/config/db.js):
```javascript
await mongoose.connect(env.mongoUri);  // Connects to your cloud MongoDB
```

---

### 2.4 React — The Frontend Library

**What it is**: A JavaScript library (by Meta/Facebook) for building **component-based user interfaces**. Instead of writing one giant HTML page, you break the UI into reusable, self-contained pieces called **components**.

**Key concepts**:
- **Component**: A JavaScript function that returns JSX (HTML-like syntax). E.g., `<LoginPage />`, `<Header />`, `<UserList />`
- **JSX**: Looks like HTML but is actually JavaScript. `<h1>Hello</h1>` compiles to `React.createElement("h1", null, "Hello")`
- **Virtual DOM**: React keeps an in-memory copy of the UI. When state changes, it calculates the minimal diff and updates only the changed parts of the real DOM (much faster than re-rendering everything)
- **One-way data flow**: Data flows downward from parent to child via `props`. Children communicate upward via callback functions

**In your project** — [App.jsx](file:///d:/WebDev/Projects/call.io/frontend/src/App.jsx):
```javascript
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    </Routes>
  );
}
```
This single file defines all the "pages" your app can show based on the URL.

---

## 📦 Part 3: The Tooling Ecosystem

### 3.1 npm (Node Package Manager)

**What it is**: The world's largest software registry + a command-line tool that comes bundled with Node.js. It lets you install, manage, and share reusable JavaScript packages (libraries).

**Key commands**:
```bash
npm init              # Creates a new package.json file
npm install           # Installs all dependencies listed in package.json
npm install express   # Adds 'express' to your project (and downloads it to node_modules)
npm run dev           # Runs the "dev" script defined in package.json
```

---

### 3.2 package.json — Your Project's ID Card

Every Node.js project has a `package.json` at its root. It is the **single source of truth** about your project.

**Your backend** [package.json](file:///d:/WebDev/Projects/call.io/backend/package.json):
```json
{
  "name": "callio-backend",         // Project name (used if published to npm)
  "version": "1.0.0",              // Semantic version
  "type": "module",                // 💡 Tells Node to use ES Modules (import/export)
                                   //    without this, you must use require() syntax
  "main": "src/server.js",         // Entry point when someone imports this package
  "scripts": {
    "dev": "nodemon src/server.js", // 'npm run dev' → runs nodemon (auto-restart on changes)
    "start": "node src/server.js"   // 'npm start'   → runs Node directly (for production)
  },
  "dependencies": {                 // Libraries your app NEEDS to run
    "express": "^4.19.2",          //   ^4.19.2 means "any version >= 4.19.2 but < 5.0.0"
    "mongoose": "^8.6.2",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    // ...
  },
  "devDependencies": {              // Libraries only needed during development
    "nodemon": "^3.1.4"            //   nodemon watches files and auto-restarts your server
  }
}
```

---

### 3.3 node_modules — The Dependency Black Hole

When you run `npm install`, npm reads `package.json`, downloads every dependency (and their dependencies, and *their* dependencies...) into a `node_modules/` folder. This folder can contain **thousands** of files. 

**Rules**:
- **Never commit it to git** (your `.gitignore` already excludes it)
- **Never manually edit it** — it's auto-generated
- If deleted, just run `npm install` to recreate it

---

### 3.4 package-lock.json — The Exact Blueprint

While `package.json` says "I need express version ^4.19.2" (any 4.x), `package-lock.json` records the **exact** version that was actually installed (e.g., `4.19.2`). This ensures every developer on your team installs identical versions.

---

### 3.5 `"type": "module"` — ES Modules vs CommonJS

Node.js historically used **CommonJS** syntax:
```javascript
const express = require("express");  // CommonJS (old)
module.exports = app;
```

Modern JavaScript uses **ES Modules**:
```javascript
import express from "express";       // ES Modules (modern)
export const app = express();
```

Your project uses `"type": "module"` in `package.json`, so all files use `import`/`export`. That's why every file ends with `.js` in the import path (e.g., `import { env } from "./config/env.js"`).

---

### 3.6 Vite — The Frontend Build Tool

**What it is**: A fast development server and build tool for modern frontend projects.

**Why we need a build tool**: Browsers don't natively understand JSX (`<Component />`), modern ES module imports of npm packages, or CSS preprocessing. Vite:
1. **Dev mode** (`npm run dev`): Serves your files with instant hot-reload (changes appear without refreshing)
2. **Build mode** (`npm run build`): Compiles, bundles, and minifies everything into a `dist/` folder for production

**In your project** — [vite.config.js](file:///d:/WebDev/Projects/call.io/frontend/vite.config.js):
```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";  // Plugin that teaches Vite how to compile JSX

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },  // Dev server runs on localhost:5173
});
```

---

### 3.7 Environment Variables (.env files)

**What they are**: Secret or environment-specific values that should **never** be hardcoded into your source code or committed to Git.

**Backend** [.env](file:///d:/WebDev/Projects/call.io/backend/.env.example):
```env
PORT=5000                    # Which port the server listens on
MONGO_URI="mongodb+srv://..." # Database connection string (contains password!)
JWT_SECRET=8198eccc73...     # Secret key used to sign JWT tokens
CLIENT_URL=http://localhost:5173  # Which frontend URL to allow through CORS
```

**Frontend** `.env`:
```env
VITE_API_URL=http://localhost:5000/api    # Backend URL the frontend calls
VITE_SOCKET_URL=http://localhost:5000     # WebSocket server URL
```

**Important**: Frontend env vars must start with `VITE_` to be accessible via `import.meta.env.VITE_*`. This is a Vite security feature — it prevents accidentally exposing server secrets to browser code.

**How they're loaded**:
- Backend: `dotenv` package reads `.env` and injects values into `process.env`
- Frontend: Vite reads `.env` files and replaces `import.meta.env.*` at compile time

---

### 3.8 Nodemon — The Auto-Restarter

When you edit a backend `.js` file, Node.js doesn't automatically pick up the change — you'd have to stop the server and restart it manually. **Nodemon** watches your files and restarts the server automatically whenever you save a change. That's why `npm run dev` uses `nodemon` and `npm start` uses raw `node`.

---

## 🏗️ Part 4: Project Architecture (Your Call.io Codebase)

### 4.1 The Full Directory Map

```text
call.io/
├── backend/                          ← SERVER-SIDE APPLICATION
│   ├── .env                          ← Secret environment variables
│   ├── package.json                  ← Backend dependencies & scripts
│   └── src/
│       ├── server.js                 ← 🚀 ENTRY POINT: Creates HTTP server, connects DB
│       ├── app.js                    ← Express app: middleware + route registration
│       ├── config/
│       │   ├── env.js                ← Loads & validates environment variables
│       │   ├── db.js                 ← MongoDB connection via Mongoose
│       │   ├── cors.js               ← Allowed origins list for CORS
│       │   └── redis.js              ← Redis connection for WebSocket scaling
│       ├── models/
│       │   ├── User.js               ← Mongoose schema: user fields, password hashing
│       │   └── Message.js            ← Mongoose schema: chat messages
│       ├── controllers/
│       │   ├── authController.js     ← Logic: register, login, get-current-user
│       │   ├── userController.js     ← Logic: search/list users
│       │   └── messageController.js  ← Logic: fetch/mark messages
│       ├── routes/
│       │   ├── authRoutes.js         ← URL → Controller mapping for /api/auth/*
│       │   ├── userRoutes.js         ← URL → Controller mapping for /api/users/*
│       │   └── messageRoutes.js      ← URL → Controller mapping for /api/messages/*
│       ├── middleware/
│       │   ├── authMiddleware.js     ← JWT verification gate for protected routes
│       │   └── errorHandler.js       ← Global error catcher (last middleware)
│       ├── services/
│       │   └── tokenService.js       ← JWT sign & verify helper functions
│       └── sockets/
│           ├── socketServer.js       ← Socket.io server: events, rooms, broadcasts
│           └── socketState.js        ← In-memory tracking of online/busy users
│
├── frontend/                         ← CLIENT-SIDE APPLICATION
│   ├── .env                          ← Frontend environment variables (VITE_*)
│   ├── package.json                  ← Frontend dependencies & scripts
│   ├── vite.config.js                ← Vite build tool configuration
│   ├── index.html                    ← 🚀 THE SINGLE HTML PAGE (SPA entry)
│   └── src/
│       ├── main.jsx                  ← React bootstrap: mounts <App/> into the DOM
│       ├── App.jsx                   ← Route definitions (which URL → which page)
│       ├── api/
│       │   └── client.js             ← Axios instance + interceptors
│       ├── context/
│       │   ├── AuthContext.jsx        ← Global auth state (token, user, login/logout)
│       │   ├── SocketContext.jsx      ← Global WebSocket connection state
│       │   ├── ChatContext.jsx        ← Global chat state (messages, typing, unread)
│       │   └── CallContext.jsx        ← Global voice/video call state
│       ├── pages/
│       │   ├── LoginPage.jsx          ← Login form UI
│       │   ├── RegisterPage.jsx       ← Registration form UI
│       │   ├── DashboardPage.jsx      ← Main app dashboard (after login)
│       │   └── ChatLinkPage.jsx       ← Deep-link to a specific user's chat
│       ├── components/
│       │   ├── Header.jsx             ← Top navigation bar
│       │   ├── UserList.jsx           ← Online users sidebar
│       │   ├── ChatPanel.jsx          ← Chat message area
│       │   ├── CallPanel.jsx          ← Voice/video call UI
│       │   ├── IncomingCallModal.jsx   ← Incoming call popup
│       │   ├── VideoPane.jsx          ← Video stream display
│       │   └── CountryFlag.jsx        ← Country flag emoji renderer
│       └── styles/
│           └── main.css               ← All CSS styles
```

---

### 4.2 The MVC Pattern

Your backend follows the **MVC (Model-View-Controller)** pattern — a classic way to organize server code:

```text
Route → Controller → Model → Database
  ↑         ↓
  └── Response ←── (JSON data)
```

| Layer | Responsibility | Your Files |
|-------|---------------|------------|
| **Route** | Maps a URL path + HTTP method to a controller function | `authRoutes.js`, `userRoutes.js` |
| **Controller** | Contains the business logic (validate input, call model, format response) | `authController.js`, `userController.js` |
| **Model** | Defines the data shape (schema) and interacts with MongoDB | `User.js`, `Message.js` |
| **Middleware** | Functions that intercept requests before they reach controllers | `authMiddleware.js`, `errorHandler.js` |
| **Service** | Reusable utility functions extracted from controllers | `tokenService.js` |

---

### 4.3 The SPA (Single Page Application) Pattern

Your frontend is a **Single Page Application**. The browser loads **one** HTML file ([index.html](file:///d:/WebDev/Projects/call.io/frontend/index.html)) once. After that, React takes over and handles all "page navigation" by swapping components in and out — without ever reloading the browser page.

```text
index.html                          ← Browser loads this ONCE
  └── <div id="root"></div>          ← Empty container
        └── main.jsx                 ← React mounts into #root
              └── <BrowserRouter>    ← Intercepts URL changes
                    └── <AuthProvider>   ← Global auth state wraps everything
                          └── <SocketProvider>   ← WebSocket connection
                                └── <ChatProvider>   ← Chat state
                                      └── <App />     ← Routes decide which page shows
```

When you click a `<Link to="/login">`, React Router **does not** make a new HTTP request. It simply updates the browser URL and renders the matching component.

---

## 🔄 Part 5: The Full Request Lifecycle

Here's what happens from the moment a user clicks "Sign In" to seeing their dashboard:

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 1: User clicks "Sign In" on LoginPage.jsx                         │
│ ────────────────────────────────────────────                            │
│ React calls: await login(email, password)                               │
│ Which calls: api.post("/auth/login", { email, password })               │
│ Axios adds: Content-Type: application/json header                       │
└──────────────────────────────────────────────────────────────────────────┘
           │
           ▼  HTTP POST http://localhost:5000/api/auth/login
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Express receives the request                                    │
│ ────────────────────────────────                                        │
│ 1. cors() middleware → checks origin, adds Access-Control headers       │
│ 2. express.json() middleware → parses JSON body into req.body           │
│ 3. Router matches /api/auth → authRoutes.js                            │
│ 4. Route matches POST /login → authController.login()                   │
└──────────────────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Controller executes business logic                              │
│ ──────────────────────────────────────────                              │
│ 1. Validates input (email & password present?)                          │
│ 2. Mongoose query: User.findOne({ email }).select("+password")          │
│    → Mongoose sends query to MongoDB Atlas via network                  │
│    → MongoDB returns matching document (or null)                        │
│ 3. bcrypt.compare(inputPassword, storedHash) → true/false              │
│ 4. jwt.sign({ userId }, secret) → generates token string               │
│ 5. Returns: res.json({ token, user: safeUser(user) })                  │
└──────────────────────────────────────────────────────────────────────────┘
           │
           ▼  HTTP 200 { token: "eyJ...", user: { _id, name, email } }
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 4: React receives the response                                     │
│ ──────────────────────────────────                                      │
│ 1. AuthContext stores token in localStorage (survives refresh)          │
│ 2. AuthContext sets Axios default header: Authorization: Bearer <token> │
│ 3. AuthContext updates 'user' state → triggers re-render               │
│ 4. App.jsx: ProtectedRoute sees user is now set → renders Dashboard    │
│ 5. SocketContext detects token → opens WebSocket connection             │
│ 6. Server sends back online user list via socket event                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Part 6: Essential JavaScript Concepts

### 6.1 Promises & async/await

A **Promise** represents a value that will be available *in the future* (e.g., after a database query completes or an API responds).

```javascript
// Promise syntax (older)
fetch("/api/users")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// async/await syntax (modern — same thing, cleaner)
async function getUsers() {
  try {
    const response = await fetch("/api/users");  // Pauses here until response arrives
    const data = await response.json();          // Pauses here until JSON is parsed
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

`await` **pauses** the function until the Promise resolves. It only works inside `async` functions.

---

### 6.2 Destructuring

Extracting values from objects/arrays into variables:

```javascript
// Without destructuring
const body = req.body;
const email = body.email;
const password = body.password;

// With destructuring (same result, one line)
const { email, password } = req.body;
```

---

### 6.3 Spread Operator (`...`)

Creates copies of objects/arrays with modifications:

```javascript
const user = { name: "Pankaj", country: "India" };

// Create a copy with an extra field
const updatedUser = { ...user, email: "pankaj@test.com" };
// Result: { name: "Pankaj", country: "India", email: "pankaj@test.com" }
```

Used heavily in React state updates:
```javascript
setForm({ ...form, email: e.target.value });  // Update one field, keep the rest
```

---

### 6.4 Arrow Functions

Shorter syntax for functions. Used everywhere in modern JS:

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function (same thing)
const add = (a, b) => a + b;

// Arrow function with body
const add = (a, b) => {
  const result = a + b;
  return result;
};
```

---

### 6.5 Optional Chaining (`?.`)

Safely access nested properties without crashing if something is `null` or `undefined`:

```javascript
// Without optional chaining — crashes if error or response is null
const message = error.response.data.message;

// With optional chaining — returns undefined instead of crashing
const message = error?.response?.data?.message;
```

---

## 🔑 Part 7: Key Terms Glossary

| Term | Meaning |
|------|---------|
| **API** | Application Programming Interface — a set of URL endpoints your backend exposes for the frontend to call |
| **REST** | REpresentational State Transfer — a design pattern for APIs using HTTP methods (GET, POST, PUT, DELETE) |
| **Middleware** | A function that sits between the incoming request and your route handler. Can modify `req`, `res`, or stop the request entirely |
| **Schema** | A blueprint defining the structure, types, and rules for your data (enforced by Mongoose) |
| **ODM** | Object Data Modeling — Mongoose maps JavaScript objects to MongoDB documents |
| **JWT** | JSON Web Token — a signed, encoded string used for stateless authentication |
| **Hashing** | A one-way mathematical function that converts input to a fixed-length string. Cannot be reversed |
| **Salt** | Random data added to a password before hashing to ensure identical passwords produce different hashes |
| **CORS** | Cross-Origin Resource Sharing — browser security that blocks frontend from calling a different-origin backend unless the backend explicitly allows it |
| **WebSocket** | A persistent, bi-directional communication channel between client and server (unlike HTTP's request-response cycle) |
| **SPA** | Single Page Application — the browser loads one HTML page and React handles all navigation without full page reloads |
| **JSX** | JavaScript XML — HTML-like syntax inside JavaScript that React compiles to `createElement()` calls |
| **Virtual DOM** | An in-memory representation of the UI. React diffs the old and new virtual DOM to calculate minimal real DOM updates |
| **Context API** | React's built-in system for sharing global state across components without prop-drilling |
| **Hook** | A special React function (e.g., `useState`, `useEffect`, `useRef`) that lets function components manage state and side effects |
| **Prop** | Short for "property" — data passed from a parent component to a child component |
| **State** | Data that, when changed, triggers a component re-render |
| **Ref** | A mutable value that persists across renders but does NOT trigger re-renders when changed |
| **Bundle** | The final compiled, minified JavaScript file(s) that Vite produces from your source code for production |
| **Hot Module Replacement (HMR)** | Vite's ability to update the browser instantly when you save a file, without a full page reload |

---

## 🏃 Run the Demo: Full-Stack Request Tracer

We have built a demo that visually traces a request from frontend to backend and back, logging every middleware and layer it passes through. It makes the invisible visible.

### Steps to Run:
1. Open a terminal in `learning-hub/module-0-mern-fundamentals/demo`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open `http://localhost:4000` in your browser
5. Click the buttons to fire requests and watch the middleware pipeline execute in real time on the right panel
