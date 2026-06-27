import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { getFreelancerBadges } from "../services/badgeService.js";
import { parseResumeFile } from "../services/resumeParserService.js";
import { buildProjectRecommendations } from "../services/recommendationService.js";

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "super-secret-demo-key", { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  id: user.id || user._id?.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills || [],
  experienceLevel: user.experienceLevel,
  completedProjects: user.completedProjects || 0,
  rating: user.rating || 0,
  earnings: user.earnings || 0,
  resumeUrl: user.resumeUrl || "",
  resumeData: user.resumeData || {},
  recommendedProjects: user.recommendedProjects || [],
  certificates: user.certificates || [],
  badges: getFreelancerBadges(user)
});

const parseResumePayload = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch (_error) {
    return fallback;
  }
};

const getProjectsForRecommendations = async () => {
  if (isMongoConnected()) {
    const { default: Project } = await import("../models/Project.js");
    return Project.find().lean();
  }

  return demoDb.projects.findAll();
};

export const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Resume file is required" });
  }

  try {
    const parsedResume = await parseResumeFile(req.file);
    res.json({
      resumeUrl: `/api/uploads/resumes/${req.file.filename}`,
      resumeOriginalName: req.file.originalname,
      parsedResume
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Failed to parse resume" });
  }
};

export const getRecommendedProjects = async (req, res) => {
  const userSkills = [...(req.user.skills || []), ...(req.user.resumeData?.skills || [])];
  const uniqueSkills = [...new Set(userSkills)];
  const projects = await getProjectsForRecommendations();
  const recommendations = buildProjectRecommendations(projects, uniqueSkills);
  console.log("[recommend-projects]", {
    userId: req.user.id,
    totalProjects: projects.length,
    recommendedCount: recommendations.length
  });

  if (isMongoConnected()) {
    await User.findByIdAndUpdate(req.user.id, { recommendedProjects: recommendations });
  } else {
    await demoDb.users.update(req.user.id, { recommendedProjects: recommendations });
  }

  res.json(recommendations);
};

export const register = async (req, res) => {
  const incomingSkills = parseResumePayload(req.body.skills, []);
  const parsedResumeFromBody = parseResumePayload(req.body.resumeData, null);
  const { name, email, password, role } = req.body;
  const normalizedRole = String(role || "").toLowerCase();

  if (!name || !email || !password || !normalizedRole) {
    return res.status(400).json({ message: "Name, email, password, and role are required" });
  }

  const existing = isMongoConnected()
    ? await User.findOne({ email: email.toLowerCase() }).lean()
    : await demoDb.users.findOne((user) => user.email === email.toLowerCase());

  if (existing) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let parsedResume = parsedResumeFromBody;
  let resumeUrl = req.body.resumeUrl || "";
  let resumeOriginalName = req.body.resumeOriginalName || "";

  if (req.file) {
    parsedResume = await parseResumeFile(req.file);
    resumeUrl = `/api/uploads/resumes/${req.file.filename}`;
    resumeOriginalName = req.file.originalname;
  }

  const mergedSkills = [...new Set([...(Array.isArray(incomingSkills) ? incomingSkills : []), ...(parsedResume?.skills || [])])];
  const projects = await getProjectsForRecommendations();
  const recommendedProjects = buildProjectRecommendations(projects, mergedSkills);
  const baseUser = {
    name: parsedResume?.name || name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: normalizedRole,
    skills: mergedSkills,
    experienceLevel: parsedResume?.experienceLevel || "Beginner",
    completedProjects: 0,
    rating: 0,
    earnings: 0,
    portfolio: [],
    resumeUrl,
    resumeOriginalName,
    resumeData: parsedResume || {
      skills: [],
      projects: [],
      education: [],
      experience: [],
      name: "",
      email: "",
      phone: "",
      experienceLevel: "Beginner"
    },
    recommendedProjects,
    certificates: [],
    createdAt: new Date().toISOString()
  };

  const user = isMongoConnected() ? await User.create(baseUser) : await demoDb.users.insert(baseUser);

  res.status(201).json({
    token: createToken(user.id || user._id?.toString()),
    user: sanitizeUser(user)
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = isMongoConnected()
    ? await User.findOne({ email: email.toLowerCase() })
    : await demoDb.users.findOne((candidate) => candidate.email === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    token: createToken(user.id || user._id?.toString()),
    user: sanitizeUser(user)
  });
};
