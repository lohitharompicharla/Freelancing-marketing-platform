import express from "express";
import { createChat, getChatsByUserId } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createChat);
router.get("/:userId", protect, getChatsByUserId);

export default router;
