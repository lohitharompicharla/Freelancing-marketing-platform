import Application from "../models/Application.js";
import Internship from "../models/Internship.js";
import Project from "../models/Project.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { ensureProjectChat } from "../services/chatService.js";

const toId = (value) => value?.toString?.() || value || null;

const sanitizeApplication = (application) => ({
  id: application.id || application._id?.toString(),
  _id: application._id?.toString?.() || application.id || null,
  userId: toId(application.userId) || toId(application.freelancerId),
  freelancerId: toId(application.freelancerId) || toId(application.userId),
  jobId: toId(application.jobId) || toId(application.projectId),
  projectId: toId(application.projectId) || toId(application.jobId),
  internshipId: toId(application.internshipId),
  applicationType: application.applicationType || (application.jobId || application.projectId ? "job" : "internship"),
  coverLetter: application.coverLetter || "",
  status: application.status,
  createdAt: application.createdAt
});

const sanitizeJob = (job) => ({
  id: job.id || job._id?.toString(),
  _id: job._id?.toString?.() || job.id || null,
  title: job.title,
  description: job.description,
  category: job.category,
  requiredSkills: job.requiredSkills || [],
  skills: job.requiredSkills || [],
  status: job.status,
  clientId: toId(job.clientId),
  freelancerId: toId(job.freelancerId)
});

const getProjectById = async (jobId) => {
  if (isMongoConnected()) {
    const project = await Project.findById(jobId).lean();
    if (project) {
      return project;
    }
  }

  return demoDb.projects.findById(jobId);
};

export const submitApplication = async (req, res) => {
  const authUserId = req.user.id || req.user._id?.toString();
  const { userId = authUserId, jobId, internshipId, coverLetter = "" } = req.body;

  console.log("[apply] incoming request", {
    authUserId,
    userId,
    jobId,
    internshipId,
    role: req.user.role
  });

  if (String(userId) !== String(authUserId)) {
    return res.status(403).json({ message: "You can only apply as the logged-in user" });
  }

  if (jobId) {
    if (req.user.role !== "freelancer") {
      return res.status(403).json({ message: "Only freelancers can apply to projects" });
    }

    const job = await getProjectById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (String(toId(job.clientId)) === String(authUserId)) {
      return res.status(400).json({ message: "Clients cannot apply to their own project" });
    }

    if (job.status !== "Open" && job.status !== "In Progress") {
      return res.status(400).json({ message: "This project is no longer accepting applications" });
    }

    if (isMongoConnected()) {
      const existing = await Application.findOne({ userId: authUserId, jobId, applicationType: "job" }).lean();
      if (existing) {
        console.log("[apply] duplicate job application blocked", { userId: authUserId, jobId });
        return res.status(400).json({ message: "You have already applied to this project" });
      }

      const application = await Application.create({
        userId: authUserId,
        jobId,
        applicationType: "job",
        coverLetter: String(coverLetter).trim(),
        status: "applied"
      });

      console.log("[apply] job application saved", { applicationId: application._id?.toString(), userId: authUserId, jobId });
      return res.status(201).json({
        message: "Applied Successfully",
        application: sanitizeApplication(application),
        job: sanitizeJob(job)
      });
    }

    const existing = await demoDb.projectApplications.findOne(
      (application) => application.freelancerId === authUserId && application.projectId === jobId
    );

    if (existing) {
      console.log("[apply] duplicate demo job application blocked", { userId: authUserId, jobId });
      return res.status(400).json({ message: "You have already applied to this project" });
    }

    const application = await demoDb.projectApplications.insert({
      userId: authUserId,
      freelancerId: authUserId,
      projectId: jobId,
      jobId,
      applicationType: "job",
      coverLetter: String(coverLetter).trim(),
      status: "applied",
      createdAt: new Date().toISOString()
    });

    console.log("[apply] demo job application saved", { applicationId: application.id, userId: authUserId, jobId });
    return res.status(201).json({
      message: "Applied Successfully",
      application: sanitizeApplication(application),
      job: sanitizeJob(job)
    });
  }

  if (!internshipId) {
    return res.status(400).json({ message: "jobId or internshipId is required" });
  }

  if (isMongoConnected()) {
    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const existing = await Application.findOne({ userId: authUserId, internshipId, applicationType: "internship" });
    if (existing) {
      return res.status(400).json({ message: "You have already applied to this internship" });
    }

    const application = await Application.create({
      userId: authUserId,
      internshipId,
      applicationType: "internship",
      status: "Applied"
    });

    internship.applicantsCount += 1;
    await internship.save();

    return res.status(201).json({
      message: "Application submitted successfully",
      application: sanitizeApplication(application),
      applicantsCount: internship.applicantsCount
    });
  }

  const internship = await demoDb.internships.findById(internshipId);
  if (!internship) {
    return res.status(404).json({ message: "Internship not found" });
  }

  const existing = await demoDb.applications.findOne(
    (application) => application.userId === authUserId && application.internshipId === internshipId
  );

  if (existing) {
    return res.status(400).json({ message: "You have already applied to this internship" });
  }

  const application = await demoDb.applications.insert({
    userId: authUserId,
    internshipId,
    status: "Applied",
    createdAt: new Date().toISOString()
  });

  const applicantsCount = Number(internship.applicantsCount || 0) + 1;
  await demoDb.internships.update(internshipId, { applicantsCount });

  res.status(201).json({
    message: "Application submitted successfully",
    application: sanitizeApplication(application),
    applicantsCount
  });
};

