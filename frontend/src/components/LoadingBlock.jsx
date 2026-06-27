export default function LoadingBlock({ label = "Loading..." }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-10 text-center text-slate-300 shadow-panel">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-teal-400" />
      <p>{label}</p>
    </div>
  );
}
