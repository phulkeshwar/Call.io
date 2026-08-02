import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// ──────────────────────────────────────────────
// In-memory log buffer per request
// ──────────────────────────────────────────────
let requestLogs = [];

function log(step, layer, message, detail = "") {
  const entry = {
    step,
    layer,
    message,
    detail,
    time: new Date().toISOString(),
  };
  requestLogs.push(entry);
  console.log(`  [Step ${step}] (${layer}) ${message}${detail ? " → " + detail : ""}`);
}

// ──────────────────────────────────────────────
// Serve static files (index.html)
// ──────────────────────────────────────────────
app.use(express.static(__dirname));

// ──────────────────────────────────────────────
// MIDDLEWARE 1: Request Logger
// ──────────────────────────────────────────────
app.use("/api/*", (req, res, next) => {
  requestLogs = []; // Reset logs for each new request
  console.log(`\n── New Request: ${req.method} ${req.originalUrl} ──`);
  log(1, "MIDDLEWARE", "Request Logger", `Received ${req.method} ${req.originalUrl} from client`);
  next();
});

// ──────────────────────────────────────────────
// MIDDLEWARE 2: JSON Body Parser
// ──────────────────────────────────────────────
app.use("/api/*", (req, res, next) => {
  log(2, "MIDDLEWARE", "JSON Body Parser", "Parsing request body as JSON");
  express.json()(req, res, next);
});

// ──────────────────────────────────────────────
// MIDDLEWARE 3: Simulated CORS Check
// ──────────────────────────────────────────────
app.use("/api/*", (req, res, next) => {
  const origin = req.headers.origin || "same-origin";
  log(3, "MIDDLEWARE", "CORS Checker", `Origin: "${origin}" → Allowed`);
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

// ──────────────────────────────────────────────
// MIDDLEWARE 4: Simulated Auth Check (optional)
// ──────────────────────────────────────────────
function fakeAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    log(4, "MIDDLEWARE", "Auth Guard", "No token found → BLOCKED (401)");
    return res.status(401).json({
      error: "Unauthorized",
      logs: requestLogs,
    });
  }
  log(4, "MIDDLEWARE", "Auth Guard", `Token "${authHeader.substring(7, 27)}..." → Verified ✓`);
  req.user = { id: 1, name: "DemoUser" };
  next();
}

// ──────────────────────────────────────────────
// ROUTE: Public Health Check (no auth)
// ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  log(4, "ROUTE", "GET /api/health", "Public endpoint reached");
  log(5, "CONTROLLER", "Health Controller", 'Returning { status: "ok" }');
  log(6, "RESPONSE", "Sending Response", "Status 200 → JSON body sent to client");
  res.json({ status: "ok", logs: requestLogs });
});

// ──────────────────────────────────────────────
// ROUTE: Simulated Login (creates token)
// ──────────────────────────────────────────────
app.post("/api/login", (req, res) => {
  const { email, password } = req.body || {};
  log(4, "ROUTE", "POST /api/login", "Login endpoint reached");
  log(5, "CONTROLLER", "Auth Controller", `Received: email="${email || "(empty)"}", password="${password ? "***" : "(empty)"}"`);

  if (!email || !password) {
    log(6, "VALIDATION", "Input Check", "Missing fields → 400 Bad Request");
    return res.status(400).json({ error: "Email and password required", logs: requestLogs });
  }

  // Simulate DB lookup
  log(6, "MODEL", "User.findOne()", `Querying MongoDB for email="${email}"`);
  log(7, "DATABASE", "MongoDB Response", "User document found in collection");
  log(8, "SERVICE", "bcrypt.compare()", "Comparing hashed passwords → Match ✓");
  log(9, "SERVICE", "jwt.sign()", "Signing JWT token with server secret");

  const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSJ9.demo-signature";

  log(10, "RESPONSE", "Sending Response", "Status 200 → { token, user } sent to client");

  res.json({
    token: fakeToken,
    user: { id: 1, name: "DemoUser", email },
    logs: requestLogs,
  });
});

// ──────────────────────────────────────────────
// ROUTE: Protected Profile (requires auth)
// ──────────────────────────────────────────────
app.get("/api/profile", fakeAuthMiddleware, (req, res) => {
  log(5, "ROUTE", "GET /api/profile", "Protected endpoint reached");
  log(6, "CONTROLLER", "Profile Controller", `Authorized as: ${req.user.name}`);
  log(7, "RESPONSE", "Sending Response", "Status 200 → Profile data sent to client");

  res.json({
    user: req.user,
    secret: "You can only see this if authenticated!",
    logs: requestLogs,
  });
});

// ──────────────────────────────────────────────
// ERROR HANDLER (last middleware — catches unhandled errors)
// ──────────────────────────────────────────────
app.use((err, req, res, _next) => {
  log("ERR", "ERROR HANDLER", "Caught Error", err.message);
  console.error(err);
  res.status(500).json({ error: "Internal server error", logs: requestLogs });
});

app.listen(PORT, () => {
  console.log("\x1b[36m%s\x1b[0m", `\n🧪 MERN Request Tracer running at: http://localhost:${PORT}`);
  console.log("\x1b[33m%s\x1b[0m", `👉 Open the URL above in your browser to begin!\n`);
});
