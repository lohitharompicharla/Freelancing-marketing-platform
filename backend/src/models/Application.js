import mongoose from "mongoose";

const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    userId: { type: Schema.Types.Mixed, ref: "User", required: true },
    jobId: { type: Schema.Types.Mixed, ref: "Project", default: null },
    internshipId: { type: Schema.Types.Mixed, ref: "Internship", default: null },
    applicationType: { type: String, enum: ["job", "internship"], default: "internship" },
    coverLetter: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Applied", "Pending", "Accepted", "Rejected", "applied", "accepted", "rejected"],
      default: "Applied"
    }
  },
  { timestamps: true }
);

applicationSchema.index(
  { userId: 1, jobId: 1, applicationType: 1 },
  { unique: true, partialFilterExpression: { applicationType: "job", jobId: { $exists: true } } }
);
applicationSchema.index(
  { userId: 1, internshipId: 1, applicationType: 1 },
  { unique: true, partialFilterExpression: { applicationType: "internship", internshipId: { $exists: true } } }
);

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
