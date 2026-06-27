import { createContext, useContext, useEffect, useState } from "react";
import {
  demoApplications,
  demoCertificates,
  demoCourses,
  demoInternships,
  demoLearningProgress,
  demoMessages,
  demoPayments,
  demoProjectApplications,
  demoProjects,
  demoQuizAttempts,
  demoReviews,
  demoUsers
} from "../data/mockData";
import { api } from "../services/api";

const AppContext = createContext(null);

const STORAGE_KEYS = {
  demoMode: "freelanceflow-demo-mode",
  auth: "freelanceflow-auth",
  applications: "freelanceflow-demo-applications",
  projectApplications: "freelanceflow-demo-project-applications",
  messages: "freelanceflow-demo-messages",
  payments: "freelanceflow-demo-payments",
  progress: "freelanceflow-demo-progress",
  certificates: "freelanceflow-demo-certificates",
  resumePreview: "freelanceflow-demo-resume-preview",
  quizAttempts: "freelanceflow-demo-quiz-attempts"
};

const getEligibilityBadge = (user) => ((user.completedProjects || 0) >= 2 ? "Internship Eligible" : null);
const enrichUser = (user) => ({ ...user, badges: [getEligibilityBadge(user)].filter(Boolean) });
const readStorage = (key, fallback) => JSON.parse(localStorage.getItem(key) || "null") || fallback;
const getInitialDemoApplications = () => readStorage(STORAGE_KEYS.applications, demoApplications);
const getInitialProjectApplications = () => readStorage(STORAGE_KEYS.projectApplications, demoProjectApplications);
const getInitialProgress = () => readStorage(STORAGE_KEYS.progress, demoLearningProgress);
const getInitialPayments = () => readStorage(STORAGE_KEYS.payments, demoPayments);
const getInitialQuizAttempts = () => readStorage(STORAGE_KEYS.quizAttempts, demoQuizAttempts);
const getInitialResumePreview = () => readStorage(STORAGE_KEYS.resumePreview, null);
const getInitialMessages = () =>
  readStorage(STORAGE_KEYS.messages, demoMessages).sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

