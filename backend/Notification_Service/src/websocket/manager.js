/**
 * WebSocket Connection Manager
 * Quản lý kết nối WebSocket theo userId
 * Singleton - export một instance duy nhất
 */
import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production";

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.server = null;
  }

  /**
   * Khởi tạo WebSocket server gắn với HTTP server
   */
  initialize(httpServer) {
    if (this.wss) {
      console.warn("[WebSocketManager] Already initialized");
      return;
    }

    this.wss = new WebSocketServer({ server: httpServer, path: "/ws/notifications" });

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });

    this.wss.on("error", (error) => {
      console.error("[WebSocketManager] Server error:", error.message);
    });

    console.log("[WebSocketManager] WebSocket server initialized on /ws/notifications");
  }

  /**
   * Xử lý kết nối mới - authenticate qua JWT token
   */
  handleConnection(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      console.warn("[WebSocketManager] Connection rejected: missing token");
      ws.close(4001, "Missing token");
      return;
    }

    let userId;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id || decoded.userId;
      if (!userId) {
        throw new Error("Token missing user ID");
      }
    } catch (error) {
      console.warn("[WebSocketManager] Connection rejected: invalid token", error.message);
      ws.close(4002, "Invalid token");
      return;
    }

    ws.userId = userId;
    ws.isAlive = true;

    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    console.log(`[WebSocketManager] Client connected: userId=${userId}, total=${this.clients.size}`);

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, message);
      } catch {
        // Ignore malformed messages
      }
    });

    ws.on("close", () => {
      this.removeClient(ws);
      console.log(`[WebSocketManager] Client disconnected: userId=${userId}`);
    });

    ws.on("error", (error) => {
      console.error(`[WebSocketManager] Client error: userId=${userId}`, error.message);
      this.removeClient(ws);
    });

    ws.send(
      JSON.stringify({
        type: "connected",
        message: "WebSocket connected successfully",
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Xử lý tin nhắn từ client (ping/pong heartbeat)
   */
  handleMessage(ws, message) {
    if (message.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
    }
  }

  /**
   * Gửi notification tới một user cụ thể
   */
  sendToUser(userId, notification) {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.size === 0) {
      console.log(`[WebSocketManager] No active connections for userId=${userId}`);
      return { delivered: 0 };
    }

    const payload = JSON.stringify({
      type: "notification",
      data: notification,
      timestamp: new Date().toISOString(),
    });

    let delivered = 0;
    for (const client of userClients) {
      if (client.readyState === 1) {
        client.send(payload);
        delivered++;
      }
    }

    console.log(`[WebSocketManager] Notification sent to userId=${userId}, delivered=${delivered}`);
    return { delivered };
  }

  /**
   * Gửi thông báo tới tất cả users
   */
  broadcast(message) {
    const payload = JSON.stringify(message);
    let count = 0;
    for (const [, clients] of this.clients) {
      for (const client of clients) {
        if (client.readyState === 1) {
          client.send(payload);
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Xóa client khỏi danh sách
   */
  removeClient(ws) {
    const userId = ws.userId;
    if (!userId) return;

    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  /**
   * Health check - heartbeat cho tất cả clients
   */
  startHeartbeat(intervalMs = 30000) {
    setInterval(() => {
      if (!this.wss) return;

      for (const [, clients] of this.clients) {
        for (const client of clients) {
          if (!client.isAlive) {
            client.terminate();
            continue;
          }
          client.isAlive = false;
          client.ping();
        }
      }
    }, intervalMs);
  }

  /**
   * Lấy số lượng connected users
   */
  getStats() {
    let totalConnections = 0;
    for (const [, clients] of this.clients) {
      totalConnections += clients.size;
    }
    return {
      uniqueUsers: this.clients.size,
      totalConnections,
    };
  }

  /**
   * Đóng tất cả connections
   */
  close() {
    if (this.wss) {
      this.clients.clear();
      this.wss.close();
      this.wss = null;
      this.clients.clear();
      console.log("[WebSocketManager] WebSocket server closed");
    }
  }
}

export default new WebSocketManager();
