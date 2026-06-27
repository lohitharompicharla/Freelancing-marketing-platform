import crypto from "crypto";
import Payment from "../models/Payment.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { getRazorpayInstance, getRazorpayKeyId, isRazorpayConfigured } from "../services/razorpayService.js";
import { getProjectBudgetAmount } from "../utils/projectFinance.js";

const sanitizePayment = (payment) => ({
  id: payment.id || payment._id?.toString(),
  projectId: payment.projectId,
  clientId: payment.clientId,
  freelancerId: payment.freelancerId,
  amount: payment.amount,
  currency: payment.currency || "INR",
  status: payment.status,
  provider: payment.provider || "razorpay",
  providerOrderId: payment.providerOrderId || "",
  providerPaymentId: payment.providerPaymentId || "",
  receipt: payment.receipt || "",
  paidAt: payment.paidAt || "",
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt
});

const getProjectById = async (projectId) => {
  if (isMongoConnected()) {
    const mongoProject = await Project.findById(projectId).lean();
    if (mongoProject) {
      return { project: mongoProject, source: "mongo" };
    }
  }

  const demoProject = await demoDb.projects.findById(projectId);
  return demoProject ? { project: demoProject, source: "demo" } : { project: null, source: null };
};

const getUserById = async (userId) => {
  if (isMongoConnected()) {
    const mongoUser = await User.findById(userId).lean();
    if (mongoUser) {
      return { user: mongoUser, source: "mongo" };
    }
  }

  const demoUser = await demoDb.users.findById(userId);
  return demoUser ? { user: demoUser, source: "demo" } : { user: null, source: null };
};

const updateProjectRecord = async (projectId, updates, sourceHint) => {
  if (sourceHint === "mongo" && isMongoConnected()) {
    const updated = await Project.findByIdAndUpdate(projectId, updates, { new: true }).lean();
    if (updated) {
      return updated;
    }
  }

  return demoDb.projects.update(projectId, updates);
};

const updateUserRecord = async (userId, updates, sourceHint) => {
  if (sourceHint === "mongo" && isMongoConnected()) {
    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).lean();
    if (updated) {
      return updated;
    }
  }

  return demoDb.users.update(userId, updates);
};

const insertPaymentRecord = async (payload) =>
  isMongoConnected() ? Payment.create(payload) : demoDb.payments.insert(payload);

const findPaymentByOrderId = async (providerOrderId) => {
  if (isMongoConnected()) {
    const payment = await Payment.findOne({ providerOrderId }).lean();
    if (payment) {
      return { payment, source: "mongo" };
    }
  }

  const payment = await demoDb.payments.findOne((item) => item.providerOrderId === providerOrderId);
  return { payment, source: payment ? "demo" : null };
};

const updatePaymentRecord = async (paymentId, updates, sourceHint) => {
  if (sourceHint === "mongo" && isMongoConnected()) {
    const updated = await Payment.findByIdAndUpdate(paymentId, updates, { new: true }).lean();
    if (updated) {
      return updated;
    }
  }

  return demoDb.payments.update(paymentId, updates);
};

