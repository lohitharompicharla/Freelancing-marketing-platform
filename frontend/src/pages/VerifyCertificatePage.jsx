import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingBlock from "../components/LoadingBlock";

export default function VerifyCertificatePage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/verify/${id}`);
        if (!response.ok) {
          throw new Error("Invalid or unfound Certificate ID");
        }
        const data = await response.json();
        setCertificate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCertificate();
    } else {
      setLoading(false);
      setError("No certificate ID provided.");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingBlock label="Verifying Certificate Authenticity..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-panel text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Verification Center</p>
        <h1 className="mt-2 text-3xl font-semibold">Credential Validation</h1>
        
        {error ? (
          <div className="mt-8 rounded-2xl bg-rose-500/10 p-6 border border-rose-500/20">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">Verification Failed</h2>
            <p className="mt-2 text-rose-300">{error}</p>
            <p className="mt-2 text-sm text-slate-400">Please ensure you have entered the exact Certificate ID.</p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl bg-emerald-500/10 p-6 border border-emerald-500/20 text-left">
            <div className="flex items-center gap-4 border-b border-emerald-500/20 pb-6 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Verified Authenticity</h2>
                <p className="text-sm text-emerald-300">This credential is valid and recognized by FreelanceFlow.</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">Recipient Name</dt>
                <dd className="mt-1 text-lg font-semibold text-white">{certificate.userName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">Course Completed</dt>
                <dd className="mt-1 text-lg font-semibold text-white">{certificate.courseName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">Assessment Score</dt>
                <dd className="mt-1 text-lg font-semibold text-white">{certificate.score}%</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">Issue Date</dt>
                <dd className="mt-1 text-lg font-semibold text-white">
                  {new Date(certificate.issuedAt).toLocaleDateString("en-IN", {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-slate-400 uppercase tracking-wider">Certificate ID</dt>
                <dd className="mt-1 font-mono text-sm text-slate-300 bg-black/20 p-2 rounded break-all">
                  {certificate.certificateNumber}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link to="/" className="text-sm font-semibold text-teal-400 hover:text-teal-300">
            &larr; Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
