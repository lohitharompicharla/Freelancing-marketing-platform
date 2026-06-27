import User from "../models/User.js";
import Project from "../models/Project.js";
import Application from "../models/Application.js";
import ProjectApplication from "../models/ProjectApplication.js";
import Course from "../models/Course.js";
import Internship from "../models/Internship.js";
import Certification from "../models/Certification.js";
import LearningPost from "../models/LearningPost.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = isMongoConnected()
      ? await User.find({}).select("-password")
      : await demoDb.users.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching users" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
    } else {
      const success = await demoDb.users.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting user" });
  }
};

// @desc    Get all projects
// @route   GET /api/admin/projects
// @access  Private/Admin
export const getAllProjects = async (req, res) => {
  try {
    const projects = isMongoConnected()
      ? await Project.find({}).sort({ createdAt: -1 })
      : await demoDb.projects.findAll();
    
    // Sort demo data too if needed, but array is fine
    res.json(isMongoConnected() ? projects : projects.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: "Server error fetching projects" });
  }
};

// @desc    Delete project
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
    } else {
      const success = await demoDb.projects.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting project" });
  }
};

// @desc    Get all project applications
// @route   GET /api/admin/applications
// @access  Private/Admin
export const getAllApplications = async (req, res) => {
  try {
    const applications = isMongoConnected()
      ? await ProjectApplication.find({}).sort({ createdAt: -1 })
      : await demoDb.projectApplications.findAll();
    res.json(isMongoConnected() ? applications : applications.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: "Server error fetching applications" });
  }
};

// @desc    Approve project application
// @route   PATCH /api/admin/applications/:id/approve
// @access  Private/Admin
export const approveApplication = async (req, res) => {
  try {
    let application;
    if (isMongoConnected()) {
      application = await ProjectApplication.findById(req.params.id);
      if (!application) return res.status(404).json({ message: "Application not found" });
      application.status = "Accepted";
      await application.save();
    } else {
      application = await demoDb.projectApplications.update(req.params.id, { status: "Accepted" });
      if (!application) return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error approving application" });
  }
};

// @desc    Reject project application
// @route   PATCH /api/admin/applications/:id/reject
// @access  Private/Admin
export const rejectApplication = async (req, res) => {
  try {
    let application;
    if (isMongoConnected()) {
      application = await ProjectApplication.findById(req.params.id);
      if (!application) return res.status(404).json({ message: "Application not found" });
      application.status = "Rejected";
      await application.save();
    } else {
      application = await demoDb.projectApplications.update(req.params.id, { status: "Rejected" });
      if (!application) return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Server error rejecting application" });
  }
};

// @desc    Resolve project conflict / mark as resolved
// @route   PATCH /api/admin/projects/:id/resolve
// @access  Private/Admin
export const resolveProject = async (req, res) => {
  try {
    let project;
    if (isMongoConnected()) {
      project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      project.status = "Completed";
      await project.save();
    } else {
      project = await demoDb.projects.update(req.params.id, { status: "Completed" });
      if (!project) return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error resolving project" });
  }
};

// @desc    Create course
// @route   POST /api/admin/courses
// @access  Private/Admin
export const createCourse = async (req, res) => {
  try {
    const { title, level, duration, price, description, modules, quiz } = req.body;
    let course;
    if (isMongoConnected()) {
      course = await Course.create({
        title, level, duration, price, description, modules, quiz, createdBy: req.user.id
      });
    } else {
      course = await demoDb.courses.insert({
        title, level, duration, price, description, modules, quiz, createdBy: req.user.id, createdAt: new Date().toISOString()
      });
    }
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error creating course", error: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res) => {
  try {
    let course;
    if (isMongoConnected()) {
      course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      course = await demoDb.courses.update(req.params.id, req.body);
    }
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Server error updating course", error: error.message });
  }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });
    } else {
      const success = await demoDb.courses.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting course" });
  }
};

// @desc    Create internship
// @route   POST /api/admin/internships
// @access  Private/Admin
export const createInternship = async (req, res) => {
  try {
    const { title, role, company, salary, stipend, skills, description } = req.body;
    let internship;
    if (isMongoConnected()) {
      internship = await Internship.create({
        title, role, company, salary, stipend, skills, description, createdBy: req.user.id
      });
    } else {
      internship = await demoDb.internships.insert({
        title, role, company, salary, stipend, skills, description, createdBy: req.user.id, applicantsCount: 0, createdAt: new Date().toISOString()
      });
    }
    res.status(201).json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error creating internship", error: error.message });
  }
};

// @desc    Update internship
// @route   PUT /api/admin/internships/:id
// @access  Private/Admin
export const updateInternship = async (req, res) => {
  try {
    let internship;
    if (isMongoConnected()) {
      internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      internship = await demoDb.internships.update(req.params.id, req.body);
    }
    if (!internship) return res.status(404).json({ message: "Internship not found" });
    res.json(internship);
  } catch (error) {
    res.status(500).json({ message: "Server error updating internship", error: error.message });
  }
};

// @desc    Delete internship
// @route   DELETE /api/admin/internships/:id
// @access  Private/Admin
export const deleteInternship = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const internship = await Internship.findByIdAndDelete(req.params.id);
      if (!internship) return res.status(404).json({ message: "Internship not found" });
    } else {
      const success = await demoDb.internships.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "Internship not found" });
    }
    res.json({ message: "Internship removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting internship" });
  }
};

