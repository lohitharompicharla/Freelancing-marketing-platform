import mongoose from "mongoose";

const { Schema } = mongoose;

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    requiredSkills: { type: [String], default: [] },
    budgetRange: { type: String, required: true },
    deadline: { type: String, required: true },
    experienceLevel: { type: String, default: "Beginner" },
    clientId: { type: Schema.Types.Mixed, ref: "User", required: true },
    freelancerId: { type: Schema.Types.Mixed, ref: "User", default: null },
    status: { type: String, default: "Open" },
    paymentStatus: { type: String, default: "unpaid" },
    paymentAmount: { type: Number, default: 0 },
    completedAt: { type: String, default: "" },
    paidAt: { type: String, default: "" },
    fileName: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
