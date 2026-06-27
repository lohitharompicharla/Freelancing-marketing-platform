import express from "express";
import { getRecommendedProjects, login, register, uploadResume } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { resumeUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", resumeUpload.single("resume"), register);
router.post("/login", login);
router.post("/upload-resume", resumeUpload.single("resume"), uploadResume);
router.get("/recommend-projects", protect, getRecommendedProjects);

export default router;
