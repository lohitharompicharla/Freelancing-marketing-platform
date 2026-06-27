import express from "express";
import {
  applyToProject,
  createProject,
  getProjectApplicants,
  getMyProjectApplications,
  getProjectSuggestions,
  getProjects,
  getRecommendedFreelancersForProject,
  getRecommendedProjectsForFreelancer,
  hireFreelancer,
  updateProjectStatus
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { projectUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", getProjects);
router.get("/me/applications", protect, getMyProjectApplications);
router.post("/suggestions", getProjectSuggestions);
router.post("/upload", protect, projectUpload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ fileName: req.file.filename, url: `/api/uploads/projects/${req.file.filename}` });
});
router.post("/", protect, createProject);
router.post("/:projectId/apply", protect, applyToProject);
router.get("/:projectId/applications", protect, getProjectApplicants);
router.patch("/:projectId/status", protect, updateProjectStatus);
router.post("/:projectId/hire", protect, hireFreelancer);
router.get("/:projectId/recommendations", getRecommendedFreelancersForProject);
router.get("/freelancer/:freelancerId/recommended", getRecommendedProjectsForFreelancer);

export default router;
