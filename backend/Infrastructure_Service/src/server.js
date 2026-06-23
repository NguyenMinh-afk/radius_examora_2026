/**
 * Infrastructure_Service
 * KHÔNG chứa business logic student/exam/question
 * Chỉ chứa: queue consumers, email workers, cleanup jobs, storage, logging
 */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Infrastructure routes: health check, system metrics, etc.
app.get("/", (req, res) => res.send("Examora Infrastructure_Service is running..."));
app.get("/health", (req, res) => res.json({ status: "ok", service: "Infrastructure_Service" }));

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`[Infrastructure_Service] running on port ${PORT}`));
