import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: String,
    score: Number,
    downloadUrl: String,
    fileName: String,
    certificateNumber: String,
    issuedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
