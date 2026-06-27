import Certificate from "../models/Certificate.js";
import Course from "../models/Course.js";
import LearningProgress from "../models/LearningProgress.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/User.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { generateCertificateAsset } from "../services/certificateService.js";

const decorateCourse = (course) => ({
  id: course.id || course._id?.toString(),
  title: course.title,
  level: course.level,
  duration: course.duration,
  description: course.description,
  lessons: course.lessons || [],
  quiz: (course.quiz || []).map((question, index) => ({
    id: question.id || `${course.id || course._id?.toString()}-quiz-${index}`,
    question: question.question,
    options: question.options || []
  }))
});

const normalizeProgress = (progress, course) => {
  const totalLessons = course.lessons?.length || 0;
  const completedLessons = progress?.completedLessons || [];
  const computedProgress = totalLessons ? Math.round((completedLessons.length / totalLessons) * 100) : 0;

  return {
    id: progress?.id || progress?._id?.toString?.(),
    userId: progress?.userId?.toString?.() || progress?.userId,
    courseId: progress?.courseId?.toString?.() || progress?.courseId || course.id || course._id?.toString?.(),
    completedLessons,
    progress: computedProgress,
    completed: totalLessons > 0 && completedLessons.length === totalLessons
  };
};

const decorateCertificate = (certificate) => ({
  id: certificate.id || certificate._id?.toString(),
  userId: certificate.userId?.toString?.() || certificate.userId,
  courseId: certificate.courseId?.toString?.() || certificate.courseId,
  title: certificate.title,
  issuedAt: certificate.issuedAt,
  downloadUrl: certificate.downloadUrl || "",
  fileName: certificate.fileName || "",
  certificateNumber: certificate.certificateNumber || "",
  score: certificate.score || 0
});

const decorateQuizAttempt = (attempt) => ({
  id: attempt.id || attempt._id?.toString(),
  userId: attempt.userId?.toString?.() || attempt.userId,
  courseId: attempt.courseId?.toString?.() || attempt.courseId,
  answers: attempt.answers || [],
  score: attempt.score || 0,
  totalQuestions: attempt.totalQuestions || 0,
  percentage: attempt.percentage || 0,
  passed: Boolean(attempt.passed),
  attemptedAt: attempt.attemptedAt || attempt.createdAt,
  createdAt: attempt.createdAt
});

const generateCertificateNumber = (userId, courseId) =>
  `FF-${String(userId).slice(0, 4).toUpperCase()}-${String(courseId).slice(0, 4).toUpperCase()}-${Date.now()
    .toString()
    .slice(-6)}`;

const getCourseRecord = async (courseId) => {
  if (isMongoConnected()) {
    return Course.findById(courseId).lean();
  }

  return demoDb.courses.findById(courseId);
};

export const getCourses = async (_req, res) => {
  const courses = isMongoConnected() ? await Course.find().lean() : await demoDb.courses.findAll();
  res.json(courses.map((course) => decorateCourse(course)));
};

export const getProgress = async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You can only access your own learning progress" });
  }

  if (isMongoConnected()) {
    const [courses, progressRecords] = await Promise.all([
      Course.find().lean(),
      LearningProgress.find({ userId }).lean()
    ]);

    const progressMap = new Map(progressRecords.map((record) => [record.courseId?.toString?.() || record.courseId, record]));
    return res.json(
      courses.map((course) =>
        normalizeProgress(progressMap.get(course._id.toString()), { ...course, id: course._id.toString() })
      )
    );
  }

  const [courses, progressRecords] = await Promise.all([
    demoDb.courses.findAll(),
    demoDb.learningProgress.filter((item) => item.userId === userId)
  ]);
  const progressMap = new Map(progressRecords.map((record) => [record.courseId, record]));
  res.json(courses.map((course) => normalizeProgress(progressMap.get(course.id), course)));
};

