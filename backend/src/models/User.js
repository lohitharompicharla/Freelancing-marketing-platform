import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["freelancer", "client", "admin"], required: true },
    skills: { type: [String], default: [] },
    experienceLevel: { type: String, default: "Beginner" },
    portfolio: { type: [String], default: [] },
    completedProjects: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 },
    resumeUrl: { type: String, default: "" },
    resumeOriginalName: { type: String, default: "" },
    resumeData: {
      skills: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      experienceLevel: { type: String, default: "Beginner" }
    },
    recommendedProjects: {
      type: [
        {
          id: String,
          title: String,
          category: String,
          description: String,
          matchScore: Number,
          matchedSkills: [String],
          categoryMatches: [String],
          recommendationReason: String
        }
      ],
      default: []
    },
    certificates: {
      type: [
        {
          id: String,
          title: String,
          courseId: String,
          issuedAt: String,
          downloadUrl: String,
          certificateNumber: String
        }
      ],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
