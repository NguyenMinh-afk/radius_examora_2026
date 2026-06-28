import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);
app.use(express.json());
app.use(cookieParser());

// User_Service: auth + profile/settings + admin
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Examora User_Service is running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "User_Service" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[User_Service] running on port ${PORT}`);
});
