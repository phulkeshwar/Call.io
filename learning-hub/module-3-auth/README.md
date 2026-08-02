# Module 3: Authentication & Security (Stateless JWT)

In this module, we will explore the core security system of modern web apps: stateless authentication using JSON Web Tokens (JWT). We will understand how your backend issues tokens, how it verifies them, and how your frontend stores them.

---

## 🔑 1. Session-Based Auth vs. Stateless Token-Based Auth

Historically, web apps used **session cookies**:
1.  User enters credentials.
2.  Server verifies them, creates a session row in a database, and sends back a `session_id` in a cookie.
3.  On every page load, the server queries the database to match that `session_id` to a user.

### Why MERN uses Token-Based Auth (JWT)
In modern web architectures and APIs, we prefer **stateless authentication**:
1.  User registers/logs in.
2.  Server verifies credentials and generates a **JSON Web Token (JWT)**, signing it with a secret key.
3.  The server **does not save** this token in its database. It just sends it to the client.
4.  The client stores the token (usually in `localStorage` or a cookie) and sends it on **every API request** inside the `Authorization` header.
5.  The server validates the token using cryptographical mathematics. If valid, it trusts the information inside the token *without looking anything up in a sessions database*.

---

## 🔬 2. Anatomy of a JWT

A JWT is a single string split by periods into three parts: `Header.Payload.Signature`.

```text
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJ1c2VySWQiOiI2N...2VjdCJ9 . T93d_s_mS...3-fI
  [           HEADER            ]   [           PAYLOAD          ]   [    SIGNATURE   ]
```

1.  **Header**: Specifies the hashing algorithm used (usually `HMAC SHA256`) and token type (JWT).
2.  **Payload (Claims)**: The data you want to store (e.g., `userId`, token creation time `iat`, expiration time `exp`). *Caution: Anyone can base64-decode the payload, so never store sensitive data like raw passwords in it!*
3.  **Signature**: The crucial security mechanism. The server hashes the `base64(Header) + base64(Payload)` using a secret key (the `JWT_SECRET` in your `.env` file). 

### How Verification Works
When a client sends a JWT, the Express server takes the Header and Payload sent by the client, hashes them with the server's private `JWT_SECRET`, and compares it with the Signature sent by the client.
*   If a user tries to change the payload (e.g., altering `userId: 10` to `userId: 1` to impersonate an admin), the signature will no longer match the hashed payload, and the server will reject it as **Invalid Token**.

---

## 🛡️ 3. Protecting Routes: Express Middleware

An Express **Middleware** is a function that has access to the Request object (`req`), Response object (`res`), and the `next` function. Middlewares run sequentially before your final endpoint logic.

### In Your Project
Look at [authMiddleware.js](file:///d:/WebDev/Projects/call.io/backend/src/middleware/authMiddleware.js):
```javascript
export async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = verifyToken(token); // Decodes payload and checks signature
    
    // Fetch user details from MongoDB (excluding password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user record to Request object so future routes can access it!
    req.user = user; 
    
    return next(); // Pass control to the next controller function
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
```

By adding `authMiddleware` to a route configuration:
```javascript
router.get("/me", authMiddleware, me);
```
Express will execute the middleware first. If validation fails, it terminates the request with a `401 Unauthorized` response. If it succeeds, it proceeds to the `me` controller, which has access to the logged-in user at `req.user`!

---

## 🖥️ 4. Frontend Session Management: React Context

On the frontend, React needs a global way to know if a user is logged in. In your app, this is managed by [AuthContext.jsx](file:///d:/WebDev/Projects/call.io/frontend/src/context/AuthContext.jsx).

```javascript
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  // Synchronize token state with Axios headers
  useEffect(() => {
    setAuthToken(token); // Sets axios.defaults.headers.common.Authorization = `Bearer ${token}`
  }, [token]);
  
  // ...
}
```

### Flow of User Login:
1.  User enters credentials in `LoginPage.jsx` ➡️ Submits.
2.  Frontend calls `/api/auth/login` using Axios.
3.  Backend authenticates, signs a JWT, and sends `{ token, user }` back.
4.  React captures the token, saves it to `localStorage` (so the login survives page refreshes), updates the Axios instance default headers, and updates the `user` state.
5.  All protected UI views (like the chat dashboard) now render because the global authentication state is populated.

---

## 🏃 Run the Demo: Authentication Server

We have built a full auth demo. It features:
*   A registration endpoint that saves mock users and signs JWTs.
*   A login endpoint.
*   A protected `/api/profile` endpoint guarded by token validation middleware.
*   A simulation client script that requests registration, retrieves the token, and calls the protected page.

### Steps to Run:
1. Open a terminal in `learning-hub/module-3-auth/demo`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server and client test script:
   ```bash
   npm run start
   ```
4. Observe the terminal output. It will print out each step of the handshake, showing the raw JWT and verifying its headers and claims.
