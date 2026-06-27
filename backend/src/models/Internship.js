import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    salary: { type: String, required: true },
    stipend: { type: String, required: true },
    skills: { type: [String], default: [] },
    description: { type: String, required: true },
    applicantsCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Internship || mongoose.model("Internship", internshipSchema);
