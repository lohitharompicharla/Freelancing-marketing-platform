import Application from "../models/Application.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { ensureProjectChat } from "../services/chatService.js";
import { calculateFreelancerMatch, getRecommendedFreelancers, getRecommendedProjects } from "../services/matchingService.js";
import { suggestBudget, suggestSkills } from "../services/suggestionService.js";
import { httpError } from "../utils/httpError.js";
import { getProjectBudgetAmount } from "../utils/projectFinance.js";

const toId = (value) => value?.toString?.() || value || "";

const sanitizeProject = (project) => ({
  id: project.id || project._id?.toString(),
  title: project.title,
  description: project.description,
  category: project.category,
  requiredSkills: project.requiredSkills || [],
  budgetRange: project.budgetRange || "",
  deadline: project.deadline || "",
  experienceLevel: project.experienceLevel || "Beginner",
  clientId: toId(project.clientId),
  freelancerId: toId(project.freelancerId),
  status: project.status || "Open",
  fileName: project.fileName || "",
  paymentStatus: project.paymentStatus || "unpaid",
  paymentAmount: project.paymentAmount || getProjectBudgetAmount(project),
  completedAt: project.completedAt || "",
  paidAt: project.paidAt || "",
  createdAt: project.createdAt,
  updatedAt: project.updatedAt
});

const sanitizeProjectApplication = (application) => ({
  id: application.id || application._id?.toString(),
  projectId: toId(application.projectId || application.jobId),
  jobId: toId(application.jobId || application.projectId),
  freelancerId: toId(application.freelancerId || application.userId),
  userId: toId(application.userId || application.freelancerId),
  coverLetter: application.coverLetter || "",
  status: application.status || "Pending",
  applicationType: application.applicationType || "job",
  createdAt: application.createdAt,
  updatedAt: application.updatedAt
});

const getProjectById = async (projectId) => {
  if (isMongoConnected()) {
    const project = await Project.findById(projectId).lean();
    if (project) {
      return { project, source: "mongo" };
    }
  }

  const project = await demoDb.projects.findById(projectId);
  return { project, source: project ? "demo" : null };
};

const updateProjectRecord = async (projectId, updates, sourceHint) => {
  if (sourceHint === "mongo" && isMongoConnected()) {
    const project = await Project.findByIdAndUpdate(projectId, updates, { new: true }).lean();
    if (project) {
      return project;
    }
  }

  return demoDb.projects.update(projectId, updates);
};

const getAllProjectApplications = async (projectId) => {
  if (isMongoConnected()) {
    const query = { applicationType: "job" };
    if (projectId) {
      query.jobId = projectId;
    }

    const applications = await Application.find(query).sort({ createdAt: -1 }).lean();
    return applications.map(sanitizeProjectApplication);
  }

  const applications = projectId
    ? await demoDb.projectApplications.filter((application) => application.projectId === projectId)
    : await demoDb.projectApplications.findAll();
  return applications.map(sanitizeProjectApplication);
};

const getFreelancerMap = async (freelancerIds) => {
  if (!freelancerIds.length) {
    return new Map();
  }

  const freelancers = isMongoConnected()
    ? await User.find({ _id: { $in: freelancerIds } }).lean().catch(async () => User.find().lean())
    : await demoDb.users.filter((user) => freelancerIds.includes(user.id));

  return new Map(
    freelancers.map((user) => {
      const id = user.id || user._id?.toString();
      return [
        id,
        {
          id,
          name: user.name,
          role: user.role,
          skills: user.skills || [],
          rating: user.rating || 0,
          completedProjects: user.completedProjects || 0,
          experienceLevel: user.experienceLevel || "Beginner"
        }
      ];
    })
  );
};

export const getProjects = async (_req, res) => {
  const projects = isMongoConnected() ? await Project.find().sort({ createdAt: -1 }).lean() : await demoDb.projects.findAll();
  res.json(projects.map(sanitizeProject));
};

export const getClientProjects = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  let projects = isMongoConnected() ? await Project.find({ clientId: id }).sort({ createdAt: -1 }).lean() : await demoDb.projects.filter(p => toId(p.clientId) === id);
  if (status) {
    projects = projects.filter(p => String(p.status).toLowerCase() === String(status).toLowerCase());
  }

  const freelancerIds = projects.map(p => p.freelancerId).filter(Boolean);
  const freelancerMap = await getFreelancerMap(freelancerIds);

  res.json(projects.map(p => {
    const sanitized = sanitizeProject(p);
    return {
      ...sanitized,
      freelancer: p.freelancerId ? freelancerMap.get(p.freelancerId) : null
    };
  }));
};

