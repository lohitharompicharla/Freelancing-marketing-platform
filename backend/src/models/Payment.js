import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true },
    clientId: { type: String, required: true },
    freelancerId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, default: "created" },
    provider: { type: String, default: "razorpay" },
    providerOrderId: { type: String, default: "" },
    providerPaymentId: { type: String, default: "" },
    providerSignature: { type: String, default: "" },
    receipt: { type: String, default: "" },
    paidAt: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
