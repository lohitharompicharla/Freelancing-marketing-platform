import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    projectId: String,
    clientId: String,
    freelancerId: String,
    rating: Number,
    review: String
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
