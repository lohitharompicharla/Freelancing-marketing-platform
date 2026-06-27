import express from "express";
import { getLearningPosts, getLearningPostById, getLearningRecommendations } from "../controllers/learningPostController.js";

const router = express.Router();

router.get("/learning-posts", getLearningPosts);
router.get("/learning-posts/:id", getLearningPostById);
router.get("/learning-recommendations", getLearningRecommendations);

export default router;