const buildMockCertificateDownload = (certificate, userName) =>
  `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html lang="en"><head><meta charset="UTF-8" /><title>${certificate.title}</title><style>body { font-family: Georgia, serif; background: #0f172a; color: #f8fafc; display: grid; place-items: center; min-height: 100vh; margin: 0; } article { background: linear-gradient(145deg, #fef3c7, #fde68a); color: #1f2937; border-radius: 24px; padding: 48px; width: min(840px, calc(100vw - 32px)); } .eyebrow { text-transform: uppercase; letter-spacing: 0.3em; font-size: 12px; color: #92400e; }</style></head><body><article><div class="eyebrow">FreelanceFlow Certificate</div><h1>${certificate.title}</h1><p>Issued to ${userName}</p><p>Date: ${new Date(certificate.issuedAt).toLocaleDateString("en-IN")}</p><p>Certificate No: ${certificate.certificateNumber || "DEMO-CERTIFICATE"}</p></article></body></html>`)}`;

const hydrateDemoCertificates = (certificates = [], users = demoUsers) =>
  certificates.map((certificate) => ({
    ...certificate,
    downloadUrl:
      certificate.downloadUrl ||
      buildMockCertificateDownload(
        certificate,
        users.find((user) => user.id === certificate.userId)?.name || "Learner"
      )
  }));

const getInitialCertificates = () =>
  hydrateDemoCertificates(readStorage(STORAGE_KEYS.certificates, demoCertificates));

const buildDemoRecommendations = (skills = []) =>
  demoProjects
    .map((project) => {
      const matchedSkills = project.requiredSkills.filter((skill) => skills.includes(skill));
      const matchScore = project.requiredSkills.length
        ? Math.round((matchedSkills.length / project.requiredSkills.length) * 100)
        : 0;
      return {
        id: project.id,
        title: project.title,
        category: project.category,
        description: project.description,
        matchScore,
        matchPercentage: matchScore,
        matchedSkills,
        categoryMatches: matchedSkills,
        recommendationReason: matchedSkills.length
          ? `Matched on ${matchedSkills.join(", ")}`
          : `Suggested from your ${project.category} profile`
      };
    })
    .filter((project) => project.matchScore > 0)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 6);

const buildDemoChats = (projects = demoProjects, messages = getInitialMessages()) =>
  projects
    .filter((project) => project.freelancerId)
    .map((project) => {
      const projectMessages = messages.filter((message) => message.projectId === project.id);
      return {
        id: `chat-${project.id}`,
        projectId: project.id,
        clientId: project.clientId,
        freelancerId: project.freelancerId,
        participantIds: [project.clientId, project.freelancerId],
        lastMessageAt: projectMessages[projectMessages.length - 1]?.createdAt || project.createdAt || new Date().toISOString()
      };
    })
    .sort((left, right) => new Date(right.lastMessageAt).getTime() - new Date(left.lastMessageAt).getTime());

const normalizeProgressMap = (userId, progressEntries = []) => ({
  [userId]: Object.fromEntries(
    progressEntries.map((item) => [
      item.courseId,
      {
        completedLessons: item.completedLessons || [],
        progress: item.progress || 0,
        completed: item.completed || false
      }
    ])
  )
});

export function AppProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);
  const [token, setToken] = useState(() => readStorage(STORAGE_KEYS.auth, null)?.token || "");
  const [currentUser, setCurrentUser] = useState(() => readStorage(STORAGE_KEYS.auth, null)?.user || null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projectApplications, setProjectApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [learningProgress, setLearningProgress] = useState({});
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [recommendedCertifications, setRecommendedCertifications] = useState([]);
  const [learningPosts, setLearningPosts] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [resumePreview, setResumePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const persistAuth = (nextToken, user) => {
    setToken(nextToken);
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({ token: nextToken, user }));
  };

  const syncCurrentUser = (updater) => {
    setCurrentUser((current) => {
      if (!current) {
        return current;
      }
      const nextUser = typeof updater === "function" ? updater(current) : { ...current, ...updater };
      const storedAuth = readStorage(STORAGE_KEYS.auth, null);
      localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify({ token: storedAuth?.token || token, user: nextUser }));
      return nextUser;
    });
  };

  const clearAuth = () => {
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.auth);
  };

  const resetEphemeralState = () => {
    setRecommendedProjects([]);
    setResumePreview(null);
    localStorage.removeItem(STORAGE_KEYS.resumePreview);
  };

  const loadPersonalizedRemoteData = async (userId = currentUser?.id, authToken = token) => {
    if (!userId || !authToken) {
      return;
    }

    const projectApplicationRequest =
      currentUser?.role === "client" ? api.getMyProjectApplications(authToken) :
      (currentUser?.role === "freelancer" ? api.getMyApplications(authToken) : Promise.resolve([]));

    const [nextApplications, nextProjectApplications, nextProgress, nextQuizAttempts, nextCertificates, nextRecommendedProjects, nextChats, nextMessages, nextPayments] = await Promise.all([
      api.getApplications(userId, authToken),
      projectApplicationRequest,
      api.getCourseProgress(userId, authToken),
      api.getQuizAttempts(userId, authToken),
      api.getCertificates(userId, authToken),
      api.getRecommendedProjects(authToken),
      api.getChats(authToken),
      api.getMessages(authToken),
      api.getPayments(authToken)
    ]);

    setApplications(nextApplications);
    setProjectApplications(nextProjectApplications);
    setLearningProgress(normalizeProgressMap(userId, nextProgress));
    setQuizAttempts(nextQuizAttempts);
    setCertificates(nextCertificates);
    setRecommendedProjects(nextRecommendedProjects);
    setChats(nextChats);
    setMessages(nextMessages);
    setPayments(nextPayments);
    syncCurrentUser((existingUser) => (existingUser?.id === userId ? { ...existingUser, certificates: nextCertificates } : existingUser));
  };

  const loadRemoteData = async () => {
    const [nextUsers, nextProjects, nextCourses, nextInternships, nextReviews, nextCertifications, nextRecommendedCertifications] = await Promise.all([
      api.getUsers(),
      api.getProjects(),
      api.getCourses(),
      api.getInternships(),
      api.getAllReviews(),
      api.getCertifications(),
      api.getRecommendedCertifications("?level=Beginner")
    ]);
    setUsers(nextUsers.map(enrichUser));
    setProjects(nextProjects);
    setCourses(nextCourses);
    setInternships(nextInternships);
    setReviews(nextReviews);
    setCertifications(nextCertifications);
    setRecommendedCertifications(nextRecommendedCertifications);
  };

  const loadData = async () => {
    setLoading(true);
    setError("");

    setMessages([]);
    setChats([]);
    setPayments([]);

    try {
      await loadRemoteData();
    } catch (nextError) {
      setError(nextError.message || "Failed to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.demoMode, JSON.stringify(demoMode));
    loadData();
  }, [demoMode]);

  useEffect(() => {
    if (demoMode || !token || !currentUser?.id) {
      return;
    }
    loadPersonalizedRemoteData(currentUser.id, token).catch((nextError) => {
      setError(nextError.message || "Failed to load personalized data");
      if (nextError.message === "User not found" || nextError.message === "Invalid token" || nextError.message === "Authentication required") {
        logout();
      }
    });

    const pollInterval = window.setInterval(async () => {
      try {
        const [nextChats, nextMessages] = await Promise.all([
          api.getChats(token),
          api.getMessages(token)
        ]);
        setChats((current) => JSON.stringify(current) === JSON.stringify(nextChats) ? current : nextChats);
        setMessages((current) => JSON.stringify(current) === JSON.stringify(nextMessages) ? current : nextMessages);
      } catch (e) {
        // Silently ignore polling errors
      }
    }, 5000);

    return () => window.clearInterval(pollInterval);
  }, [demoMode, token, currentUser?.id]);

  const login = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.login(payload);
      const user = enrichUser(response.user);
      persistAuth(response.token, user);
      setRecommendedProjects(user.recommendedProjects || []);
      setCertificates(Array.isArray(user.certificates) ? user.certificates : []);
      await loadPersonalizedRemoteData(user.id, response.token);
      notify(`Welcome back, ${user.name}`);
      return user;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const register = async (payload) => {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.register(payload);
      const user = enrichUser(response.user);
      persistAuth(response.token, user);
      setRecommendedProjects(user.recommendedProjects || []);
      setCertificates([]);
      resetEphemeralState();
      notify("Account created successfully");
      await Promise.all([loadRemoteData(), loadPersonalizedRemoteData(user.id, response.token)]);
      return user;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const uploadResume = async (file) => {
    if (!file) {
      throw new Error("Please choose a resume file");
    }
    setSubmitting(true);
    setError("");
    try {
      if (demoMode) {
        const preview = {
          resumeUrl: file.name,
          resumeOriginalName: file.name,
          parsedResume: {
            name: file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
            skills: ["React", "Node.js", "MongoDB"],
            projects: ["Portfolio website", "API dashboard"],
            education: ["B.Tech in Computer Science"],
            experience: ["Frontend Developer Intern"]
          }
        };
        setResumePreview(preview);
        localStorage.setItem(STORAGE_KEYS.resumePreview, JSON.stringify(preview));
        notify("Mock resume parsed successfully");
        return preview;
      }

      const formData = new FormData();
      formData.append("resume", file);
      const response = await api.uploadResume(formData);
      setResumePreview(response);
      localStorage.setItem(STORAGE_KEYS.resumePreview, JSON.stringify(response));
      notify("Resume parsed successfully");
      return response;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const logout = () => {
    clearAuth();
    resetEphemeralState();
    setProjectApplications(demoMode ? getInitialProjectApplications() : []);
    setMessages(demoMode ? getInitialMessages() : []);
    setChats(demoMode ? buildDemoChats(demoProjects, getInitialMessages()) : []);
    setPayments(demoMode ? getInitialPayments() : []);
    setQuizAttempts(demoMode ? getInitialQuizAttempts() : []);
    notify("Signed out");
  };

  const toggleDemoMode = () => {
    clearAuth();
    resetEphemeralState();
    setProjectApplications([]);
    setMessages([]);
    setChats([]);
    setPayments([]);
    setQuizAttempts([]);
    setDemoMode((current) => !current);
  };

  const getInternshipDetails = async (internshipId) => (demoMode ? internships.find((item) => item.id === internshipId) : api.getInternship(internshipId));

  const applyToInternship = async (internshipId) => {
    if (!currentUser) {
      throw new Error("Please login to apply");
    }
    setSubmitting(true);
    setError("");
    try {
      if (demoMode) {
        const alreadyApplied = applications.some((application) => application.userId === currentUser.id && application.internshipId === internshipId);
        if (alreadyApplied) {
          throw new Error("You have already applied to this internship");
        }
        const nextApplication = { id: `demo-application-${Date.now()}`, userId: currentUser.id, internshipId, status: "Applied", createdAt: new Date().toISOString() };
        const nextApplications = [nextApplication, ...applications];
        const nextInternships = internships.map((item) => (item.id === internshipId ? { ...item, applicantsCount: (item.applicantsCount || 0) + 1 } : item));
        setApplications(nextApplications);
        setInternships(nextInternships);
        localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(nextApplications));
        notify("Application submitted successfully");
        return nextApplication;
      }

      const response = await api.applyToInternship(internshipId, token);
      setApplications((current) => [response.application, ...current]);
      setInternships((current) => current.map((item) => (item.id === internshipId ? { ...item, applicantsCount: response.applicantsCount } : item)));
      notify(response.message || "Application submitted successfully");
      return response.application;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCourseProgress = async (courseId, completedLessons) => {
    if (!currentUser) {
      throw new Error("Please login to track course progress");
    }
    setSubmitting(true);
    setError("");
    try {
      let progressEntry;
      if (demoMode) {
        const course = courses.find((item) => item.id === courseId);
        const validLessons = completedLessons.filter((lesson) => course?.lessons.includes(lesson));
        const progress = course?.lessons?.length ? Math.round((validLessons.length / course.lessons.length) * 100) : 0;
        progressEntry = { courseId, completedLessons: validLessons, progress, completed: Boolean(course?.lessons?.length) && validLessons.length === course.lessons.length };
      } else {
        progressEntry = await api.updateCourseProgress(courseId, { completedLessons }, token);
      }

      const nextProgress = {
        ...learningProgress,
        [currentUser.id]: {
          ...(learningProgress[currentUser.id] || {}),
          [courseId]: progressEntry
        }
      };
      setLearningProgress(nextProgress);
      if (demoMode) {
        localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(nextProgress));
      }
      return progressEntry;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const attemptQuiz = async (courseId, answers) => {
    if (!currentUser) {
      throw new Error("Please login to attempt a quiz");
    }
    setSubmitting(true);
    setError("");
    try {
      let attempt;
      if (demoMode) {
        const answerKey = { "course-1": ["header"], "course-2": ["let"] };
        const expectedAnswers = answerKey[courseId] || [];
        const score = expectedAnswers.reduce((total, expected, index) => total + (String(answers[index] || "").trim() === expected ? 1 : 0), 0);
        const totalQuestions = Math.max(expectedAnswers.length, 1);
        const percentage = Math.round((score / totalQuestions) * 100);
        attempt = {
          id: `quiz-attempt-${Date.now()}`,
          userId: currentUser.id,
          courseId,
          answers,
          score,
          totalQuestions,
          percentage,
          passed: percentage >= 60,
          attemptedAt: new Date().toISOString()
        };
        const nextAttempts = [attempt, ...quizAttempts];
        setQuizAttempts(nextAttempts);
        localStorage.setItem(STORAGE_KEYS.quizAttempts, JSON.stringify(nextAttempts));
      } else {
        attempt = await api.submitQuizAttempt(courseId, { answers }, token);
        setQuizAttempts((current) => [attempt, ...current]);
      }
      notify(`Quiz submitted: ${attempt.percentage}%`);
      return attempt;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const completeCourse = async (courseId) => {
    if (!currentUser) {
      throw new Error("Please login to complete a course");
    }
    setSubmitting(true);
    setError("");
    try {
      const progressEntry = learningProgress[currentUser.id]?.[courseId];
      if (!progressEntry?.completed) {
        throw new Error("Complete all lessons before generating a certificate");
      }

      if (demoMode) {
        const existingCertificate = certificates.find((certificate) => certificate.userId === currentUser.id && certificate.courseId === courseId);
        if (existingCertificate) {
          return existingCertificate;
        }
        const nextCertificate = {
          id: `certificate-${Date.now()}`,
          userId: currentUser.id,
          courseId,
          title: `${courses.find((course) => course.id === courseId)?.title || "Course"} Certificate`,
          issuedAt: new Date().toISOString(),
          certificateNumber: `DEMO-${Date.now().toString().slice(-6)}`,
          downloadUrl: ""
        };
        nextCertificate.downloadUrl = buildMockCertificateDownload(nextCertificate, currentUser.name);
        setCertificates((current) => {
          const nextCertificates = [nextCertificate, ...current];
          localStorage.setItem(STORAGE_KEYS.certificates, JSON.stringify(nextCertificates));
          return nextCertificates;
        });
        syncCurrentUser((user) => ({ ...user, certificates: [nextCertificate, ...(user.certificates || [])] }));
        notify("Certificate generated");
        return nextCertificate;
      }

      const certificate = await api.completeCourse(courseId, token);
      setCertificates((current) => {
        const filtered = current.filter((item) => !(item.userId === certificate.userId && item.courseId === certificate.courseId));
        return [certificate, ...filtered];
      });
      syncCurrentUser((user) => ({ ...user, certificates: [certificate, ...(user.certificates || []).filter((item) => item.id !== certificate.id)] }));
      notify("Certificate generated");
      return certificate;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const createProject = async (payload) => {
    if (!currentUser) {
      throw new Error("Please login to publish a project");
    }
    if (currentUser.role !== "client") {
      throw new Error("Only clients can publish projects");
    }
    setSubmitting(true);
    setError("");
    try {
      const project = demoMode
        ? { id: `project-${Date.now()}`, ...payload, clientId: currentUser.id, status: "Open", createdAt: new Date().toISOString() }
        : await api.createProject(payload, token);
      setProjects((current) => [project, ...current]);
      notify("Project published successfully");
      return project;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const applyToProject = async (projectId, coverLetter = "") => {
    if (!currentUser) {
      throw new Error("Please login to apply to a project");
    }
    setSubmitting(true);
    setError("");
    try {
      const application = (await api.apply({ userId: currentUser.id, jobId: projectId, coverLetter }, token)).application;
      setProjectApplications((current) => [application, ...current.filter((item) => item.id !== application.id)]);
      notify("Applied Successfully");
      return application;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const hireFreelancer = async (projectId, freelancerId) => {
    if (!currentUser) {
      throw new Error("Please login to hire a freelancer");
    }
    setSubmitting(true);
    setError("");
    try {
      const project = await api.hireFreelancer(projectId, { freelancerId }, token);
      const [refreshedApplications, nextChats] = await Promise.all([api.getProjectApplicants(projectId, token), api.getChats(token)]);
      setProjectApplications((current) => {
        const unrelated = current.filter((item) => item.projectId !== projectId);
        return [...refreshedApplications, ...unrelated];
      });
      setChats(nextChats);
      setProjects((current) => current.map((item) => (item.id === projectId ? { ...item, ...project } : item)));
      notify("Freelancer hired successfully");
      return project;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProfile = async (payload) => {
    if (!currentUser) {
      throw new Error("Please login to update your profile");
    }
    setSubmitting(true);
    setError("");
    try {
      const user = demoMode ? enrichUser({ ...currentUser, ...payload }) : enrichUser(await api.updateProfile(payload, token));
      setUsers((current) => current.map((item) => (item.id === currentUser.id ? user : item)));
      syncCurrentUser(user);
      notify("Profile updated successfully");
      return user;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    if (!currentUser) {
      throw new Error("Please login to update project status");
    }
    setSubmitting(true);
    setError("");
    try {
      let project;
      let existing;
      if (demoMode) {
        existing = projects.find((item) => item.id === projectId);
        if (!existing) {
          throw new Error("Project not found");
        }
        project = { ...existing, status, completedAt: status === "Completed" ? new Date().toISOString() : existing.completedAt || "" };
      } else {
        existing = projects.find((item) => item.id === projectId);
        project = await api.updateProjectStatus(projectId, { status }, token);
      }
      
      if (status === "Completed" && existing?.status !== "Completed") {
        syncCurrentUser((user) => ({ ...user, completedProjects: (user.completedProjects || 0) + 1 }));
        setUsers((current) =>
          current.map((u) => {
            if (u.id === existing?.clientId || u.id === existing?.freelancerId) {
              return { ...u, completedProjects: (u.completedProjects || 0) + 1 };
            }
            return u;
          })
        );
      }

      setProjects((current) => current.map((item) => (item.id === projectId ? { ...item, ...project } : item)));
      notify(`Project marked as ${status}`);
      return project;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const sendProjectMessage = async (projectId, text) => {
    if (!currentUser) {
      throw new Error("Please login to send messages");
    }
    setSubmitting(true);
    setError("");
    try {
      const message = await api.sendMessage({ projectId, text }, token);
      setMessages((current) => [...current, message].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()));
      setChats(await api.getChats(token));
      
      notify("Message sent");
      return message;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const submitProjectReview = async (projectId, freelancerId, rating, review) => {
    if (!currentUser) {
      throw new Error("Please login to submit a review");
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await api.submitReview(projectId, { freelancerId, rating, review }, token);
      setReviews((current) => [result, ...current.filter((r) => r.id !== result.id)]);
      notify("Review published successfully!");
      return result;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  const loadRazorpayCheckout = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const releaseProjectPayment = async (projectId, amount) => {
    if (!currentUser) {
      throw new Error("Please login to release payment");
    }
    setSubmitting(true);
    setError("");
    try {
      const project = projects.find((item) => item.id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      if (demoMode) {
        const payment = { id: `payment-${Date.now()}`, projectId, clientId: project.clientId, freelancerId: project.freelancerId, amount, currency: "INR", status: "paid", provider: "demo", providerOrderId: `demo_order_${Date.now()}`, providerPaymentId: `demo_payment_${Date.now()}`, receipt: `receipt_${projectId}_${Date.now()}`, paidAt: new Date().toISOString(), createdAt: new Date().toISOString() };
        setPayments((current) => {
          const nextPayments = [payment, ...current];
          localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(nextPayments));
          return nextPayments;
        });
        setProjects((current) => current.map((item) => (item.id === projectId ? { ...item, status: "Paid", paymentStatus: "paid", paymentAmount: amount, paidAt: payment.paidAt, completedAt: item.completedAt || payment.paidAt } : item)));
        setUsers((current) => current.map((user) => (user.id === project.freelancerId ? { ...user, earnings: Number(user.earnings || 0) + Number(amount) } : user)));
        notify("Demo payment released successfully");
        return payment;
      }

      const order = await api.createProjectPaymentOrder(projectId, { amount, markCompleted: project.status !== "Completed" && project.status !== "Paid" }, token);
      if (order.mode === "demo") {
        const verification = await api.verifyProjectPayment({ projectId, orderId: order.orderId, paymentId: order.paymentId }, token);
        setPayments((current) => [verification.payment, ...current.filter((item) => item.id !== verification.payment.id)]);
        setProjects((current) => current.map((item) => (item.id === projectId ? { ...item, status: verification.projectStatus, paymentStatus: "paid", paymentAmount: amount, paidAt: verification.payment.paidAt } : item)));
        await loadPersonalizedRemoteData(currentUser.id, token);
        notify("Payment released successfully");
        return verification.payment;
      }

      const razorpayLoaded = await loadRazorpayCheckout();
      if (!razorpayLoaded) {
        throw new Error("Unable to load Razorpay checkout");
      }

      const payment = await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: order.key,
          amount: order.amount * 100,
          currency: order.currency,
          name: "FreelanceFlow",
          description: `Project payout for ${project.title}`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              const verification = await api.verifyProjectPayment({ projectId, orderId: order.orderId, razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature }, token);
              resolve(verification.payment);
            } catch (verificationError) {
              reject(verificationError);
            }
          },
          theme: { color: "#14b8a6" },
          modal: { ondismiss: () => reject(new Error("Payment was cancelled")) }
        });
        razorpay.open();
      });

      setPayments((current) => [payment, ...current.filter((item) => item.id !== payment.id)]);
      setProjects((current) => current.map((item) => (item.id === projectId ? { ...item, status: "Paid", paymentStatus: "paid", paymentAmount: amount, paidAt: payment.paidAt, completedAt: item.completedAt || payment.paidAt } : item)));
      await loadPersonalizedRemoteData(currentUser.id, token);
      notify("Payment released successfully");
      return payment;
    } catch (nextError) {
      setError(nextError.message);
      throw nextError;
    } finally {
      setSubmitting(false);
    }
  };

  // ADMIN METHODS
  const fetchAdminUsers = async () => {
    try {
      return await api.getAdminUsers(token);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const deleteAdminUser = async (id) => {
    try {
      await api.deleteUserAdmin(id, token);
      setUsers((prev) => prev.filter((u) => u.id !== id && u._id !== id));
      notify("User deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete user", "error");
    }
  };

  const fetchAdminProjects = async () => {
    try {
      return await api.getAdminProjects(token);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const deleteAdminProject = async (id) => {
    try {
      await api.deleteProjectAdmin(id, token);
      setProjects((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      notify("Project deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete project", "error");
    }
  };

  const fetchAdminApplications = async () => {
    try {
      return await api.getAdminApplications(token);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const approveApplicationAdmin = async (id) => {
    try {
      await api.approveApplicationAdmin(id, token);
      setProjectApplications((prev) => prev.map(a => (a.id === id || a._id === id) ? { ...a, status: "Accepted" } : a));
      notify("Application approved", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to approve application", "error");
    }
  };

  const rejectApplicationAdmin = async (id) => {
    try {
      await api.rejectApplicationAdmin(id, token);
      setProjectApplications((prev) => prev.map(a => (a.id === id || a._id === id) ? { ...a, status: "Rejected" } : a));
      notify("Application rejected", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to reject application", "error");
    }
  };

  const createCourseAdmin = async (data) => {
    try {
      const course = await api.createCourseAdmin(data, token);
      setCourses((prev) => [...prev, course]);
      notify("Course created", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to create course", "error");
    }
  };

  const deleteCourseAdmin = async (id) => {
    try {
      await api.deleteCourseAdmin(id, token);
      setCourses((prev) => prev.filter((c) => c.id !== id && c._id !== id));
      notify("Course deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete course", "error");
    }
  };

  const createInternshipAdmin = async (data) => {
    try {
      const internship = await api.createInternshipAdmin(data, token);
      setInternships((prev) => [...prev, internship]);
      notify("Internship created", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to create internship", "error");
    }
  };

  const deleteInternshipAdmin = async (id) => {
    try {
      await api.deleteInternshipAdmin(id, token);
      setInternships((prev) => prev.filter((i) => i.id !== id && i._id !== id));
      notify("Internship deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete internship", "error");
    }
  };

  const fetchAdminCertifications = async () => {
    try {
      return await api.getAdminCertifications(token);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const createCertificationAdmin = async (data) => {
    try {
      const cert = await api.createCertificationAdmin(data, token);
      setCertifications((prev) => [cert, ...prev]);
      notify("Certification created", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to create certification", "error");
      throw err;
    }
  };

  const updateCertificationAdmin = async (id, data) => {
    try {
      const cert = await api.updateCertificationAdmin(id, data, token);
      setCertifications((prev) => prev.map(c => (c.id === id || c._id === id) ? cert : c));
      notify("Certification updated", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to update certification", "error");
      throw err;
    }
  };

  const deleteCertificationAdmin = async (id) => {
    try {
      await api.deleteCertificationAdmin(id, token);
      setCertifications((prev) => prev.filter((c) => c.id !== id && c._id !== id));
      notify("Certification deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete certification", "error");
    }
  };

  const fetchLearningPosts = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.getLearningPosts(`?${queryParams}`);
      return response;
    } catch (err) {
      console.error(err);
      return { posts: [], totalPages: 1 };
    }
  };

  const fetchLearningPostById = async (id) => {
    try {
      return await api.getLearningPostById(id);
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchLearningRecommendations = async (domain, level = "Beginner") => {
    try {
      const queryParams = new URLSearchParams({ level, ...(domain && { domain }) }).toString();
      return await api.getLearningRecommendations(`?${queryParams}`);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchAdminLearningPosts = async () => {
    try {
      return await api.getAdminLearningPosts(token);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const createLearningPostAdmin = async (data) => {
    try {
      const post = await api.createLearningPostAdmin(data, token);
      setLearningPosts((prev) => [post, ...prev]);
      notify("Learning post created", "success");
      return post;
    } catch (err) {
      console.error(err);
      notify("Failed to create learning post", "error");
      throw err;
    }
  };

  const updateLearningPostAdmin = async (id, data) => {
    try {
      const post = await api.updateLearningPostAdmin(id, data, token);
      setLearningPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? post : p));
      notify("Learning post updated", "success");
      return post;
    } catch (err) {
      console.error(err);
      notify("Failed to update learning post", "error");
      throw err;
    }
  };

  const deleteLearningPostAdmin = async (id) => {
    try {
      await api.deleteLearningPostAdmin(id, token);
      setLearningPosts((prev) => prev.filter((p) => p.id !== id && p._id !== id));
      notify("Learning post deleted", "success");
    } catch (err) {
      console.error(err);
      notify("Failed to delete learning post", "error");
    }
  };

  const toggleLearningPostApproval = async (id) => {
    try {
      const post = await api.toggleLearningPostApproval(id, token);
      setLearningPosts((prev) => prev.map((p) => (p.id === id || p._id === id) ? post : p));
      notify(`Learning post ${post.isApproved ? "approved" : "unapproved"}`, "success");
    } catch (err) {
      console.error(err);
      notify("Failed to toggle learning post approval", "error");
    }
  };

  return (
    <AppContext.Provider
      value={{
        demoMode,
        toggleDemoMode,
        token,
        currentUser,
        users,
        projects,
        courses,
        internships,
        applications,
        projectApplications,
        chats,
        messages,
        payments,
        reviews,
        learningProgress,
        quizAttempts,
        certificates,
        recommendedProjects,
        resumePreview,
        loading,
        submitting,
        error,
        toasts,
        login,
        register,
        uploadResume,
        logout,
        submitProjectReview,
        loadData,
        getInternshipDetails,
        applyToInternship,
        completeCourse,
        updateCourseProgress,
        attemptQuiz,
        createProject,
        applyToProject,
        hireFreelancer,
        updateProfile,
        sendProjectMessage,
        updateProjectStatus,
        releaseProjectPayment,
        fetchAdminUsers,
        deleteAdminUser,
        fetchAdminProjects,
        deleteAdminProject,
        fetchAdminApplications,
        approveApplicationAdmin,
        rejectApplicationAdmin,
        createCourseAdmin,
        deleteCourseAdmin,
        createInternshipAdmin,
        deleteInternshipAdmin,
        fetchAdminCertifications,
        createCertificationAdmin,
        updateCertificationAdmin,
        deleteCertificationAdmin,
        certifications,
        recommendedCertifications,
        setCertifications,
        setRecommendedCertifications,
        learningPosts,
        setLearningPosts,
        fetchLearningPosts,
        fetchLearningPostById,
        fetchLearningRecommendations,
        fetchAdminLearningPosts,
        createLearningPostAdmin,
        updateLearningPostAdmin,
        deleteLearningPostAdmin,
        toggleLearningPostApproval
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
