import mongoose from "mongoose";

const projectApplicationSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    freelancerId: { type: String, required: true },
    coverLetter: { type: String, default: "" },
    status: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

projectApplicationSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

export default mongoose.models.ProjectApplication || mongoose.model("ProjectApplication", projectApplicationSchema);