export const createProjectPaymentOrder = async (req, res) => {
  const { projectId } = req.params;
  const { amount, markCompleted = false } = req.body;
  const { project, source } = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (project.clientId !== req.user.id) {
    return res.status(403).json({ message: "Only the client for this project can release payment" });
  }

  if (!project.freelancerId) {
    return res.status(400).json({ message: "Assign a freelancer before creating a payment order" });
  }

  const finalAmount = getProjectBudgetAmount(project, amount);
  if (!finalAmount) {
    return res.status(400).json({ message: "Unable to determine a valid project payout amount" });
  }

  if (project.paymentStatus === "paid") {
    return res.status(400).json({ message: "Payment has already been completed for this project" });
  }

  const nowIso = new Date().toISOString();
  const shouldMarkCompleted = markCompleted || project.status === "Completed" || project.status === "Paid";
  if (shouldMarkCompleted && project.status !== "Completed" && project.status !== "Paid") {
    await updateProjectRecord(
      projectId,
      {
        status: "Completed",
        completedAt: nowIso,
        paymentAmount: finalAmount,
        paymentStatus: "pending"
      },
      source
    );
  } else {
    await updateProjectRecord(
      projectId,
      {
        paymentAmount: finalAmount,
        paymentStatus: "pending"
      },
      source
    );
  }

  const receipt = `receipt_${projectId}_${Date.now()}`;

  if (!isRazorpayConfigured()) {
    const mockOrderId = `demo_order_${Date.now()}`;
    const payment = await insertPaymentRecord({
      projectId,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      amount: finalAmount,
      currency: "INR",
      status: "created",
      provider: "demo",
      providerOrderId: mockOrderId,
      receipt
    });

    return res.status(201).json({
      mode: "demo",
      key: "demo_key",
      amount: finalAmount,
      currency: "INR",
      orderId: mockOrderId,
      paymentId: payment.id || payment._id?.toString(),
      projectId
    });
  }

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount: finalAmount * 100,
    currency: "INR",
    receipt,
    notes: {
      projectId,
      clientId: project.clientId,
      freelancerId: project.freelancerId
    }
  });

  const payment = await insertPaymentRecord({
    projectId,
    clientId: project.clientId,
    freelancerId: project.freelancerId,
    amount: finalAmount,
    currency: "INR",
    status: "created",
    provider: "razorpay",
    providerOrderId: order.id,
    receipt
  });

  res.status(201).json({
    mode: "razorpay",
    key: getRazorpayKeyId(),
    amount: finalAmount,
    currency: "INR",
    orderId: order.id,
    paymentId: payment.id || payment._id?.toString(),
    projectId
  });
};

export const verifyProjectPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId, projectId } = req.body;
  const effectiveOrderId = razorpayOrderId || orderId;

  if (!effectiveOrderId || !projectId) {
    return res.status(400).json({ message: "Order id and project id are required" });
  }

  const { payment, source } = await findPaymentByOrderId(effectiveOrderId);

  if (!payment) {
    return res.status(404).json({ message: "Payment record not found" });
  }

  if (payment.clientId !== req.user.id) {
    return res.status(403).json({ message: "Only the client can verify this payment" });
  }

  if (payment.status === "paid") {
    return res.json({ payment: sanitizePayment(payment), projectStatus: "Paid" });
  }

  if (payment.provider === "razorpay") {
    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Payment verification fields are required" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${effectiveOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid Razorpay payment signature" });
    }
  }

  const paidAt = new Date().toISOString();
  const updatedPayment = await updatePaymentRecord(
    payment.id || payment._id?.toString(),
    {
      status: "paid",
      providerPaymentId: razorpayPaymentId || paymentId || `demo_payment_${Date.now()}`,
      providerSignature: razorpaySignature || "",
      paidAt
    },
    source
  );

  const { project, source: projectSource } = await getProjectById(projectId);
  await updateProjectRecord(
    projectId,
    {
      status: "Paid",
      paymentStatus: "paid",
      paymentAmount: payment.amount,
      paidAt,
      completedAt: project?.completedAt || paidAt
    },
    projectSource
  );

  const { user: freelancer, source: freelancerSource } = await getUserById(payment.freelancerId);
  const nextEarnings = Number(freelancer?.earnings || 0) + Number(payment.amount || 0);
  await updateUserRecord(payment.freelancerId, { earnings: nextEarnings }, freelancerSource);

  res.json({
    payment: sanitizePayment(updatedPayment),
    projectStatus: "Paid"
  });
};

export const getMyPayments = async (req, res) => {
  let payments = [];

  if (isMongoConnected()) {
    payments = await Payment.find({
      $or: [{ clientId: req.user.id }, { freelancerId: req.user.id }]
    })
      .sort({ createdAt: -1 })
      .lean();
  } else {
    payments = await demoDb.payments.filter(
      (payment) => payment.clientId === req.user.id || payment.freelancerId === req.user.id
    );
  }

  res.json(payments.map(sanitizePayment));
};
