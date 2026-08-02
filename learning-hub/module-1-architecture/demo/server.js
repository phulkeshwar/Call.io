import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. FRONTEND SERVER (Runs on Port 3000)
// ==========================================
const frontendApp = express();
frontendApp.use(express.static(__dirname));

frontendApp.listen(3000, () => {
  console.log("\x1b[36m%s\x1b[0m", "\n==============================================");
  console.log("\x1b[36m%s\x1b[0m", "🖥️  FRONTEND running at: http://localhost:3000");
  console.log("\x1b[36m%s\x1b[0m", "==============================================\n");
});

// ==========================================
// 2. BACKEND API SERVER (Runs on Port 5050)
// ==========================================
const apiApp = express();

// Middleware to log requests
apiApp.use((req, res, next) => {
  console.log(`[API Server] Received request: ${req.method} ${req.url} from Origin: ${req.headers.origin}`);
  next();
});

// Endpoint 1: NO CORS configurations (will fail in the browser)
apiApp.get("/api/no-cors", (req, res) => {
  res.json({
    message: "Success! (But browser won't let you read this because CORS is missing)",
    timestamp: new Date().toLocaleTimeString(),
  });
});

// Endpoint 2: MANUAL CORS configured (will succeed in the browser)
apiApp.get("/api/with-cors", (req, res) => {
  // Set the Access-Control-Allow-Origin header to permit port 3000
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  
  res.json({
    message: "Success! Access-Control-Allow-Origin header was sent by the backend.",
    timestamp: new Date().toLocaleTimeString(),
  });
});

apiApp.listen(5050, () => {
  console.log("\x1b[32m%s\x1b[0m", "⚙️  BACKEND API running at: http://localhost:5050");
  console.log("\x1b[33m%s\x1b[0m", "👉 Open http://localhost:3000 in your browser to start the demo!\n");
});
