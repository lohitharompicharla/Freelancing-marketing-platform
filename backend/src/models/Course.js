import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: String,
    level: String,
    duration: String,
    price: { type: String, default: "Free" },
    createdBy: { type: String, required: false },
    description: String,
    modules: [{
      title: String,
      level: String,
      content: [{
        title: String,
        type: { type: String }, // "video", "pdf", "text"
        url: String
      }]
    }],
    quiz: [{ question: String, options: [String], answer: String }]
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
