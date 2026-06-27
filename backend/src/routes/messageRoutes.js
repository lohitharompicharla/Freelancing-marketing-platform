import express from "express";
import { createMessage, getChats, getMessages, getMessagesByChatId } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/chats", protect, getChats);
router.get("/:chatId", protect, getMessagesByChatId);
router.get("/", protect, getMessages);
router.post("/", protect, createMessage);

export default router;
