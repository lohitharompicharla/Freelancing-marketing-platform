import express from "express";
import { createProjectPaymentOrder, getMyPayments, verifyProjectPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const mapProjectIdFromBody = (req, _res, next) => {
  if (!req.params.projectId && req.body?.projectId) {
    req.params.projectId = req.body.projectId;
  }
  next();
};

router.get("/", protect, getMyPayments);
router.post("/order", protect, mapProjectIdFromBody, createProjectPaymentOrder);
router.post("/projects/:projectId/order", protect, createProjectPaymentOrder);
router.post("/verify", protect, verifyProjectPayment);

export default router;
