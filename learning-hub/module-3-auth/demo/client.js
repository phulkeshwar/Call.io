import http from "http";

const PORT = 5051;
const baseUrl = `http://localhost:${PORT}`;

// Helper to make HTTP requests using native Node.js http module (no dependencies required)
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            statusCode: res.statusCode,
            body: data,
          });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Simple sleep helper
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startDemo() {
  // Give server 1.5 seconds to spin up
  await sleep(1500);

  console.log("\x1b[35m%s\x1b[0m", "\n==============================================");
  console.log("🖥️  CLIENT SIMULATOR STARTED");
  console.log("==============================================\n");

  // Step 1: Access protected profile with NO token
  console.log("👉 STEP 1: Attempting to access protected profile WITHOUT a token...");
  try {
    const res = await request("GET", "/api/profile");
    console.log(`Response Code: ${res.statusCode}`);
    console.log(`Response Body:`, res.body);
  } catch (err) {
    console.error("Connection failed:", err.message);
    return;
  }

  // Step 2: Register a new user
  console.log("\n👉 STEP 2: Registering a user ('MernMaster')...");
  const regRes = await request("POST", "/api/register", {
    username: "MernMaster",
    password: "learningPassword123",
  });
  console.log(`Response Code: ${regRes.statusCode}`);
  const jwtToken = regRes.body.token;
  console.log(`Received Token: \x1b[36m${jwtToken}\x1b[0m`);

  // Step 3: Access protected profile WITH valid token
  console.log("\n👉 STEP 3: Attempting to access protected profile WITH the received token...");
  const profileRes = await request("GET", "/api/profile", null, jwtToken);
  console.log(`Response Code: \x1b[32m${profileRes.statusCode} OK\x1b[0m`);
  console.log(`Secret Data Retrieved: \x1b[32m"${profileRes.body.secretData}"\x1b[0m`);
  console.log(`Server verified user payload:`, profileRes.body.authorizedUser);

  // Step 4: Access protected profile WITH forged token
  console.log("\n👉 STEP 4: Attempting to access profile with an altered token...");
  // We tamper with the signature (change the last characters)
  const tamperedToken = jwtToken.substring(0, jwtToken.length - 4) + "AAAA";
  const forgeRes = await request("GET", "/api/profile", null, tamperedToken);
  console.log(`Response Code: \x1b[31m${forgeRes.statusCode} Unauthorized\x1b[0m`);
  console.log(`Response Body:`, forgeRes.body);

  console.log("\x1b[35m%s\x1b[0m", "\n==============================================");
  console.log("🏁 CLIENT SIMULATOR FINISHED SUCCESSFULLY!");
  console.log("==============================================\n");
}

startDemo().catch(console.error);
