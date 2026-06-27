import Internship from "../models/Internship.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

const sanitizeInternship = (internship) => ({
  id: internship.id || internship._id?.toString(),
  title: internship.title,
  company: internship.company,
  role: internship.role || internship.title,
  salary: internship.salary || internship.stipend,
  stipend: internship.stipend || internship.salary,
  skills: internship.skills || [],
  description: internship.description || "",
  applicantsCount: internship.applicantsCount || internship.applicants?.length || 0,
  createdAt: internship.createdAt
});

export const getInternships = async (_req, res) => {
  if (isMongoConnected()) {
    const internships = await Internship.find().sort({ createdAt: -1 }).lean();
    return res.json(internships.map(sanitizeInternship));
  }

  const internships = await demoDb.internships.findAll();
  res.json(internships.map(sanitizeInternship));
};

export const getInternshipById = async (req, res) => {
  if (isMongoConnected()) {
    const internship = await Internship.findById(req.params.id).lean();

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    return res.json(sanitizeInternship(internship));
  }

  const internship = await demoDb.internships.findById(req.params.id);

  if (!internship) {
    return res.status(404).json({ message: "Internship not found" });
  }

  res.json(sanitizeInternship(internship));
};

export const createInternship = async (req, res) => {
  if (req.user.role?.toLowerCase() !== "client") {
    return res.status(403).json({ message: "Only clients can create internships" });
  }

  const { title, company, salary, skills = [], description } = req.body;

  if (!title || !company || !salary || !description) {
    return res.status(400).json({ message: "Title, company, salary, and description are required" });
  }

  if (isMongoConnected()) {
    const internship = await Internship.create({
      title,
      role: title,
      company,
      salary,
      stipend: salary,
      skills,
      description,
      applicantsCount: 0,
      createdBy: req.user.id || req.user._id?.toString()
    });

    return res.status(201).json(sanitizeInternship(internship));
  }

  const internship = await demoDb.internships.insert({
    title,
    role: title,
    company,
    salary,
    stipend: salary,
    skills,
    description,
    applicantsCount: 0,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(sanitizeInternship(internship));
};
