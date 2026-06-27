import mongoose from "mongoose";

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    projectId: { type: Schema.Types.Mixed, ref: "Project", required: true, unique: true },
    clientId: { type: Schema.Types.Mixed, ref: "User", required: true },
    freelancerId: { type: Schema.Types.Mixed, ref: "User", required: true },
    participantIds: { type: [Schema.Types.Mixed], default: [] },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema);
