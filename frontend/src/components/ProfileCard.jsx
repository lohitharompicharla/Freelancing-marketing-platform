export default function ProfileCard({ user, matchPercentage }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 text-white shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">{user.name}</h3>
          <p className="text-sm text-slate-400">{user.experienceLevel || user.role}</p>
        </div>
        {typeof matchPercentage === "number" ? (
          <span className="rounded-full bg-teal-500/15 px-3 py-1 text-sm font-medium text-teal-300">
            {matchPercentage}% match
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(user.skills || []).map((skill) => (
          <span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-300">
        <span>Rating: {user.rating || "New"}</span>
        <span>Completed: {user.completedProjects || 0}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(user.badges || []).map((badge) => (
          <span key={badge} className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
            {badge}
          </span>
        ))}
      </div>
    </article>
  );
}
