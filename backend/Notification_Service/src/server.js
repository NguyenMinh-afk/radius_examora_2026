import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Notification_Service: chỉ chứa notification CRUD
import notificationRoutes from "./routes/notification.routes.js";
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Examora Notification_Service is running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Notification_Service" });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`[Notification_Service] running on port ${PORT}`);
});
