import Project from "../models/Project.js";
import ProjectApplication from "../models/ProjectApplication.js";
import { demoDb } from "../services/demoStore.js";
import { getRecommendedProjects } from "../services/matchingService.js";
import { isMongoConnected } from "../config/db.js";

export const getClientDashboard = async (req, res) => {
  let projects = [];
  let applicants = [];

  if (isMongoConnected()) {
    projects = await Project.find({ clientId: req.user.id }).lean();
    const projectIds = projects.map((project) => project._id.toString());
    applicants = await ProjectApplication.find({ projectId: { $in: projectIds } }).lean();
  } else {
    projects = await demoDb.projects.filter((project) => project.clientId === req.user.id);
    const projectIds = projects.map((project) => project.id);
    applicants = await demoDb.projectApplications.filter((application) => projectIds.includes(application.projectId));
  }

  res.json({
    stats: {
      postedProjects: projects.length,
      activeProjects: projects.filter((project) => project.status === "In Progress").length,
      completedProjects: projects.filter((project) => project.status === "Completed" || project.status === "Paid").length
    },
    projects,
    applicants
  });
};

export const getFreelancerDashboard = async (req, res) => {
  let projects = [];
  let applications = [];

  if (isMongoConnected()) {
    projects = await Project.find().lean();
    applications = await ProjectApplication.find({ freelancerId: req.user.id }).lean();
  } else {
    projects = await demoDb.projects.findAll();
    applications = await demoDb.projectApplications.filter((application) => application.freelancerId === req.user.id);
  }

  res.json({
    stats: {
      earnings: req.user.earnings || 0,
      rating: req.user.rating || 0,
      completedProjects: req.user.completedProjects || 0
    },
    recommendedProjects: getRecommendedProjects(req.user, projects),
    applications
  });
};
