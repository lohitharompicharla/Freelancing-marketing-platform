import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    chatId: { type: Schema.Types.Mixed, ref: "Chat", required: true },
    projectId: { type: Schema.Types.Mixed, ref: "Project", required: true },
    clientId: { type: Schema.Types.Mixed, ref: "User", required: true },
    freelancerId: { type: Schema.Types.Mixed, ref: "User", required: true },
    senderId: { type: Schema.Types.Mixed, ref: "User", required: true },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model("Message", messageSchema);
