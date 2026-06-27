import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import platformRoutes from "./routes/platformRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import certificationRoutes from "./routes/certificationRoutes.js";
import learningPostRoutes from "./routes/learningPostRoutes.js";
import { isMongoConnected } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/uploads", express.static(path.resolve(process.cwd(), "src/uploads")));

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend API is running. Open the frontend at http://localhost:5173",
    apiHealth: "/api/health"
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mode: isMongoConnected() ? "mongodb" : "demo" });
});

app.use("/api/auth", authRoutes);
app.use("/api", platformRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", applicationRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", learningPostRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
