import { useEffect, useState } from "react";

export default function AuthForm({ mode, onSubmit, onUploadResume, resumePreview, loading, error }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "freelancer",
    skills: "React, Node.js"
  });
  const [useResumeAutofill, setUseResumeAutofill] = useState(true);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (mode !== "register" || !resumePreview?.parsedResume || !useResumeAutofill) {
      return;
    }

    setForm((current) => ({
      ...current,
      name: resumePreview.parsedResume.name || current.name,
      email: current.email || resumePreview.parsedResume.email || "",
      skills: (resumePreview.parsedResume.skills || []).join(", ") || current.skills
    }));
  }, [mode, resumePreview, useResumeAutofill]);

  const handleChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleResumeFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    try {
      await onUploadResume(file);
    } catch (nextError) {
      setUploadError(nextError.message);
    }
  };

  const submit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
      skills: form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      resumeData: resumePreview?.parsedResume || null,
      resumeUrl: resumePreview?.resumeUrl || "",
      resumeOriginalName: resumePreview?.resumeOriginalName || ""
    });
  };

  const disableManualSkills = mode === "register" && Boolean(resumePreview?.parsedResume) && useResumeAutofill;
  const parsedResume = resumePreview?.parsedResume;

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" ? (
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Full Name</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            disabled={Boolean(resumePreview?.parsedResume?.name) && useResumeAutofill}
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Email</span>
        <input
          type="email"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={form.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">Password</span>
        <input
          type="password"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          value={form.password}
          onChange={(event) => handleChange("password", event.target.value)}
        />
      </label>

      {mode === "register" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Role</span>
            <select
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              value={form.role}
              onChange={(event) => handleChange("role", event.target.value)}
            >
              <option value="freelancer" className="text-slate-900">
                Freelancer
              </option>
              <option value="client" className="text-slate-900">
                Client
              </option>
              <option value="admin" className="text-slate-900">
                Admin
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Resume Upload</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-white outline-none"
              onChange={handleResumeFile}
            />
          </label>

          {parsedResume ? (
            <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-200">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">Parsed resume preview</p>
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={useResumeAutofill}
                    onChange={(event) => setUseResumeAutofill(event.target.checked)}
                  />
                  Use resume autofill
                </label>
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-teal-300">
                {resumePreview.resumeOriginalName || "Resume uploaded"}
              </p>
              <p className="mt-3 text-slate-300">Skills: {(parsedResume.skills || []).join(", ") || "None found"}</p>
              <p className="mt-2 text-slate-300">Projects: {(parsedResume.projects || []).join(" | ") || "None found"}</p>
              <p className="mt-2 text-slate-300">Education: {(parsedResume.education || []).join(" | ") || "None found"}</p>
              <p className="mt-2 text-slate-300">Experience: {(parsedResume.experience || []).join(" | ") || "None found"}</p>
              <p className="mt-2 text-slate-300">
                Suggested level: {parsedResume.experienceLevel || "Beginner"}
                {parsedResume.phone ? ` | Phone: ${parsedResume.phone}` : ""}
              </p>
            </div>
          ) : null}

          {uploadError ? <p className="text-sm text-rose-300">{uploadError}</p> : null}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Skills</span>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              value={form.skills}
              onChange={(event) => handleChange("skills", event.target.value)}
              disabled={disableManualSkills}
            />
          </label>
        </>
      ) : null}

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <button className="w-full rounded-full bg-teal-500 px-5 py-3 font-semibold text-slate-950" disabled={loading}>
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
      </button>
    </form>
  );
}
