export default function InternshipModal({
  internship,
  isOpen,
  onClose,
  onConfirm,
  submitting,
  currentUser,
  alreadyApplied,
  matchPercentage
}) {
  if (!isOpen || !internship) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900 p-6 text-white shadow-panel">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-teal-300">{internship.company}</p>
            <h2 className="mt-2 text-3xl font-semibold">{internship.role || internship.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full bg-white/5 px-3 py-2 text-sm text-slate-300">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Salary</p>
            <p className="mt-2 text-lg font-semibold">{internship.salary}</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applicants</p>
            <p className="mt-2 text-lg font-semibold">{internship.applicantsCount}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-300">Description</p>
          <p className="mt-2 leading-7 text-slate-100">{internship.description}</p>
        </div>

        <div className="mt-6">
          <p className="text-sm text-slate-300">Skills required</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {internship.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-teal-500/10 px-3 py-1 text-xs text-teal-200">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-white/5 p-4">
          <p className="text-sm text-slate-300">Your match</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-2xl font-semibold">{matchPercentage}%</p>
            <div className="h-2 flex-1 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-amber-400" style={{ width: `${matchPercentage}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {currentUser ? `Applying as ${currentUser.name}` : "Login is required before applying"}
          </p>
          <button
            onClick={onConfirm}
            disabled={!currentUser || alreadyApplied || submitting}
            className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alreadyApplied ? "Already Applied" : submitting ? "Applying..." : "Confirm Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
