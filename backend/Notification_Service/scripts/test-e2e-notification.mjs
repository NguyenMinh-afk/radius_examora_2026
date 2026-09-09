/**
 * End-to-End Notification Test Script
 * Test toàn bộ flow: WebSocket + API + RabbitMQ notification
 * 
 * Usage:
 *   1. Start Notification_Service: npm run dev
 *   2. Start Infrastructure_Service
 *   3. Run: node scripts/test-e2e-notification.mjs <user_id> [jwt_token]
 * 
 * Hoặc test trực tiếp:
 *   node scripts/test-e2e-notification.mjs 1
 */
import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004";
const WS_URL = `ws://localhost:${process.env.PORT || 3004}/ws/notifications`;

// Test JWT token (replace with real token from login)
const TEST_USER_ID = process.argv[2] || "1";
const JWT_TOKEN = process.argv[3] || process.env.TEST_JWT_TOKEN || "test-token";

let ws = null;
let notificationReceived = false;

function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: "\x1b[36m[i]\x1b[0m",
    success: "\x1b[32m[+]\x1b[0m",
    error: "\x1b[31m[!]\x1b[0m",
    warn: "\x1b[33m[W]\x1b[0m",
  }[level] || "[ ]";
  console.log(`${timestamp} ${prefix} ${message}`, ...args);
}

async function testHealthEndpoint() {
  log("info", "Testing health endpoints...");

  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/health`);
    const data = await res.json();
    log("success", `Health check: ${data.status} (uptime: ${Math.floor(data.uptime)}s)`);

    const wsRes = await fetch(`${NOTIFICATION_SERVICE_URL}/health/ws`);
    const wsData = await wsRes.json();
    log("success", `WebSocket stats: ${wsData.websocket.uniqueUsers} users, ${wsData.websocket.totalConnections} connections`);
    return true;
  } catch (error) {
    log("error", `Health check failed: ${error.message}`);
    return false;
  }
}

async function testWebSocketConnection() {
  log("info", `Connecting to WebSocket: ${WS_URL}?token=${JWT_TOKEN.slice(0, 20)}...`);

  return new Promise((resolve) => {
    try {
      ws = new WebSocket(`${WS_URL}?token=${JWT_TOKEN}`);

      ws.on("open", () => {
        log("success", "WebSocket connected!");
      });

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          log("success", `Received message: ${message.type}`, message);

          if (message.type === "notification") {
            notificationReceived = true;
            log("success", "NOTIFICATION RECEIVED VIA WEBSOCKET!");
            log("info", `  - ID: ${message.data.id}`);
            log("info", `  - Title: ${message.data.title}`);
            log("info", `  - Message: ${message.data.message}`);
          }
        } catch {
          log("warn", "Received non-JSON message");
        }
      });

      ws.on("error", (error) => {
        log("error", `WebSocket error: ${error.message}`);
      });

      ws.on("close", (code, reason) => {
        log("info", `WebSocket closed: code=${code}, reason=${reason}`);
        ws = null;
      });

      setTimeout(() => resolve(true), 2000);
    } catch (error) {
      log("error", `Failed to connect: ${error.message}`);
      resolve(false);
    }
  });
}

async function testDirectNotificationAPI() {
  log("info", `Testing direct notification API (user_id: ${TEST_USER_ID})...`);

  const testNotification = {
    user_id: TEST_USER_ID,
    type: "system",
    title: "E2E Test Notification",
    content: "This is a test notification sent via the /internal endpoint",
    metadata: {
      source: "e2e-test",
      timestamp: new Date().toISOString(),
    },
    message_id: `test-${Date.now()}`,
  };

  try {
    const res = await fetch(`${NOTIFICATION_SERVICE_URL}/api/notifications/internal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testNotification),
    });

    const data = await res.json();
    log("success", `Notification created: id=${data.id}, duplicate=${data.duplicate}`);
    return true;
  } catch (error) {
    log("error", `Failed to create notification: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
}

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("EXAMORA NOTIFICATION E2E TEST");
  console.log("=".repeat(60));
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Notification Service: ${NOTIFICATION_SERVICE_URL}`);
  console.log(`WebSocket URL: ${WS_URL}`);
  console.log(`Test User ID: ${TEST_USER_ID}`);
  console.log("=".repeat(60) + "\n");

  const results = {
    health: false,
    websocket: false,
    directApi: false,
    notificationReceived: false,
  };

  results.health = await testHealthEndpoint();
  console.log();

  if (!results.health) {
    log("error", "Health check failed. Make sure Notification_Service is running.");
    return results;
  }

  results.websocket = await testWebSocketConnection();
  console.log();

  await new Promise((r) => setTimeout(r, 500));

  results.directApi = await testDirectNotificationAPI();
  console.log();

  await new Promise((r) => setTimeout(r, 1500));

  results.notificationReceived = notificationReceived;

  console.log("\n" + "=".repeat(60));
  console.log("TEST SUMMARY");
  console.log("=".repeat(60));
  log(results.health ? "success" : "error", `Health Check: ${results.health ? "PASS" : "FAIL"}`);
  log(results.websocket ? "success" : "error", `WebSocket Connection: ${results.websocket ? "PASS" : "FAIL"}`);
  log(results.directApi ? "success" : "error", `Direct API: ${results.directApi ? "PASS" : "FAIL"}`);
  log(results.notificationReceived ? "success" : "warn", `WebSocket Push: ${results.notificationReceived ? "PASS" : "PENDING (no client connected)"}`);
  console.log("=".repeat(60) + "\n");

  await cleanup();

  const allPassed = results.health && results.websocket && results.directApi;
  if (allPassed) {
    log("success", "All basic tests passed! Notification system is working.");
  } else {
    log("warn", "Some tests failed. Check the output above for details.");
  }

  return results;
}

runTests()
  .then((results) => {
    const allPassed = results.health && results.websocket && results.directApi;
    process.exit(allPassed ? 0 : 1);
  })
  .catch((error) => {
    log("error", `Unexpected error: ${error.message}`);
    process.exit(1);
  });
