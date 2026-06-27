import express from "express";
import {
  acceptApplication,
  getApplicationsByUser,
  getMyJobApplications,
  submitApplication
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/apply", protect, submitApplication);
router.post("/application/accept", protect, acceptApplication);
router.get("/my-applications", protect, getMyJobApplications);
router.get("/applications/:userId", protect, getApplicationsByUser);

export default router;