// @desc    Get all certifications (Admin view)
// @route   GET /api/admin/certifications
// @access  Private/Admin
export const getAllCertifications = async (req, res) => {
  try {
    const certifications = isMongoConnected()
      ? await Certification.find({}).sort({ createdAt: -1 })
      : await demoDb.certifications.findAll();
    res.json(isMongoConnected() ? certifications : certifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: "Server error fetching certifications" });
  }
};

// @desc    Create certification
// @route   POST /api/admin/certifications
// @access  Private/Admin
export const createCertification = async (req, res) => {
  try {
    const { title, provider, skills, difficulty, duration, validity, domain, description, officialUrl, isVerified } = req.body;
    let certification;
    if (isMongoConnected()) {
      certification = await Certification.create({
        title, provider, skills, difficulty, duration, validity, domain, description, officialUrl, isVerified, createdBy: req.user.id
      });
    } else {
      certification = await demoDb.certifications.insert({
        title, provider, skills, difficulty, duration, validity, domain, description, officialUrl, isVerified, createdBy: req.user.id, createdAt: new Date().toISOString()
      });
    }
    res.status(201).json(certification);
  } catch (error) {
    res.status(500).json({ message: "Server error creating certification", error: error.message });
  }
};

// @desc    Update certification
// @route   PUT /api/admin/certifications/:id
// @access  Private/Admin
export const updateCertification = async (req, res) => {
  try {
    let certification;
    if (isMongoConnected()) {
      certification = await Certification.findByIdAndUpdate(req.params.id, req.body, { new: true });
    } else {
      certification = await demoDb.certifications.update(req.params.id, req.body);
    }
    if (!certification) return res.status(404).json({ message: "Certification not found" });
    res.json(certification);
  } catch (error) {
    res.status(500).json({ message: "Server error updating certification", error: error.message });
  }
};

// @desc    Delete certification
// @route   DELETE /api/admin/certifications/:id
// @access  Private/Admin
export const deleteCertification = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const certification = await Certification.findByIdAndDelete(req.params.id);
      if (!certification) return res.status(404).json({ message: "Certification not found" });
    } else {
      const success = await demoDb.certifications.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "Certification not found" });
    }
    res.json({ message: "Certification removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting certification" });
  }
};

// --- LEARNING POSTS ADMIN ---

// @desc    Get all learning posts (Admin view)
// @route   GET /api/admin/learning-posts
// @access  Private/Admin
export const getAllLearningPosts = async (req, res) => {
  try {
    const posts = isMongoConnected()
      ? await LearningPost.find({}).sort({ createdAt: -1 })
      : await demoDb.learningPosts.findAll();
    res.json(isMongoConnected() ? posts : posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: "Server error fetching learning posts" });
  }
};

// @desc    Create learning post
// @route   POST /api/admin/learning-posts
// @access  Private/Admin
export const createLearningPost = async (req, res) => {
  try {
    const { title, provider, domain, level, whatYouWillLearn, whatYouGet, description, duration, tags, officialUrl, isApproved } = req.body;
    
    // Convert arrays if they are strings (from form data if needed)
    const formatArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
      return [];
    };

    const payload = {
      title, provider, domain, level, 
      whatYouWillLearn: formatArray(whatYouWillLearn),
      whatYouGet: formatArray(whatYouGet),
      description, duration, 
      tags: formatArray(tags),
      officialUrl, isApproved, createdBy: req.user.id
    };

    let post;
    if (isMongoConnected()) {
      post = await LearningPost.create(payload);
    } else {
      post = await demoDb.learningPosts.insert({
        ...payload,
        createdAt: new Date().toISOString()
      });
    }
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error creating learning post", error: error.message });
  }
};

// @desc    Update learning post
// @route   PUT /api/admin/learning-posts/:id
// @access  Private/Admin
export const updateLearningPost = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    const formatArray = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
      return [];
    };

    if (updateData.whatYouWillLearn) updateData.whatYouWillLearn = formatArray(updateData.whatYouWillLearn);
    if (updateData.whatYouGet) updateData.whatYouGet = formatArray(updateData.whatYouGet);
    if (updateData.tags) updateData.tags = formatArray(updateData.tags);

    let post;
    if (isMongoConnected()) {
      post = await LearningPost.findByIdAndUpdate(req.params.id, updateData, { new: true });
    } else {
      post = await demoDb.learningPosts.update(req.params.id, updateData);
    }
    if (!post) return res.status(404).json({ message: "Learning post not found" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error updating learning post", error: error.message });
  }
};

// @desc    Delete learning post
// @route   DELETE /api/admin/learning-posts/:id
// @access  Private/Admin
export const deleteLearningPost = async (req, res) => {
  try {
    if (isMongoConnected()) {
      const post = await LearningPost.findByIdAndDelete(req.params.id);
      if (!post) return res.status(404).json({ message: "Learning post not found" });
    } else {
      const success = await demoDb.learningPosts.remove(req.params.id);
      if (!success) return res.status(404).json({ message: "Learning post not found" });
    }
    res.json({ message: "Learning post removed" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting learning post" });
  }
};

// @desc    Toggle learning post approval
// @route   PATCH /api/admin/learning-posts/:id/toggle-approval
// @access  Private/Admin
export const toggleLearningPostApproval = async (req, res) => {
  try {
    let post;
    if (isMongoConnected()) {
      post = await LearningPost.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Learning post not found" });
      post.isApproved = !post.isApproved;
      await post.save();
    } else {
      const existing = await demoDb.learningPosts.findById(req.params.id);
      if (!existing) return res.status(404).json({ message: "Learning post not found" });
      post = await demoDb.learningPosts.update(req.params.id, { isApproved: !existing.isApproved });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error toggling learning post approval", error: error.message });
  }
};
