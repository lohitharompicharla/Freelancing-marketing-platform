import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completedLessons: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

learningProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model("LearningProgress", learningProgressSchema);
