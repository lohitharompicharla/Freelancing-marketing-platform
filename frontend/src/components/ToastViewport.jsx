export default function ToastViewport({ toasts }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-panel ${
            toast.type === "error"
              ? "border-rose-400/30 bg-rose-950/90 text-rose-100"
              : "border-teal-400/30 bg-slate-900/95 text-slate-100"
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
