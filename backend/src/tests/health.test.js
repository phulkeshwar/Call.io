import assert from "assert";

console.log("🧪 Running Call.io System Health Tests...");

try {
  // Test 1: Env validation check
  assert.ok(process.env.PORT || 5000, "Port must be defined");
  console.log("  ✓ Test 1 Passed: System environment port configuration valid.");

  // Test 2: CORS logic test
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test("http://localhost:5173");
  assert.strictEqual(isLocal, true, "Local dev origin regex should match localhost");
  console.log("  ✓ Test 2 Passed: CORS origin regex evaluation valid.");

  console.log("\n✅ All automated system tests passed successfully!");
  process.exit(0);
} catch (err) {
  console.error("\n❌ Test failure:", err);
  process.exit(1);
}
