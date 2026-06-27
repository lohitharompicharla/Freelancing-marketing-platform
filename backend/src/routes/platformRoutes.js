import express from "express";
import { getRecommendedProjects, register, uploadResume } from "../controllers/authController.js";
import { completeCourseByBody, getMyCertificates } from "../controllers/courseController.js";
import { getClientProjects, getFreelancerProjects } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { resumeUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", resumeUpload.single("resume"), register);
router.post("/upload-resume", resumeUpload.single("resume"), uploadResume);
router.get("/recommend-projects", protect, getRecommendedProjects);
router.post("/complete-course", protect, completeCourseByBody);
router.get("/certificates", protect, getMyCertificates);
router.get("/client/:id/projects", protect, getClientProjects);
router.get("/freelancer/:id/projects", protect, getFreelancerProjects);

export default router;
