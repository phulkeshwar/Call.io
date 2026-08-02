# Module 1: The Client-Server Connection (Request-Response & CORS)

In this module, we will demystify how your frontend (React) communicates with your backend (Express) and how web browsers secure this connection.

---

## 🚀 1. Node.js vs. Express: What's the Difference?

When starting out, it's easy to use "Node" and "Express" interchangeably, but they are completely different layers of the stack:

*   **Node.js**: A **JavaScript runtime** built on Chrome's V8 engine. It allows you to run JavaScript directly on your computer (outside of a web browser). Node.js provides core modules for filesystems, networking, and executing code.
*   **Express**: A **web framework** built *on top* of Node.js. Writing a raw HTTP server in Node.js requires parsing strings, manually writing headers, and managing socket buffers. Express abstracts this away, providing a simple routing system (`app.get`, `app.post`) and middleware support.

---

## 🔌 2. The HTTP Protocol & Request-Response Cycle

Every time your React client interacts with your server, it uses the **HTTP (Hypertext Transfer Protocol)**. 
HTTP is stateless: the client sends a **Request**, the server processes it, returns a **Response**, and the connection is closed.

```text
[ React (Client) ] ──( HTTP Request )──> [ Express (Server) ]
[ React (Client) ] <──( HTTP Response )── [ Express (Server) ]
```

### Anatomy of an HTTP Request
1.  **Method (Verb)**: Describes the action to perform:
    *   `GET`: Retrieve data (e.g., fetch users list). Must not have a request body.
    *   `POST`: Create new data (e.g., register a user).
    *   `PUT`/`PATCH`: Update existing data.
    *   `DELETE`: Delete data.
2.  **Path (URL)**: E.g., `/api/auth/login`.
3.  **Headers**: Metadata about the request (e.g., `Content-Type: application/json` or `Authorization: Bearer <token>`).
4.  **Body**: The actual data being sent (usually in JSON format).

### Anatomy of an HTTP Response
1.  **Status Code**: Tells the client what happened:
    *   `2xx (Success)`: E.g., `200 OK`, `201 Created` (used for successful resources).
    *   `4xx (Client Error)`: E.g., `400 Bad Request` (missing fields), `401 Unauthorized` (bad/no token), `409 Conflict` (email already exists).
    *   `5xx (Server Error)`: E.g., `500 Internal Server Error` (uncaught crash on the server).
2.  **Headers**: E.g., `Access-Control-Allow-Origin` (CORS), `Content-Type`.
3.  **Body**: The JSON payload returned (e.g., `{ token: "...", user: {...} }`).

---

## 🛡️ 3. What is CORS and Why Does it Block Me?

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism. 

### The Scenario
If you open a website at `http://localhost:5173` (your React dev server), and JavaScript on that page tries to fetch data from `http://localhost:5000` (your Express server), the browser notices that the **origins are different** (port 5173 vs. port 5000).

For safety, the browser blocks the frontend script from reading the backend response *unless* the backend server explicitly includes headers saying: **"Yes, I allow requests from http://localhost:5173"**.

### In Your Project
Look at [app.js](file:///d:/WebDev/Projects/call.io/backend/src/app.js) lines 11–21:
```javascript
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
```
Here, Express intercepts every incoming request. If the client origin matches your allowed domains (defined in [cors.js](file:///d:/WebDev/Projects/call.io/backend/src/config/cors.js)), Express adds the header:
`Access-Control-Allow-Origin: http://localhost:5173`
The browser sees this header and allows your React app to read the API responses.

---

## 🛠️ 4. Axios Interceptors: Client-Side Control

In your React app, you use Axios to make HTTP calls. To avoid writing custom login validation logic on *every single* API call, your project uses **Axios Interceptors**.

An interceptor acts like middleware for your client. It lets you inspect or modify a request *before* it leaves, or a response *immediately after* it arrives.

### In Your Project
Look at [client.js](file:///d:/WebDev/Projects/call.io/frontend/src/api/client.js) lines 10–23:
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthMutation = url.includes("/auth/login") || url.includes("/auth/register");

    if (status === 401 && !isAuthMutation) {
      unauthorizedHandler?.(); // Triggers a clear session/logout on the frontend
    }

    return Promise.reject(error);
  }
);
```
**Why is this optimized?**
If a user's login session expires (or they send a forged token), the server will return a `401 Unauthorized` response. Instead of checking for a `401` status inside every component's `catch` block, this single interceptor intercepts *all* failed responses, detects the `401`, and automatically kicks the user back to the login screen!

---

## 🏃 Run the Demo: Trigger & Fix a CORS Error

Let's execute a hands-on experiment. We have created a separate demo containing a backend and a frontend.

### Steps to Run:
1. Open a terminal in `learning-hub/module-1-architecture/demo`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the servers:
   ```bash
   npm run start
   ```
4. Follow the terminal instructions. You will open `index.html` in your browser.
   * **Experiment 1**: Click the button with CORS disabled on the server. You will see a red error in the browser console showing **Blocked by CORS**.
   * **Experiment 2**: Toggle CORS enabled on the server dashboard and click the button again. You will see the server send back the data successfully!