export const updateCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const { completedLessons = [] } = req.body;

  if (!Array.isArray(completedLessons)) {
    return res.status(400).json({ message: "completedLessons must be an array" });
  }

  const course = await getCourseRecord(courseId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const validCompletedLessons = completedLessons.filter((lesson) => (course.lessons || []).includes(lesson));
  const progressData = normalizeProgress(
    {
      userId: req.user.id,
      courseId,
      completedLessons: validCompletedLessons
    },
    { ...course, id: course.id || course._id?.toString() }
  );

  if (isMongoConnected()) {
    const progress = await LearningProgress.findOneAndUpdate(
      { userId: req.user.id, courseId },
      progressData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.json(normalizeProgress(progress, { ...course, id: course._id.toString() }));
  }

  const existing = await demoDb.learningProgress.findOne(
    (item) => item.userId === req.user.id && item.courseId === courseId
  );

  const progress = existing
    ? await demoDb.learningProgress.update(existing.id, progressData)
    : await demoDb.learningProgress.insert(progressData);

  res.json(normalizeProgress(progress, { ...course, id: course.id }));
};

export const submitQuizAttempt = async (req, res) => {
  const { courseId } = req.params;
  const { answers = [] } = req.body;

  if (!Array.isArray(answers)) {
    return res.status(400).json({ message: "answers must be an array" });
  }

  const course = await getCourseRecord(courseId);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const quiz = course.quiz || [];
  if (!quiz.length) {
    return res.status(400).json({ message: "This course does not have a quiz" });
  }

  const score = quiz.reduce((total, question, index) => {
    const submittedAnswer = String(answers[index] || "").trim();
    return total + (submittedAnswer && submittedAnswer === question.answer ? 1 : 0);
  }, 0);
  const totalQuestions = quiz.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const attemptPayload = {
    userId: req.user.id,
    courseId,
    answers,
    score,
    totalQuestions,
    percentage,
    passed: percentage >= 60,
    attemptedAt: new Date().toISOString()
  };

  let attempt;
  if (isMongoConnected()) {
    attempt = await QuizAttempt.create(attemptPayload);
  } else {
    attempt = await demoDb.quizAttempts.insert(attemptPayload);
  }

  res.status(201).json(decorateQuizAttempt(attempt));
};

export const getQuizAttempts = async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You can only access your own quiz attempts" });
  }

  if (isMongoConnected()) {
    const attempts = await QuizAttempt.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(attempts.map(decorateQuizAttempt));
  }

  const attempts = await demoDb.quizAttempts.filter((attempt) => attempt.userId === userId);
  res.json(attempts.sort((left, right) => new Date(right.attemptedAt).getTime() - new Date(left.attemptedAt).getTime()).map(decorateQuizAttempt));
};

