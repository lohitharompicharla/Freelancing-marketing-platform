import LoadingBlock from "../components/LoadingBlock";
import ProfileEditor from "../components/ProfileEditor";
import ProjectChatPanel from "../components/ProjectChatPanel";
import ProjectCard from "../components/ProjectCard";
import StatCard from "../components/StatCard";
import ReviewModal from "../components/ReviewModal";
import { useApp } from "../context/AppContext";
import { useState } from "react";

const getSuggestedPaymentAmount = (project) => {
  if (Number(project.paymentAmount) > 0) {
    return Number(project.paymentAmount);
  }

  const amounts = String(project.budgetRange || "")
    .replace(/,/g, "")
    .match(/\d+/g)
    ?.map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (amounts?.length >= 2) {
    return Math.round((amounts[0] + amounts[1]) / 2);
  }

  return amounts?.[0] || 0;
};

export default function DashboardPage() {
  const {
    currentUser,
    internships,
    projects,
    reviews,
    loading,
    applications,
    recommendedProjects,
    certificates,
    users,
    messages,
    payments,
    projectApplications,
    submitting,
    applyToProject,
    sendProjectMessage,
    updateProjectStatus,
    releaseProjectPayment,
    hireFreelancer,
    updateProfile,
    submitProjectReview
  } = useApp();

  const [reviewProject, setReviewProject] = useState(null);

  if (loading || !currentUser) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Loading dashboard..." />
      </section>
    );
  }

  const userApplications = applications.filter((application) => application.userId === currentUser.id);
  const myProjectApplications = projectApplications.filter((application) => application.freelancerId === currentUser.id);
  const userPayments = payments.filter(
    (payment) => payment.clientId === currentUser.id || payment.freelancerId === currentUser.id
  );
  const matchedInternships = internships.map((internship) => {
    const commonSkills = internship.skills.filter((skill) => (currentUser.skills || []).includes(skill)).length;
    const matchPercentage = internship.skills.length ? Math.round((commonSkills / internship.skills.length) * 100) : 0;
    return { ...internship, matchPercentage };
  });

  const userProjects =
    currentUser.role === "client"
      ? projects.filter((project) => project.clientId === currentUser.id)
      : projects.filter((project) => project.freelancerId === currentUser.id || project.status === "Open");

  return (
    <section className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
        <p className="text-sm uppercase tracking-[0.28em] text-teal-300">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold">{currentUser.name}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {(currentUser.badges || []).map((badge) => (
            <span key={badge} className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {currentUser.role === "freelancer" ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <StatCard label="Earnings" value={`Rs ${Number(currentUser.earnings || 0).toLocaleString("en-IN")}`} accent="#14b8a6" />
              <StatCard label="Rating" value={currentUser.rating || 0} accent="#f59e0b" />
              <StatCard label="Total Reviews" value={reviews.filter(r => r.freelancerId === currentUser.id).length} accent="#8b5cf6" />
              <StatCard label="Completed Projects" value={currentUser.completedProjects || 0} accent="#38bdf8" />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Recommended projects</h2>
              <div className="mt-5 grid gap-4">
                {(recommendedProjects.length
                  ? recommendedProjects.map((project) => ({
                      ...project,
                      requiredSkills: project.requiredSkills || project.matchedSkills || [],
                      budgetRange: "Skill-ranked recommendation",
                      deadline: "Flexible",
                      status: `${project.matchScore}% match`
                    }))
                  : userProjects.slice(0, 3)
                ).map((project) => (
                  <div key={project.id} className="space-y-2">
                    <ProjectCard project={project} />
                    {project.recommendationReason ? (
                      <p className="rounded-2xl bg-teal-500/10 px-4 py-3 text-sm text-teal-100">
                        {project.recommendationReason}
                      </p>
                    ) : null}
                    {!myProjectApplications.some((application) => application.projectId === project.id) ? (
                      <button
                        type="button"
                        onClick={() => applyToProject(project.id, "Applying from recommended projects")}
                        disabled={submitting}
                        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                      >
                        {submitting ? "Applying..." : "Apply"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200"
                      >
                        Applied Successfully
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <ProfileEditor user={currentUser} onSave={updateProfile} saving={submitting} />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Your applications</h2>
              <div className="mt-5 space-y-3">
                {userApplications.length ? (
                  userApplications.map((application) => {
                    const internship = internships.find((item) => item.id === application.internshipId);
                    return (
                      <div key={application.id} className="rounded-3xl bg-white/5 p-4">
                        <p className="font-semibold">{internship?.title || "Internship"}</p>
                        <p className="mt-1 text-sm text-slate-400">{application.status}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No internship applications yet.</p>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Certifications</h2>
                {(() => {
                  const count = certificates.filter((item) => item.userId === currentUser.id).length;
                  let rank = "Novice";
                  let color = "text-slate-400 bg-slate-400/10";
                  if (count >= 3) { rank = "Master"; color = "text-amber-400 bg-amber-400/10"; }
                  else if (count >= 1) { rank = "Scholar"; color = "text-teal-400 bg-teal-400/10"; }
                  
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${color}`}>
                      Rank: {rank}
                    </span>
                  );
                })()}
              </div>
              
              <div className="mt-5 space-y-3">
                {certificates.filter((item) => item.userId === currentUser.id).length ? (
                  certificates
                    .filter((item) => item.userId === currentUser.id)
                    .map((certificate) => (
                      <div key={certificate.id} className="rounded-3xl bg-white/5 p-4 border border-white/5">
                        <p className="font-semibold">{certificate.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-slate-300">
                            Issued {new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString("en-IN")}
                          </p>
                          <span className="text-xs font-semibold text-amber-300 bg-amber-400/10 px-2 py-1 rounded">
                            {certificate.score}% Score
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <a
                            href={certificate.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={!certificate.downloadUrl?.startsWith("/api/") ? `${certificate.title.replace(/\s+/g, "-").toLowerCase()}.html` : undefined}
                            className="inline-block rounded-full bg-amber-400/20 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-400/30"
                          >
                            View / Download
                          </a>
                          {certificate.certificateNumber && (
                            <a
                              href={`/verify/${certificate.certificateNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block rounded-full bg-teal-400/20 px-3 py-2 text-xs font-semibold text-teal-400 hover:bg-teal-400/30"
                            >
                              Verify
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center p-4 rounded-2xl bg-black/20 border border-white/5">
                    <p className="text-sm text-slate-400">No certificates earned yet.</p>
                    <p className="mt-1 text-xs text-slate-500">Visit the Academy to level up your rank.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Recent reviews</h2>
              <div className="mt-5 space-y-3">
                {reviews.filter((r) => r.freelancerId === currentUser.id).length ? (
                  reviews
                    .filter((r) => r.freelancerId === currentUser.id)
                    .map((review) => {
                      const client = users.find((u) => u.id === review.clientId);
                      return (
                        <div key={review.id} className="rounded-3xl bg-white/5 p-4">
                          <p className="font-semibold">{client?.name || "Client"}</p>
                          <p className="mt-1 text-sm text-amber-300">Rating {review.rating}/5</p>
                          <p className="mt-2 text-sm text-slate-300">{review.review}</p>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-slate-400">No reviews yet.</p>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Project payouts</h2>
              <div className="mt-5 space-y-3">
                {userPayments.length ? (
                  userPayments.map((payment) => {
                    const project = projects.find((item) => item.id === payment.projectId);
                    return (
                      <div key={payment.id} className="rounded-3xl bg-white/5 p-4">
                        <p className="font-semibold">{project?.title || "Project payout"}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          Rs {Number(payment.amount || 0).toLocaleString("en-IN")} · {payment.status}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                          {payment.provider}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No payouts have been recorded yet.</p>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Your project applications</h2>
              <div className="mt-5 space-y-3">
                {myProjectApplications.length ? (
                  myProjectApplications.map((application) => {
                    const project = projects.find((item) => item.id === application.projectId);
                    return (
                      <div key={application.id} className="rounded-3xl bg-white/5 p-4">
                        <p className="font-semibold">{project?.title || "Project"}</p>
                        <p className="mt-1 text-sm text-slate-300">{application.status}</p>
                        {application.coverLetter ? <p className="mt-2 text-sm text-slate-400">{application.coverLetter}</p> : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No project applications yet.</p>
                )}
              </div>
            </div>
            <ProjectChatPanel
              currentUser={currentUser}
              projects={projects}
              users={users}
              messages={messages}
              sending={submitting}
              onSendMessage={sendProjectMessage}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Posted Jobs" value={userProjects.length} accent="#f59e0b" />
              <StatCard
                label="Active Jobs"
                value={userProjects.filter((project) => project.status === "In Progress").length}
                accent="#14b8a6"
              />
              <StatCard
                label="Completed Jobs"
                value={userProjects.filter((project) => project.status === "Completed").length}
                accent="#fb7185"
              />
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Posted projects</h2>
              <div className="mt-5 grid gap-4">
                {userProjects.map((project) => (
                  <div key={project.id} className="space-y-3">
                    <ProjectCard project={project} />
                    <div className="rounded-[1.5rem] bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-300">
                            Payment status: {project.paymentStatus || (project.status === "Paid" ? "paid" : "unpaid")}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                            Suggested payout: Rs {getSuggestedPaymentAmount(project).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.status === "In Progress" ? (
                            <button
                              onClick={() => updateProjectStatus(project.id, "Completed")}
                              disabled={submitting}
                              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                            >
                              Mark Complete
                            </button>
                          ) : null}
                          {project.freelancerId && project.paymentStatus !== "paid" && (project.status === "Completed" || project.status === "Paid") ? (
                            <button
                              onClick={() => releaseProjectPayment(project.id, getSuggestedPaymentAmount(project))}
                              disabled={submitting}
                              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                            >
                              {submitting ? "Processing..." : "Pay Freelancer"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Completed Projects</h2>
              <div className="mt-5 space-y-4">
                {userProjects.filter((p) => p.status === "Completed" || p.status === "Paid").length ? (
                  userProjects
                    .filter((p) => p.status === "Completed" || p.status === "Paid")
                    .map((project) => {
                      const freelancer = users.find((u) => u.id === project.freelancerId);
                      const isReviewed = reviews.some(
                        (r) => r.projectId === project.id && r.clientId === currentUser.id
                      );
                      return (
                        <div key={project.id} className="rounded-[1.5rem] bg-white/5 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{project.title}</p>
                              <p className="mt-1 text-sm text-slate-300">
                                Freelancer: {freelancer?.name || "Unknown"}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                Completed at: {new Date(project.completedAt || project.updatedAt).toLocaleDateString("en-IN")}
                              </p>
                            </div>
                            {!isReviewed ? (
                              <button
                                onClick={() => setReviewProject({ project, freelancer })}
                                disabled={submitting}
                                className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-60 transition"
                              >
                                Give Review
                              </button>
                            ) : (
                              <span className="rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300">
                                Reviewed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-sm text-slate-400">No completed projects yet.</p>
                )}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Applicants</h2>
              <div className="mt-5 space-y-4">
                {userProjects.some((project) => projectApplications.some((application) => application.projectId === project.id)) ? (
                  userProjects.map((project) => {
                    const applicants = projectApplications.filter((application) => application.projectId === project.id);

                    if (!applicants.length) {
                      return null;
                    }

                    return (
                      <div key={project.id} className="rounded-3xl bg-white/5 p-4">
                        <p className="font-semibold">{project.title}</p>
                        <div className="mt-4 space-y-3">
                          {applicants.map((application) => {
                            const freelancer = application.freelancer || users.find((user) => user.id === application.freelancerId);
                            return (
                              <div key={application.id} className="rounded-2xl bg-slate-950/40 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="font-medium">{freelancer?.name || "Freelancer"}</p>
                                    <p className="mt-1 text-sm text-slate-400">{application.status}</p>
                                    {typeof application.matchPercentage === "number" ? (
                                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-teal-300">
                                        Match {application.matchPercentage}%
                                      </p>
                                    ) : null}
                                  </div>
                                  {application.status !== "Accepted" ? (
                                    <button
                                      onClick={() => hireFreelancer(project.id, application.freelancerId)}
                                      disabled={submitting}
                                      className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                                    >
                                      {submitting ? "Hiring..." : "Hire"}
                                    </button>
                                  ) : (
                                    <span className="rounded-full bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200">
                                      Hired
                                    </span>
                                  )}
                                </div>
                                {application.coverLetter ? (
                                  <p className="mt-3 text-sm text-slate-300">{application.coverLetter}</p>
                                ) : null}
                                {application.matchedSkills?.length ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {application.matchedSkills.map((skill) => (
                                      <span
                                        key={`${application.id}-${skill}`}
                                        className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)
                ) : (
                  <p className="text-sm text-slate-400">No applicants yet for your posted projects.</p>
                )}
              </div>
            </div>
            <ProjectChatPanel
              currentUser={currentUser}
              projects={projects}
              users={users}
              messages={messages}
              sending={submitting}
              onSendMessage={sendProjectMessage}
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Strong internship candidates</h2>
              <div className="mt-5 space-y-4">
                {matchedInternships.slice(0, 3).map((internship) => (
                  <div key={internship.id} className="rounded-3xl bg-white/5 p-4">
                    <p className="font-semibold">{internship.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{internship.company}</p>
                    <p className="mt-3 text-sm text-slate-300">{internship.applicantsCount} applicants</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
              <h2 className="text-2xl font-semibold">Payout history</h2>
              <div className="mt-5 space-y-3">
                {userPayments.length ? (
                  userPayments.map((payment) => {
                    const project = projects.find((item) => item.id === payment.projectId);
                    return (
                      <div key={payment.id} className="rounded-3xl bg-white/5 p-4">
                        <p className="font-semibold">{project?.title || "Project payout"}</p>
                        <p className="mt-1 text-sm text-slate-300">
                          Rs {Number(payment.amount || 0).toLocaleString("en-IN")} · {payment.status}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">No freelancer payouts yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {reviewProject && (
        <ReviewModal
          project={reviewProject.project}
          freelancer={reviewProject.freelancer}
          submitting={submitting}
          onClose={() => setReviewProject(null)}
          onSubmit={async (projectId, freelancerId, rating, reviewText) => {
            try {
              await submitProjectReview(projectId, freelancerId, rating, reviewText);
              setReviewProject(null);
            } catch (err) {
               // errors handle by AppContext optionally
            }
          }}
        />
      )}
    </section>
  );
}
