import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// AI_Generation_Service: AI question generation
import aiRoutes from "./routes/ai.routes.js";
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("Examora AI_Generation_Service is running..."));
app.get("/health", (req, res) => res.json({ status: "ok", service: "AI_Generation_Service" }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`[AI_Generation_Service] running on port ${PORT}`));
