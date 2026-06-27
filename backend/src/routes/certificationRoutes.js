import express from "express";
import {
  getCertifications,
  getCertificationById,
  getRecommendations
} from "../controllers/certificationController.js";

const router = express.Router();

router.get("/", getCertifications);
router.get("/recommendations/top", getRecommendations);
router.get("/:id", getCertificationById);

export default router;
