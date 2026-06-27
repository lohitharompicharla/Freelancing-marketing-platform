export default function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-panel">
      <div className="mb-3 h-2 w-14 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
