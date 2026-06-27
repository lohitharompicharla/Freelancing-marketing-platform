import express from "express";
import { createReview, getAllReviews, getReviewsForFreelancer, getFreelancerRating } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/project/:projectId", protect, createReview);
router.get("/freelancer/:freelancerId", getReviewsForFreelancer);
router.get("/freelancer/:freelancerId/rating", getFreelancerRating);
router.get("/", getAllReviews);

export default router;
