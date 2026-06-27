import { useState } from "react";

export default function ReviewModal({ project, freelancer, onClose, onSubmit, submitting }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!review.trim()) return;
    onSubmit(project.id, freelancer.id, rating, review);
  };

  if (!project || !freelancer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900 p-6 shadow-panel">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Review {freelancer.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">Project: {project.title}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${
                    star <= rating ? "text-amber-400" : "text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-amber-500/70">{rating} out of 5 stars</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Your Review</label>
            <textarea
              required
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-2xl bg-slate-950/50 p-4 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50"
              rows={4}
              placeholder="How was your experience working with this freelancer?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !review.trim()}
              className="rounded-full bg-amber-400 px-6 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
