/**
 * API_Gateway - Proxy/routing layer, không chứa business logic
 * Proxy requests đến các service:
 * - User_Service (auth, profile)
 * - Exam_Service (student dashboard/classes/assignments/results)
 * - Notification_Service (notifications)
 * - Question_Service (questions)
 * - AI_Generation_Service (ai)
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("Examora API Gateway is running..."));
app.get("/health", (req, res) => res.json({ status: "ok", service: "API_Gateway" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[API_Gateway] running on port ${PORT}`));
