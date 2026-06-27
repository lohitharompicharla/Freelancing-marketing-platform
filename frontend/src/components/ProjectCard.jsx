export default function ProjectCard({ project, matchPercentage }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 text-white shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">{project.category}</p>
          <h3 className="mt-2 text-xl font-semibold">{project.title}</h3>
        </div>
        <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-medium text-slate-200">{project.status}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.requiredSkills.map((skill) => (
          <span key={skill} className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <span>{project.budgetRange}</span>
        <span>Deadline: {project.deadline}</span>
      </div>
      {typeof matchPercentage === "number" ? (
        <div className="mt-4 rounded-2xl bg-white/5 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Match Percentage</span>
            <span className="text-lg font-semibold">{matchPercentage}%</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-amber-400" style={{ width: `${matchPercentage}%` }} />
          </div>
        </div>
      ) : null}
    </article>
  );
}
