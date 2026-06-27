import mongoose from "mongoose";

const { Schema } = mongoose;

const quizAttemptSchema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, ref: "User", required: true },
    courseId: { type: Schema.Types.Mixed, ref: "Course", required: true },
    answers: { type: [String], default: [] },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attemptedAt: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, courseId: 1, createdAt: -1 });

export default mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
