import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import LoadingBlock from "../components/LoadingBlock";
import { useApp } from "../context/AppContext";

const CourseItem = ({ course, currentUser }) => {
  const { learningProgress, quizAttempts, updateCourseProgress, attemptQuiz, completeCourse } = useApp();
  
  const [openQuiz, setOpenQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const progressEntry = learningProgress[currentUser.id]?.[course.id] || { completedLessons: [], progress: 0, completed: false };
  const completedTopics = progressEntry.completedLessons || [];
  
  const courseAttempts = useMemo(
    () => quizAttempts.filter(attempt => attempt.courseId === course.id),
    [quizAttempts, course.id]
  );
  const latestAttempt = courseAttempts[0];

  const handleLessonToggle = async (lessonTitle) => {
    try {
      const nextCompleted = completedTopics.includes(lessonTitle)
        ? completedTopics.filter((l) => l !== lessonTitle)
        : [...completedTopics, lessonTitle];
      await updateCourseProgress(course.id, nextCompleted);
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  };

  const handleQuizSubmit = async () => {
    if (!course.quiz || course.quiz.length === 0) return;
    setSubmitting(true);
    setErrorMsg("");
    
    try {
      const answersArray = course.quiz.map((_, index) => quizAnswers[`${course.id}-${index}`] || "");
      await attemptQuiz(course.id, answersArray);
      setOpenQuiz(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const hasPassedQuiz = latestAttempt && latestAttempt.percentage >= 70;
  const isEligible = progressEntry.completed && hasPassedQuiz;

  const handleGenerate = async () => {
    if (!isEligible) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      await completeCourse(course.id);
    } catch (err) {
      setErrorMsg(err.message || "Error generating certificate");
    } finally {
      setSubmitting(false);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "video":
        return (
          <svg className="h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pdf":
        return (
          <svg className="h-4 w-4 shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Check if course has new structured modules or old lessons string array
  const hasModules = Array.isArray(course.modules) && course.modules.length > 0;
  
  return (
    <article className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-300">{course.level}</p>
          <h2 className="mt-2 text-2xl font-semibold">{course.title}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{course.description}</p>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">{course.duration}</span>
      </div>

      <div className="mt-5 space-y-4">
        {hasModules ? (
          course.modules.map((module, moduleIdx) => {
            // Lock module if previous module is not fully completed
            let isLocked = false;
            if (moduleIdx > 0) {
              const prevModule = course.modules[moduleIdx - 1];
              const prevModuleCompleted = prevModule.content.every(c => completedTopics.includes(c.title));
              isLocked = !prevModuleCompleted;
            }

            return (
              <div key={module.title || moduleIdx} className={`rounded-2xl border border-white/5 bg-black/20 p-5 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    {module.title}
                    {isLocked && (
                      <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Locked
                      </span>
                    )}
                  </h3>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{module.level}</span>
                </div>
                
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {module.content?.map((item) => (
                    <label key={item.title} className={`flex items-center gap-3 rounded-xl bg-white/5 p-3 text-sm text-slate-200 transition-colors ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/10'}`}>
                      <input
                        type="checkbox"
                        checked={completedTopics.includes(item.title)}
                        onChange={() => !isLocked && handleLessonToggle(item.title)}
                        disabled={isLocked}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {getIconForType(item.type)}
                      <span className="flex-1 truncate">{item.title}</span>
                      {item.url && !isLocked && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs text-teal-400 hover:text-teal-300" onClick={(e) => e.stopPropagation()}>
                          View
                        </a>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {course.lessons?.map((lesson) => (
              <label key={lesson} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-sm text-slate-200 cursor-pointer hover:bg-white/10 transition-colors">
                <input
                  type="checkbox"
                  checked={completedTopics.includes(lesson)}
                  onChange={() => handleLessonToggle(lesson)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 cursor-pointer"
                />
                <span>{lesson}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-2 rounded-full bg-teal-500 transition-all duration-300" style={{ width: `${progressEntry.progress || 0}%` }} />
        </div>
        <span className="text-sm font-medium text-slate-300">{Math.round(progressEntry.progress || 0)}% Completed</span>
      </div>

      {course.quiz?.length ? (
        <div className="mt-5 rounded-[1.5rem] bg-white/5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Final Assessment</p>
              {latestAttempt ? (
                <p className="mt-1 text-sm font-medium text-amber-300">
                  Last Score: {latestAttempt.percentage}% ({hasPassedQuiz ? "Passed" : "Needs Improvement"})
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">Score 70% or higher to pass.</p>
              )}
            </div>
            <button
              type="button"
              disabled={!progressEntry.completed && !latestAttempt}
              onClick={() => setOpenQuiz(!openQuiz)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {openQuiz ? "Hide Quiz" : "Attempt Quiz"}
            </button>
          </div>

          {openQuiz ? (
            <div className="mt-4 space-y-4">
              {course.quiz.map((question, questionIndex) => (
                <div key={question.id || `${course.id}-${questionIndex}`} className="rounded-2xl bg-slate-950/40 p-4">
                  <p className="text-sm font-medium text-white">{question.question}</p>
                  <div className="mt-3 grid gap-2">
                    {question.options.map((option) => {
                      const answerKey = `${course.id}-${questionIndex}`;
                      return (
                        <label key={option} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-200 cursor-pointer hover:bg-white/10">
                          <input
                            type="radio"
                            name={answerKey}
                            value={option}
                            checked={quizAnswers[answerKey] === option}
                            onChange={(event) => setQuizAnswers((current) => ({ ...current, [answerKey]: event.target.value }))}
                            disabled={submitting}
                            className="cursor-pointer"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleQuizSubmit}
                  className="rounded-full bg-teal-500 px-6 py-2 text-sm font-semibold text-slate-950 disabled:bg-teal-700 disabled:opacity-50 hover:bg-teal-400"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50">
        <div>
          {errorMsg ? (
            <p className="text-sm text-rose-400 font-medium">{errorMsg}</p>
          ) : (
            <p className="text-sm text-slate-400">
              {isEligible
                ? "You have completed the course! You can now generate your certificate."
                : "Complete all topics and pass the quiz (70%+) to unlock your certificate."}
            </p>
          )}
        </div>
        <button
          disabled={!isEligible || submitting}
          onClick={handleGenerate}
          className="shrink-0 rounded-full bg-amber-400 px-6 py-2 text-sm font-semibold text-slate-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 transition-colors"
        >
          {submitting ? "Generating..." : "Generate Certificate"}
        </button>
      </div>
    </article>
  );
};

export default function LearningPage() {
  const { currentUser, courses, certificates, loading } = useApp();

  const userCertificates = useMemo(
    () => certificates.filter(cert => cert.userId === currentUser?.id),
    [certificates, currentUser]
  );

  if (loading || !currentUser) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Loading learning paths..." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-panel xl:col-span-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Academy</p>
        <h1 className="mt-2 text-4xl font-semibold">Structured Learning & Certification</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Complete skill-based modules and pass the final assessment to earn verifiable credentials.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {courses.length === 0 ? (
            <p className="text-sm text-slate-400">No courses available.</p>
          ) : (
            courses.map((course) => (
              <CourseItem
                key={course.id}
                course={course}
                currentUser={currentUser}
              />
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
            <h2 className="text-2xl font-semibold flex items-center gap-3">
              <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Your Credentials
            </h2>
            <div className="mt-5 space-y-4">
              {userCertificates.length > 0 ? (
                userCertificates.map((cert) => (
                  <div key={cert.id || cert._id} className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">Certificate of Completion</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">{cert.title}</h3>
                    <p className="mt-1 text-sm text-amber-100/80">Issued to: <span className="text-white">{currentUser.name}</span></p>
                    <p className="mt-1 text-sm text-slate-300">
                      Score: <span className="font-semibold text-white">{cert.score}%</span>
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      Issued {new Date(cert.issuedAt || cert.createdAt).toLocaleDateString("en-IN", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {cert.downloadUrl && (
                        <a
                          href={cert.downloadUrl}
                          download={cert.fileName || "certificate.html"}
                          className="inline-block rounded-full bg-amber-400/20 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-400/30 transition-colors"
                        >
                          Download
                        </a>
                      )}
                      {cert.certificateNumber && (
                        <Link
                          to={`/verify/${cert.certificateNumber}`}
                          className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-4 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-500/30 transition-colors"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verify Authenticity
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/5 bg-white/5 p-6 text-center">
                  <p className="text-sm text-slate-400">No credentials earned yet.</p>
                  <p className="text-xs text-slate-500 mt-2">Complete a course and pass its final assessment to earn a verified credential.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
