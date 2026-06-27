import express from "express";
import {
  createInternship,
  getInternshipById,
  getInternships
} from "../controllers/internshipController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getInternships);
router.get("/:id", getInternshipById);
router.post("/", protect, createInternship);

export default router;
