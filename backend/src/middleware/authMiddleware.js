import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "super-secret-demo-key");
    const user = isMongoConnected()
      ? await User.findById(decoded.id).lean()
      : await demoDb.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      ...user,
      id: user.id || user._id?.toString()
    };
    next();
  } catch (_error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};
