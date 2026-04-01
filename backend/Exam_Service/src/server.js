import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


import authRoutes from "./routes/auth.routes.js";
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Examora API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});