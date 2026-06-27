import { useEffect, useState } from "react";

export default function ProfileEditor({ user, onSave, saving }) {
  const [form, setForm] = useState({
    name: "",
    experienceLevel: "Beginner",
    skills: "",
    portfolio: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm({
      name: user.name || "",
      experienceLevel: user.experienceLevel || "Beginner",
      skills: (user.skills || []).join(", "),
      portfolio: (user.portfolio || []).join(", ")
    });
  }, [user]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await onSave({
        name: form.name.trim(),
        experienceLevel: form.experienceLevel,
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean),
        portfolio: form.portfolio.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setMessage("Profile updated");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
      <h2 className="text-2xl font-semibold">Edit profile</h2>
      <div className="mt-5 grid gap-4">
        <label>
          <span className="mb-2 block text-sm text-slate-300">Name</span>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm text-slate-300">Experience level</span>
          <select
            value={form.experienceLevel}
            onChange={(event) => updateField("experienceLevel", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {["Beginner", "Intermediate", "Expert"].map((option) => (
              <option key={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-2 block text-sm text-slate-300">Skills</span>
          <input
            value={form.skills}
            onChange={(event) => updateField("skills", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="React, Node.js, MongoDB"
          />
        </label>
        <label>
          <span className="mb-2 block text-sm text-slate-300">Portfolio</span>
          <input
            value={form.portfolio}
            onChange={(event) => updateField("portfolio", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
            placeholder="Landing page, Dashboard, Brand kit"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-amber-200">{message}</p>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
