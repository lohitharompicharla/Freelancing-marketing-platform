import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { getFreelancerBadges } from "../services/badgeService.js";

const sanitizeUser = (user) => ({
  id: user.id || user._id?.toString(),
  ...user,
  badges: getFreelancerBadges(user),
  password: undefined
});

export const getUsers = async (_req, res) => {
  const users = isMongoConnected() ? await User.find().lean() : await demoDb.users.findAll();
  res.json(users.map(sanitizeUser));
};

export const getProfile = async (req, res) => {
  const user = isMongoConnected()
    ? await User.findById(req.params.id).lean()
    : await demoDb.users.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(sanitizeUser(user));
};

export const updateMyProfile = async (req, res) => {
  const allowedFields = ["name", "skills", "experienceLevel", "portfolio"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  if (Array.isArray(updates.skills)) {
    updates.skills = [...new Set(updates.skills.map((skill) => String(skill).trim()).filter(Boolean))];
  }

  if (Array.isArray(updates.portfolio)) {
    updates.portfolio = updates.portfolio.map((item) => String(item).trim()).filter(Boolean);
  }

  let user;
  if (isMongoConnected()) {
    user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).lean();
  } else {
    user = await demoDb.users.update(req.user.id, updates);
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(sanitizeUser(user));
};
