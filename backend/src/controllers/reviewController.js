import { demoDb } from "../services/demoStore.js";
import { isMongoConnected } from "../config/db.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const toId = (value) => value?.toString?.() || value || "";

const sanitizeReview = (review) => ({
  id: review.id || review._id?.toString(),
  projectId: toId(review.projectId),
  clientId: toId(review.clientId),
  freelancerId: toId(review.freelancerId),
  rating: review.rating,
  review: review.review,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt
});

export const createReview = async (req, res) => {
  const { projectId } = req.params;
  const { freelancerId, rating, review } = req.body;

  let project;
  let existing;

  if (isMongoConnected()) {
    project = await Project.findById(projectId).lean();
    existing = await import("../models/Review.js").then((m) => m.default.findOne({ projectId }).lean());
  } else {
    project = await demoDb.projects.findById(projectId);
    existing = await demoDb.reviews.findOne((item) => item.projectId === projectId);
  }

  if (!project || (project.status !== "Completed" && project.status !== "Paid")) {
    return res.status(400).json({ message: "Only completed projects can be reviewed" });
  }

  if (existing) {
    return res.status(400).json({ message: "Review already exists for this project" });
  }

  let createdReview;
  let averageRating = Number(rating);

  if (isMongoConnected()) {
    const { default: Review } = await import("../models/Review.js");
    createdReview = await Review.create({
      projectId,
      clientId: req.user.id,
      freelancerId,
      rating: Number(rating),
      review
    });

    const reviews = await Review.find({ freelancerId }).lean();
    averageRating = reviews.reduce((sum, item) => sum + Number(item.rating), 0) / Math.max(reviews.length, 1);
    await User.findByIdAndUpdate(freelancerId, { rating: Number(averageRating.toFixed(1)) });
  } else {
    createdReview = await demoDb.reviews.insert({
      projectId,
      clientId: req.user.id,
      freelancerId,
      rating: Number(rating),
      review,
      createdAt: new Date().toISOString()
    });

    const reviews = await demoDb.reviews.filter((item) => item.freelancerId === freelancerId);
    averageRating = reviews.reduce((sum, item) => sum + Number(item.rating), 0) / Math.max(reviews.length, 1);
    await demoDb.users.update(freelancerId, { rating: Number(averageRating.toFixed(1)) });
  }

  res.status(201).json(sanitizeReview(createdReview));
};

export const getReviewsForFreelancer = async (req, res) => {
  const reviews = isMongoConnected()
    ? await import("../models/Review.js").then((m) => m.default.find({ freelancerId: req.params.freelancerId }).lean())
    : await demoDb.reviews.filter((item) => item.freelancerId === req.params.freelancerId);
  res.json(reviews.map(sanitizeReview));
};

export const getAllReviews = async (_req, res) => {
  const reviews = isMongoConnected()
    ? await import("../models/Review.js").then((m) => m.default.find().sort({ createdAt: -1 }).lean())
    : await demoDb.reviews.findAll();
  res.json(reviews.map(sanitizeReview));
};

export const getFreelancerRating = async (req, res) => {
  const freelancerId = req.params.freelancerId;
  let rating = 0;
  
  if (isMongoConnected()) {
    const user = await import("../models/User.js").then((m) => m.default.findById(freelancerId).lean());
    if (user) rating = user.rating || 0;
  } else {
    const user = await demoDb.users.findById(freelancerId);
    if (user) rating = user.rating || 0;
  }
  
  res.json({ freelancerId, rating });
};
