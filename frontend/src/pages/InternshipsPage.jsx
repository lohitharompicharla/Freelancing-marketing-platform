import { useMemo, useState } from "react";
import InternshipModal from "../components/InternshipModal";
import LoadingBlock from "../components/LoadingBlock";
import { useApp } from "../context/AppContext";

const calculateMatchPercentage = (skills = [], internshipSkills = []) => {
  if (!internshipSkills.length) {
    return 0;
  }

  const commonSkills = internshipSkills.filter((skill) => skills.includes(skill)).length;
  return Math.round((commonSkills / internshipSkills.length) * 100);
};

export default function InternshipsPage() {
  const { users, internships, applications, currentUser, getInternshipDetails, applyToInternship, loading, submitting } =
    useApp();
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const eligibleFreelancers = users.filter(
    (user) => user.role === "freelancer" && (user.completedProjects || 0) >= 2
  );

  const appliedIds = useMemo(
    () =>
      new Set(
        applications
          .filter((application) => application.userId === currentUser?.id)
          .map((application) => application.internshipId)
      ),
    [applications, currentUser]
  );

  const openInternshipDetails = async (internshipId) => {
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const details = await getInternshipDetails(internshipId);
      setSelectedInternship(details);
    } catch (error) {
      setDetailsError(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Loading internships..." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Eligibility Engine</p>
          <h1 className="mt-2 text-4xl font-semibold">Internship-ready talent</h1>
          <div className="mt-5 space-y-4">
            {eligibleFreelancers.map((user) => (
              <div key={user.id} className="rounded-3xl bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xl font-semibold">{user.name}</p>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                    Internship Eligible
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  Rating {user.rating} · {user.completedProjects} completed projects
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {internships.length === 0 ? (
            <p className="text-sm text-slate-400">No internships available.</p>
          ) : (
            internships.map((internship) => {
              const matchPercentage = calculateMatchPercentage(currentUser?.skills || [], internship.skills);
              return (
                <article key={internship.id} className="rounded-[2rem] border border-white/10 bg-slate-50 p-6 text-slate-900 shadow-panel">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-teal-700">{internship.company}</p>
                      <h2 className="mt-1 text-2xl font-semibold">{internship.title}</h2>
                    </div>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700">{internship.salary}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {internship.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">{internship.applicantsCount} applicants</p>
                      <p className="mt-1 text-sm text-slate-500">{currentUser ? `${matchPercentage}% match` : "Login to see your match"}</p>
                    </div>
                    <button
                      onClick={() => openInternshipDetails(internship.id)}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Apply Now
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {detailsError ? <p className="text-sm text-rose-300">{detailsError}</p> : null}

      <InternshipModal
        internship={selectedInternship}
        isOpen={Boolean(selectedInternship) || detailsLoading}
        onClose={() => setSelectedInternship(null)}
        onConfirm={async () => {
          if (!selectedInternship) {
            return;
          }
          await applyToInternship(selectedInternship.id);
          setSelectedInternship((current) =>
            current ? { ...current, applicantsCount: (current.applicantsCount || 0) + 1 } : current
          );
        }}
        submitting={submitting || detailsLoading}
        currentUser={currentUser}
        alreadyApplied={selectedInternship ? appliedIds.has(selectedInternship.id) : false}
        matchPercentage={selectedInternship ? calculateMatchPercentage(currentUser?.skills || [], selectedInternship.skills) : 0}
      />
    </section>
  );
}
