import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.disable('etag'); // Disable ETag to prevent 304 caching

// ============ Routes mount (theo chuẩn service ownership) ============
// Exam_Service: student & teacher dashboard/classes/assignments/results
// KHÔNG mount auth/notification/question ở đây
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);

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
