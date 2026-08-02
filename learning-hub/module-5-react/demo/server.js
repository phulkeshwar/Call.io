import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static(__dirname));

const PORT = 5053;
app.listen(PORT, () => {
  console.log("\x1b[32m%s\x1b[0m", `\n⚛️  React Optimization Visualizer running at: http://localhost:${PORT}`);
  console.log("\x1b[33m%s\x1b[0m", `👉 Open http://localhost:${PORT} in your browser to start the simulation!\n`);
});