export const completeCourse = async (req, res) => {
  const courseId = req.params.courseId || req.body.courseId;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  if (isMongoConnected()) {
    const [course, progress, user] = await Promise.all([
      Course.findById(courseId).lean(),
      LearningProgress.findOne({ userId: req.user.id, courseId }).lean(),
      User.findById(req.user.id).lean()
    ]);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const normalized = normalizeProgress(progress, { ...course, id: course._id.toString() });

    if (!normalized.completed) {
      return res.status(400).json({ message: "Complete all lessons before generating a certificate" });
    }

    const existingCertificate = await Certificate.findOne({ userId: req.user.id, courseId }).lean();
    if (existingCertificate) {
      return res.json(decorateCertificate(existingCertificate));
    }

    const issuedAt = new Date().toISOString();
    const certificateNumber = generateCertificateNumber(req.user.id, courseId);
    const certificateAsset = await generateCertificateAsset({
      userName: user?.name || req.user.name || "Learner",
      courseTitle: course.title,
      issuedAt,
      certificateNumber
    });

    const latestAttempt = await QuizAttempt.findOne({ userId: req.user.id, courseId }).sort({ createdAt: -1 }).lean();
    const score = latestAttempt ? latestAttempt.percentage : 100;

    const certificate = await Certificate.create({
      userId: req.user.id,
      courseId,
      title: `${course.title} Certificate`,
      issuedAt,
      downloadUrl: certificateAsset.downloadUrl,
      fileName: certificateAsset.fileName,
      certificateNumber,
      score
    });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: {
        certificates: {
          id: certificate._id.toString(),
          title: certificate.title,
          courseId,
          issuedAt,
          downloadUrl: certificateAsset.downloadUrl,
          certificateNumber
        }
      }
    });

    return res.status(201).json(decorateCertificate(certificate.toObject()));
  }

  const [course, progress, user] = await Promise.all([
    demoDb.courses.findById(courseId),
    demoDb.learningProgress.findOne((item) => item.userId === req.user.id && item.courseId === courseId),
    demoDb.users.findById(req.user.id)
  ]);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const normalized = normalizeProgress(progress, course);

  if (!normalized.completed) {
    return res.status(400).json({ message: "Complete all lessons before generating a certificate" });
  }

  const existingCertificate = await demoDb.certificates.findOne(
    (item) => item.userId === req.user.id && item.courseId === courseId
  );

  if (existingCertificate) {
    return res.json(decorateCertificate(existingCertificate));
  }

  const issuedAt = new Date().toISOString();
  const certificateNumber = generateCertificateNumber(req.user.id, courseId);
  const certificateAsset = await generateCertificateAsset({
    userName: user?.name || req.user.name || "Learner",
    courseTitle: course.title,
    issuedAt,
    certificateNumber
  });

  const attempts = await demoDb.quizAttempts.filter(item => item.userId === req.user.id && item.courseId === courseId);
  const latestAttempt = attempts.sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())[0];
  const score = latestAttempt ? latestAttempt.percentage : 100;

  const certificate = await demoDb.certificates.insert({
    userId: req.user.id,
    courseId,
    title: `${course.title} Certificate`,
    issuedAt,
    downloadUrl: certificateAsset.downloadUrl,
    fileName: certificateAsset.fileName,
    certificateNumber,
    score
  });

  await demoDb.users.update(req.user.id, {
    certificates: [
      ...(user?.certificates || []),
      {
        id: certificate.id,
        title: certificate.title,
        courseId,
        issuedAt,
        downloadUrl: certificate.downloadUrl,
        certificateNumber,
        score: certificate.score
      }
    ]
  });

  res.status(201).json(decorateCertificate(certificate));
};

export const completeCourseByBody = async (req, res) => completeCourse(req, res);

export const getCertificates = async (req, res) => {
  const { userId } = req.params;

  if (isMongoConnected()) {
    const certificates = await Certificate.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(certificates.map(decorateCertificate));
  }

  const certificates = await demoDb.certificates.filter((item) => item.userId === userId);
  res.json(certificates.map(decorateCertificate));
};

export const getMyCertificates = async (req, res) => {
  req.params.userId = req.user.id;
  return getCertificates(req, res);
};

export const verifyCertificate = async (req, res) => {
  const { certificateNumber } = req.params;
  if (!certificateNumber) {
    return res.status(400).json({ message: "Certificate number is required" });
  }

  let certificate;
  let user;
  let course;

  if (isMongoConnected()) {
    certificate = await Certificate.findOne({ certificateNumber }).lean();
    if (certificate) {
      user = await User.findById(certificate.userId).lean();
      course = await Course.findById(certificate.courseId).lean();
    }
  } else {
    certificate = await demoDb.certificates.findOne((c) => c.certificateNumber === certificateNumber);
    if (certificate) {
      user = await demoDb.users.findById(certificate.userId);
      course = await demoDb.courses.findById(certificate.courseId);
    }
  }

  if (!certificate) {
    return res.status(404).json({ message: "Invalid Certificate ID" });
  }

  res.json({
    ...decorateCertificate(certificate),
    userName: user?.name || "Unknown User",
    courseName: course?.title || certificate.title.replace(" Certificate", "")
  });
};
