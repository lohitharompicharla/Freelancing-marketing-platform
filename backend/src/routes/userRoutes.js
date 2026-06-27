import express from "express";
import { getProfile, getUsers, updateMyProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getUsers);
router.put("/profile", protect, updateMyProfile);
router.get("/:id", getProfile);

export default router;
