import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

const skillOptions = ["React", "Node.js", "MongoDB", "Figma", "Branding", "JavaScript", "Tailwind CSS"];

const defaultForm = {
  title: "",
  description: "",
  category: "Web Dev",
  requiredSkills: [],
  budgetRange: "",
  deadline: "",
  experienceLevel: "Intermediate",
  fileName: ""
};

export default function SmartProjectForm() {
  const { demoMode, createProject, currentUser, submitting, token } = useApp();
  const [form, setForm] = useState(defaultForm);
  const [rawFile, setRawFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState({ skills: [], budgetRange: "" });
  const [message, setMessage] = useState("");

  const isValid = useMemo(
    () => form.title && form.description && form.budgetRange && form.deadline && form.requiredSkills.length > 0,
    [form]
  );

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSkillToggle = (skill) => {
    setForm((current) => ({
      ...current,
      requiredSkills: current.requiredSkills.includes(skill)
        ? current.requiredSkills.filter((item) => item !== skill)
        : [...current.requiredSkills, skill]
    }));
  };

  const fetchSuggestions = async () => {
    try {
      const result = demoMode
        ? {
            skills:
              form.category === "Design"
                ? ["Figma", "UI Design", "Branding"]
                : form.description.toLowerCase().includes("api")
                  ? ["Node.js", "Express", "MongoDB"]
                  : ["React", "Node.js", "MongoDB"],
            budgetRange: form.category === "App Dev" ? "Rs 60,000 - Rs 180,000" : "Rs 40,000 - Rs 120,000"
          }
        : await api.getSuggestions({
            description: form.description,
            category: form.category
          });

      setSuggestions(result);

      if (!form.budgetRange && result.budgetRange) {
        updateField("budgetRange", result.budgetRange);
      }

      if (!form.requiredSkills.length && result.skills?.length) {
        updateField("requiredSkills", result.skills);
      }
    } catch (_error) {
      setSuggestions({
        skills: form.category === "Design" ? ["Figma", "UI Design", "Branding"] : ["React", "Node.js", "MongoDB"],
        budgetRange: form.category === "App Dev" ? "Rs 60,000 - Rs 180,000" : "Rs 40,000 - Rs 120,000"
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValid) {
      setMessage("Please complete all required fields before publishing.");
      return;
    }

    try {
      setIsUploading(true);
      let uploadedFileName = form.fileName;

      if (rawFile) {
        if (demoMode) {
          uploadedFileName = rawFile.name;
        } else {
          const formData = new FormData();
          formData.append("file", rawFile);
          const uploadResult = await api.uploadProjectFile(formData, token);
          uploadedFileName = uploadResult.fileName;
        }
      }

      await createProject({ ...form, fileName: uploadedFileName });
      setMessage("Project published successfully. It is now visible in dashboard and projects.");
      setForm(defaultForm);
      setRawFile(null);
      setSuggestions({ skills: [], budgetRange: "" });
    } catch (error) {
      setMessage(error.message || "Failed to publish project");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 text-white shadow-panel">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Smart Project Posting</p>
          <h2 className="mt-2 text-2xl font-semibold">Guided project brief</h2>
        </div>
        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={isUploading || submitting}
          className="rounded-full bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          Suggest skills + budget
        </button>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Project Title</span>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            placeholder="Example: SaaS dashboard redesign"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Project Description</span>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows="4"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            placeholder="Describe goals, deliverables, target users, and technical expectations."
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-slate-300">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          >
            {["Web Dev", "App Dev", "Design", "Marketing"].map((option) => (
              <option key={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm text-slate-300">Experience Level</span>
          <select
            value={form.experienceLevel}
            onChange={(event) => updateField("experienceLevel", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          >
            {["Beginner", "Intermediate", "Expert"].map((option) => (
              <option key={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm text-slate-300">Budget Range</span>
          <input
            value={form.budgetRange}
            onChange={(event) => updateField("budgetRange", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
            placeholder="Rs 40,000 - Rs 120,000"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm text-slate-300">Deadline</span>
          <input
            type="date"
            value={form.deadline}
            onChange={(event) => updateField("deadline", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Optional file upload</span>
          <div className="flex flex-col gap-2">
            <input
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setRawFile(file);
              }}
              className="w-full rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-slate-300 outline-none file:mr-4 file:rounded-full file:border-0 file:bg-teal-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-teal-400"
              accept=".pdf,.doc,.docx"
            />
            {rawFile ? <p className="text-xs text-teal-300">Selected: {rawFile.name}</p> : null}
          </div>
        </label>

        <div className="md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">Required Skills</span>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => {
              const active = form.requiredSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    active ? "bg-teal-500 text-slate-950" : "bg-white/5 text-slate-200"
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-2 rounded-3xl bg-white/5 p-4">
          <p className="text-sm text-slate-300">AI suggestions</p>
          <p className="mt-2 text-sm text-slate-100">
            Suggested skills: {suggestions.skills?.length ? suggestions.skills.join(", ") : "Add a description first"}
          </p>
          <p className="mt-1 text-sm text-slate-100">
            Suggested budget: {suggestions.budgetRange || "Choose a category to estimate budget"}
          </p>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-200">{message}</p>
          <button
            type="submit"
            disabled={submitting || !currentUser || !isValid}
            className={`rounded-full px-5 py-3 font-semibold text-slate-950 transition-all ${
              !isValid ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60' : 'bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60'
            }`}
          >
            {submitting ? "Publishing..." : "Publish Project"}
          </button>
        </div>
        {!currentUser ? (
          <p className="md:col-span-2 text-sm text-slate-400">Login as a client to publish projects.</p>
        ) : null}
      </form>
    </section>
  );
}
