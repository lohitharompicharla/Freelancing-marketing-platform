import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { useApp } from "../context/AppContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const { login, register, uploadResume, resumePreview, submitting, error, demoMode } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const nextPath = location.state?.from || "/dashboard";

  const handleSubmit = async (payload) => {
    if (mode === "login") {
      await login(payload);
    } else {
      await register(payload);
    }

    navigate(nextPath, { replace: true });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-300">Authentication</p>
          <h1 className="mt-4 text-4xl font-semibold">Access the real workflow</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Login is required for protected routes, internship applications, and course certificates. Demo mode can
            still be used for offline exploration without backend calls.
          </p>
          <div className="mt-6 rounded-3xl bg-white/5 p-5 text-sm text-slate-300">
            <p>Demo credentials</p>
            <p className="mt-2">Freelancer: riya@example.com / password123</p>
            <p>Client: client@example.com / password123</p>
            <p>Admin: admin@example.com / password123</p>
            <p className="mt-3">Current mode: {demoMode ? "Demo data only" : "Live API mode"}</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900 p-8 shadow-panel">
          <div className="mb-6 flex gap-2 rounded-full bg-white/5 p-1">
            {["login", "register"].map((value) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
                  mode === value ? "bg-teal-500 text-slate-950" : "text-slate-300"
                }`}
              >
                {value === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>
          <AuthForm
            mode={mode}
            onSubmit={handleSubmit}
            onUploadResume={uploadResume}
            resumePreview={resumePreview}
            loading={submitting}
            error={error}
          />
        </div>
      </div>
    </section>
  );
}
