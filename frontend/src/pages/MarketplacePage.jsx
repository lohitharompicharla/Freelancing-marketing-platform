import { useSearchParams } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import ProjectCard from "../components/ProjectCard";
import SmartProjectForm from "../components/SmartProjectForm";
import LoadingBlock from "../components/LoadingBlock";
import { useApp } from "../context/AppContext";

const calculateProjectMatch = (project, freelancer) => {
  const sharedSkills = project.requiredSkills.filter((skill) => freelancer.skills?.includes(skill)).length;
  const skillScore = project.requiredSkills.length ? (sharedSkills / project.requiredSkills.length) * 55 : 0;
  const experienceScore = freelancer.experienceLevel === project.experienceLevel ? 20 : 10;
  const completedProjectsScore = Math.min((freelancer.completedProjects || 0) * 5, 15);
  const ratingScore = Math.min((freelancer.rating || 0) * 2, 10);
  return Math.round(skillScore + experienceScore + completedProjectsScore + ratingScore);
};

export default function MarketplacePage() {
  const { users, projects, currentUser, projectApplications, applyToProject, loading, submitting } = useApp();
  const [searchParams] = useSearchParams();

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Loading marketplace..." />
      </section>
    );
  }

  const searchProjectId = searchParams.get("projectId");
  const searchFreelancerId = searchParams.get("freelancerId");

  const freelancers = users.filter((user) => user.role === "freelancer");
  const displayedProjects = searchProjectId ? projects.filter((p) => p.id === searchProjectId) : projects;
  const featuredProject = projects.find((project) => project.status === "Open") || projects[0] || { requiredSkills: [], experienceLevel: "" };
  
  const topMatches = searchFreelancerId
    ? freelancers
        .filter((user) => user.id === searchFreelancerId)
        .map((user) => ({ ...user, matchPercentage: calculateProjectMatch(featuredProject, user) }))
    : freelancers
        .map((user) => ({ ...user, matchPercentage: calculateProjectMatch(featuredProject, user) }))
        .sort((left, right) => right.matchPercentage - left.matchPercentage)
        .slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <SmartProjectForm />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Live projects</p>
            <h2 className="mt-2 text-3xl font-semibold">Open opportunities</h2>
          </div>
          <div className="grid gap-4">
            {displayedProjects.length > 0 ? (
              displayedProjects.map((project) => {
              const alreadyApplied = projectApplications.some(
                (application) => application.projectId === project.id && application.freelancerId === currentUser?.id
              );

              return (
                <div key={project.id} className="space-y-3">
                  <ProjectCard
                    project={project}
                    matchPercentage={
                      currentUser?.role === "freelancer" ? calculateProjectMatch(project, currentUser) : undefined
                    }
                  />
                  {currentUser?.role === "freelancer" && project.status === "Open" ? (
                    <div className="flex items-center justify-between rounded-[1.5rem] bg-white/5 p-4">
                      <p className="text-sm text-slate-300">
                        {alreadyApplied ? "Application already submitted" : "Interested in this project?"}
                      </p>
                      <button
                        onClick={() => applyToProject(project.id, "I would love to contribute to this project.")}
                        disabled={submitting || alreadyApplied}
                        className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                      >
                        {alreadyApplied ? "Applied" : submitting ? "Applying..." : "Apply to Project"}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })
            ) : (
              <p className="text-slate-400">No projects found for this search.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Skill-based allocation</p>
          <h2 className="mt-2 text-3xl font-semibold">Top freelancer matches</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Match scores combine skills, experience level, completed projects, and rating to recommend the strongest
            candidates for each brief.
          </p>
          <div className="mt-6 space-y-4">
            {topMatches.map((freelancer) => (
              <ProfileCard key={freelancer.id} user={freelancer} matchPercentage={freelancer.matchPercentage} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
