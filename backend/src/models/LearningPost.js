import mongoose from "mongoose";

const learningPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  domain: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  whatYouWillLearn: {
    type: [String],
    default: [],
  },
  whatYouGet: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    trim: true,
  },
  duration: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  officialUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https:\/\//.test(v);
      },
      message: props => `${props.value} is not a valid https URL!`
    }
  },
  isApproved: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

learningPostSchema.index({ domain: 1 });
learningPostSchema.index({ level: 1 });
learningPostSchema.index({ provider: 1 });
learningPostSchema.index({ createdAt: -1 });

const LearningPost = mongoose.model("LearningPost", learningPostSchema);

export default LearningPost;
