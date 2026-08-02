import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const app = express();
app.use(express.json());

const JWT_SECRET = "educational-secret-key-123";
const PORT = 5051;

// In-memory array acting as our database
const db = [];

// ==========================================
// 1. REGISTRATION ROUTE
// ==========================================
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Check if user already exists
  if (db.find((u) => u.username === username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  // Hash password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: db.length + 1,
    username,
    password: hashedPassword,
  };

  db.push(newUser);

  // Sign a JWT token (stores the userId in payload)
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: "1h" });

  console.log(`[Server] Registered new user: ${username}`);
  console.log(`[Server] Issued JWT: ${token.substring(0, 20)}...`);

  res.status(201).json({
    message: "Registration successful",
    token,
    user: { id: newUser.id, username },
  });
});

// ==========================================
// 2. LOGIN ROUTE
// ==========================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Compare input password with database hashed password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Sign a JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

  console.log(`[Server] Logged in user: ${username}`);

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, username },
  });
});

// ==========================================
// 3. JWT VERIFICATION MIDDLEWARE
// ==========================================
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    console.log(`[Server] Auth Blocked: Request missing or bad authorization header.`);
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  const token = header.split(" ")[1];

  try {
    // Verifies the signature of the token and checks if expired
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user in database
    const user = db.find((u) => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user (excluding password) to request
    req.user = { id: user.id, username: user.username };
    
    // Allow the request to proceed to endpoint
    next();
  } catch (error) {
    console.log(`[Server] Auth Blocked: Token verification failed (${error.message}).`);
    return res.status(401).json({ message: "Access Denied: Invalid or Expired Token" });
  }
}

// ==========================================
// 4. PROTECTED ENDPOINT
// ==========================================
app.get("/api/profile", authMiddleware, (req, res) => {
  console.log(`[Server] Authorized request for profile of: ${req.user.username}`);
  res.json({
    message: "Welcome to your protected profile dashboard!",
    secretData: "The atomic number of gold is 79.",
    authorizedUser: req.user,
  });
});

app.listen(PORT, () => {
  console.log("\x1b[32m%s\x1b[0m", `\n🚀 Auth Server listening on port ${PORT}...`);
});
