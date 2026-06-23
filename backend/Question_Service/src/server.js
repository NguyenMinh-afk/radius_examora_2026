import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Question_Service: question CRUD
import questionRoutes from "./routes/question.routes.js";
app.use("/api/questions", questionRoutes);

app.get("/", (req, res) => res.send("Examora Question_Service is running..."));
app.get("/health", (req, res) => res.json({ status: "ok", service: "Question_Service" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[Question_Service] running on port ${PORT}`));
