import express from "express";
import { protect, verifyAdmin } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getAllProjects,
  getAllApplications,
  approveApplication,
  rejectApplication,
  resolveProject,
  createCourse,
  updateCourse,
  deleteCourse,
  createInternship,
  updateInternship,
  deleteInternship,
  deleteUser,
  deleteProject,
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getAllLearningPosts,
  createLearningPost,
  updateLearningPost,
  deleteLearningPost,
  toggleLearningPostApproval
} from "../controllers/adminController.js";

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect, verifyAdmin);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Projects & Applications
router.get("/projects", getAllProjects);
router.delete("/projects/:id", deleteProject);
router.patch("/projects/:id/resolve", resolveProject);

router.get("/applications", getAllApplications);
router.patch("/applications/:id/approve", approveApplication);
router.patch("/applications/:id/reject", rejectApplication);

// Courses
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);

// Internships
router.post("/internships", createInternship);
router.put("/internships/:id", updateInternship);
router.delete("/internships/:id", deleteInternship);

// Certifications
router.get("/certifications", getAllCertifications);
router.post("/certifications", createCertification);
router.put("/certifications/:id", updateCertification);
router.delete("/certifications/:id", deleteCertification);

router.get("/learning-posts", getAllLearningPosts);
router.post("/learning-posts", createLearningPost);
router.put("/learning-posts/:id", updateLearningPost);
router.delete("/learning-posts/:id", deleteLearningPost);
router.patch("/learning-posts/:id/toggle-approval", toggleLearningPostApproval);

export default router;