export const getMyJobApplications = async (req, res) => {
  const userId = req.user.id || req.user._id?.toString();
  console.log("[my-applications] fetching", { userId, role: req.user.role });

  if (isMongoConnected()) {
    const applications = await Application.find({ userId, applicationType: "job" }).sort({ createdAt: -1 }).lean();
    const jobIds = applications.map((application) => application.jobId).filter(Boolean);
    const jobs = jobIds.length ? await Project.find({ _id: { $in: jobIds } }).lean() : [];
    const jobMap = new Map(jobs.map((job) => [job._id.toString(), sanitizeJob(job)]));

    return res.json(
      applications.map((application) => ({
        ...sanitizeApplication(application),
        job: jobMap.get(toId(application.jobId)) || null
      }))
    );
  }

  const applications = await demoDb.projectApplications.filter(
    (application) => application.freelancerId === userId || application.userId === userId
  );
  const jobs = await demoDb.projects.findAll();
  const jobMap = new Map(jobs.map((job) => [job.id, sanitizeJob(job)]));

  res.json(
    applications
      .map((application) => ({
        ...sanitizeApplication(application),
        job: jobMap.get(application.projectId || application.jobId) || null
      }))
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
  );
};

export const acceptApplication = async (req, res) => {
  const { applicationId, projectId, freelancerId } = req.body;

  if (!projectId && !applicationId) {
    return res.status(400).json({ message: "applicationId or projectId is required" });
  }

  let project = null;
  if (projectId) {
    project = await getProjectById(projectId);
  }

  let application = null;
  if (isMongoConnected()) {
    if (applicationId) {
      application = await Application.findById(applicationId).lean();
    } else if (projectId && freelancerId) {
      application = await Application.findOne({ jobId: projectId, userId: freelancerId, applicationType: "job" }).lean();
    }
  } else if (applicationId) {
    application = await demoDb.projectApplications.findById(applicationId);
  } else if (projectId && freelancerId) {
    application = await demoDb.projectApplications.findOne(
      (item) => item.projectId === projectId && (item.freelancerId === freelancerId || item.userId === freelancerId)
    );
  }

  const resolvedProjectId = projectId || application?.jobId || application?.projectId;
  const resolvedFreelancerId = freelancerId || application?.userId || application?.freelancerId;

  if (!resolvedProjectId || !resolvedFreelancerId) {
    return res.status(404).json({ message: "Application not found" });
  }

  if (!project) {
    project = await getProjectById(resolvedProjectId);
  }

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (String(toId(project.clientId)) !== String(req.user.id)) {
    return res.status(403).json({ message: "Only the project owner can accept an application" });
  }

  if (isMongoConnected()) {
    if (!application) {
      application = await Application.create({
        userId: resolvedFreelancerId,
        jobId: resolvedProjectId,
        applicationType: "job",
        status: "accepted"
      });
    }
    await Project.findByIdAndUpdate(resolvedProjectId, { freelancerId: resolvedFreelancerId, status: "In Progress" });
    const applications = await Application.find({ jobId: resolvedProjectId, applicationType: "job" }).lean();
    await Promise.all(
      applications.map((item) =>
        Application.findByIdAndUpdate(item._id, {
          status: String(toId(item.userId)) === String(resolvedFreelancerId) ? "accepted" : "rejected"
        })
      )
    );
    const updatedProject = await Project.findById(resolvedProjectId).lean();
    const chat = await ensureProjectChat(updatedProject);
    return res.json({
      message: "Application accepted and chat created",
      projectId: resolvedProjectId,
      freelancerId: resolvedFreelancerId,
      chat
    });
  }

  if (!application) {
    application = await demoDb.projectApplications.insert({
      userId: resolvedFreelancerId,
      freelancerId: resolvedFreelancerId,
      projectId: resolvedProjectId,
      jobId: resolvedProjectId,
      applicationType: "job",
      status: "accepted",
      createdAt: new Date().toISOString()
    });
  }
  await demoDb.projects.update(resolvedProjectId, { freelancerId: resolvedFreelancerId, status: "In Progress" });
  const applications = await demoDb.projectApplications.filter((item) => item.projectId === resolvedProjectId);
  await Promise.all(
    applications.map((item) =>
      demoDb.projectApplications.update(item.id, {
        status: String(item.freelancerId || item.userId) === String(resolvedFreelancerId) ? "accepted" : "rejected"
      })
    )
  );
  const updatedProject = await demoDb.projects.findById(resolvedProjectId);
  const chat = await ensureProjectChat(updatedProject);
  return res.json({
    message: "Application accepted and chat created",
    projectId: resolvedProjectId,
    freelancerId: resolvedFreelancerId,
    chat
  });
};

export const getApplicationsByUser = async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId && req.user._id?.toString() !== userId) {
    return res.status(403).json({ message: "You can only view your own applications" });
  }

  if (isMongoConnected()) {
    const applications = await Application.find({ userId, applicationType: "internship" }).sort({ createdAt: -1 }).lean();
    return res.json(applications.map(sanitizeApplication));
  }

  const applications = await demoDb.applications.filter((application) => application.userId === userId);
  res.json(applications.map(sanitizeApplication));
};