export const getFreelancerProjects = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  let projects = isMongoConnected() ? await Project.find({ freelancerId: id }).sort({ createdAt: -1 }).lean() : await demoDb.projects.filter(p => toId(p.freelancerId) === id);
  if (status) {
    projects = projects.filter(p => String(p.status).toLowerCase() === String(status).toLowerCase());
  }

  const clientIds = projects.map(p => p.clientId).filter(Boolean);
  const clientMap = await getFreelancerMap(clientIds); // Re-use getFreelancerMap to get user details

  res.json(projects.map(p => {
    const sanitized = sanitizeProject(p);
    return {
      ...sanitized,
      client: p.clientId ? clientMap.get(p.clientId) : null
    };
  }));
};

export const getProjectSuggestions = async (req, res) => {
  const { description, category } = req.body;
  res.json({
    skills: suggestSkills(description),
    budgetRange: suggestBudget(category)
  });
};

export const createProject = async (req, res, next) => {
  try {
    if (req.user.role !== "client") {
      throw httpError("Only clients can publish projects", 403);
    }

    const { title, description, category, requiredSkills, budgetRange, deadline, experienceLevel } = req.body;

    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!description) missingFields.push("description");
    if (!category) missingFields.push("category");
    if (!budgetRange) missingFields.push("budgetRange");
    if (!deadline) missingFields.push("deadline");

    if (missingFields.length > 0) {
      throw httpError(`Please provide all required project fields. Missing: ${missingFields.join(", ")}`);
    }

    const payload = {
      title,
      description,
      category,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
      budgetRange,
      paymentAmount: getProjectBudgetAmount({ budgetRange }),
      paymentStatus: "unpaid",
      deadline,
      experienceLevel,
      fileName: req.body.fileName || "",
      clientId: req.user.id,
      status: "Open",
      createdAt: new Date().toISOString()
    };

    const project = isMongoConnected() ? await Project.create(payload) : await demoDb.projects.insert(payload);
    res.status(201).json(sanitizeProject(project));
  } catch (error) {
    next(error);
  }
};

export const applyToProject = async (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Only freelancers can apply to projects" });
  }

  const { projectId } = req.params;
  const { coverLetter = "" } = req.body;
  const { project } = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (toId(project.clientId) === req.user.id) {
    return res.status(400).json({ message: "Clients cannot apply to their own project" });
  }

  if (project.status !== "Open" && project.status !== "In Progress") {
    return res.status(400).json({ message: "This project is no longer accepting applications" });
  }

  let application;

  if (isMongoConnected()) {
    const existing = await Application.findOne({
      userId: req.user.id,
      jobId: projectId,
      applicationType: "job"
    }).lean();

    if (existing) {
      return res.status(400).json({ message: "Already applied to this project" });
    }

    application = await Application.create({
      userId: req.user.id,
      jobId: projectId,
      applicationType: "job",
      coverLetter: String(coverLetter).trim(),
      status: "Pending"
    });
  } else {
    const existing = await demoDb.projectApplications.findOne(
      (item) => item.projectId === projectId && item.freelancerId === req.user.id
    );

    if (existing) {
      return res.status(400).json({ message: "Already applied to this project" });
    }

    application = await demoDb.projectApplications.insert({
      projectId,
      freelancerId: req.user.id,
      coverLetter: String(coverLetter).trim(),
      status: "Pending",
      createdAt: new Date().toISOString()
    });
  }

  res.status(201).json(sanitizeProjectApplication(application));
};

export const getProjectApplicants = async (req, res) => {
  const { projectId } = req.params;
  const { project } = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (toId(project.clientId) !== req.user.id) {
    return res.status(403).json({ message: "Only the project owner can view applicants" });
  }

  const applications = await getAllProjectApplications(projectId);
  const freelancerIds = applications.map((application) => application.freelancerId);
  const freelancerMap = await getFreelancerMap(freelancerIds);

  res.json(
    applications.map((application) => {
      const freelancer = freelancerMap.get(application.freelancerId) || null;
      const match = freelancer ? calculateFreelancerMatch(project, freelancer) : { matchPercentage: 0, matchedSkills: [] };

      return {
        ...application,
        freelancer,
        matchPercentage: match.matchPercentage,
        matchedSkills: match.matchedSkills
      };
    })
  );
};

