import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    provider: { 
      type: String, 
      required: true, 
      enum: ["Google", "Coursera", "Udemy", "edX", "LinkedIn Learning", "AWS", "Meta"] 
    },
    skills: { type: [String], default: [] },
    difficulty: { 
      type: String, 
      enum: ["Beginner", "Intermediate", "Advanced"], 
      default: "Beginner" 
    },
    duration: { type: String },
    validity: { type: String, default: "Lifetime" },
    domain: { type: String, required: true },
    description: { type: String },
    officialUrl: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

certificationSchema.index({ domain: 1, difficulty: 1, provider: 1 });

export default mongoose.models.Certification || mongoose.model("Certification", certificationSchema);
