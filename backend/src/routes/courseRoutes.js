import express from "express";
import {
  completeCourse,
  completeCourseByBody,
  getCertificates,
  getCourses,
  getMyCertificates,
  getProgress,
  getQuizAttempts,
  submitQuizAttempt,
  updateCourseProgress,
  verifyCertificate
} from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCourses);
router.get("/certificates", protect, getMyCertificates);
router.post("/complete-course", protect, completeCourseByBody);
router.get("/progress/:userId", protect, getProgress);
router.get("/quiz-attempts/:userId", protect, getQuizAttempts);
router.patch("/:courseId/progress", protect, updateCourseProgress);
router.post("/:courseId/attempt", protect, submitQuizAttempt);
router.post("/:courseId/complete", protect, completeCourse);
router.get("/certificates/:userId", getCertificates);
router.get("/verify/:certificateNumber", verifyCertificate);

export default router;
