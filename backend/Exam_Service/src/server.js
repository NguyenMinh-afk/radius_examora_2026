import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ============ Routes mount (theo chuẩn service ownership) ============
// Exam_Service: student dashboard/classes/assignments/results
// KHÔNG mount auth/notification/question ở đây
import studentRoutes from "./routes/student.routes.js";
app.use("/api/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("Examora Exam_Service is running...");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Exam_Service" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Exam_Service] running on port ${PORT}`);
});