export const getMyProjectApplications = async (req, res) => {
  let applications = [];
  let ownedProjects = [];

  if (isMongoConnected()) {
    if (req.user.role === "client") {
      ownedProjects = await Project.find({ clientId: req.user.id }).lean();
      const projectIds = ownedProjects.map((project) => project._id.toString());
      applications = projectIds.length
        ? await Application.find({ jobId: { $in: projectIds }, applicationType: "job" }).sort({ createdAt: -1 }).lean()
        : [];
    } else {
      applications = await Application.find({ userId: req.user.id, applicationType: "job" }).sort({ createdAt: -1 }).lean();
    }
  } else if (req.user.role === "client") {
    ownedProjects = await demoDb.projects.filter((project) => project.clientId === req.user.id);
    const projectIds = ownedProjects.map((project) => project.id);
    applications = await demoDb.projectApplications.filter((application) => projectIds.includes(application.projectId));
  } else {
    applications = await demoDb.projectApplications.filter((application) => application.freelancerId === req.user.id);
  }

  const sanitizedApplications = applications.map(sanitizeProjectApplication);

  if (req.user.role !== "client") {
    return res.json(sanitizedApplications);
  }

  const ownedProjectMap = new Map(
    ownedProjects.map((project) => {
      const projectId = project.id || project._id?.toString();
      return [projectId, sanitizeProject({ ...project, id: projectId })];
    })
  );
  const freelancerIds = sanitizedApplications.map((application) => application.freelancerId);
  const freelancerMap = await getFreelancerMap(freelancerIds);

  return res.json(
    sanitizedApplications.map((application) => {
      const project = ownedProjectMap.get(application.projectId) || null;
      const freelancer = freelancerMap.get(application.freelancerId) || null;
      const match = project && freelancer
        ? calculateFreelancerMatch(project, freelancer)
        : { matchPercentage: 0, matchedSkills: [], missingSkills: [] };

      return {
        ...application,
        project,
        freelancer,
        matchPercentage: match.matchPercentage,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      };
    })
  );
};

export const updateProjectStatus = async (req, res) => {
  const { projectId } = req.params;
  const { project, source } = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const isParticipant = [toId(project.clientId), toId(project.freelancerId)].includes(req.user.id);
  if (!isParticipant) {
    return res.status(403).json({ message: "You are not allowed to update this project" });
  }

  const updates = { status: req.body.status };
  let justCompleted = false;

  if (req.body.status === "Completed") {
    updates.completedAt = new Date().toISOString();
    updates.paymentStatus = project.paymentStatus || "unpaid";
    if (project.status !== "Completed") {
      justCompleted = true;
    }
  }

  const updated = await updateProjectRecord(projectId, updates, source);

  if (justCompleted) {
    const userIdsToUpdate = [toId(project.clientId), toId(project.freelancerId)].filter(Boolean);
    if (userIdsToUpdate.length) {
      if (isMongoConnected()) {
        await User.updateMany(
          { _id: { $in: userIdsToUpdate } },
          { $inc: { completedProjects: 1 } }
        );
      } else {
        for (const uid of userIdsToUpdate) {
          const u = await demoDb.users.findById(uid);
          if (u) {
            await demoDb.users.update(uid, { completedProjects: (u.completedProjects || 0) + 1 });
          }
        }
      }
    }
  }

  res.json(sanitizeProject(updated));
};

export const hireFreelancer = async (req, res) => {
  const { projectId } = req.params;
  const { freelancerId } = req.body;
  const { project, source } = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (toId(project.clientId) !== req.user.id) {
    return res.status(403).json({ message: "Only the project owner can hire a freelancer" });
  }

  const updatedProject = await updateProjectRecord(
    projectId,
    {
      freelancerId,
      status: "In Progress"
    },
    source
  );

  if (isMongoConnected()) {
    const applications = await Application.find({ jobId: projectId, applicationType: "job" }).lean();
    await Promise.all(
      applications.map((application) =>
        Application.findByIdAndUpdate(application._id, {
          status: toId(application.userId) === freelancerId ? "Accepted" : "Rejected"
        })
      )
    );
  } else {
    const applications = await demoDb.projectApplications.filter((application) => application.projectId === projectId);
    await Promise.all(
      applications.map((application) =>
        demoDb.projectApplications.update(application.id, {
          status: application.freelancerId === freelancerId ? "Accepted" : "Rejected"
        })
      )
    );
  }

  const chat = await ensureProjectChat(updatedProject);
  res.json({ ...sanitizeProject(updatedProject), chat });
};

export const getRecommendedFreelancersForProject = async (req, res) => {
  const { project } = await getProjectById(req.params.projectId);
  const freelancers = isMongoConnected()
    ? await User.find({ role: "freelancer" }).lean()
    : await demoDb.users.filter((user) => user.role === "freelancer");

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(getRecommendedFreelancers(project, freelancers));
};

export const getRecommendedProjectsForFreelancer = async (req, res) => {
  const freelancer = isMongoConnected()
    ? await User.findById(req.params.freelancerId).lean()
    : await demoDb.users.findById(req.params.freelancerId);
  const projects = isMongoConnected() ? await Project.find().lean() : await demoDb.projects.findAll();

  if (!freelancer) {
    return res.status(404).json({ message: "Freelancer not found" });
  }

  res.json(
    getRecommendedProjects(freelancer, projects).map((project) => ({
      ...sanitizeProject(project),
      matchPercentage: project.matchPercentage,
      matchedSkills: project.matchedSkills || [],
      missingSkills: project.missingSkills || []
    }))
  );
};
