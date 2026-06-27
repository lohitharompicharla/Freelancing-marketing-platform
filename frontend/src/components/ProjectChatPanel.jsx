import { useMemo, useState } from "react";

export default function ProjectChatPanel({ currentUser, projects, users, messages, sending, onSendMessage }) {
  const [drafts, setDrafts] = useState({});

  const accessibleProjects = useMemo(
    () =>
      projects.filter((project) =>
        currentUser.role === "client"
          ? project.clientId === currentUser.id && project.freelancerId
          : project.freelancerId === currentUser.id
      ),
    [currentUser.id, currentUser.role, projects]
  );

  const usersById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users]
  );

  const updateDraft = (projectId, value) => {
    setDrafts((current) => ({ ...current, [projectId]: value }));
  };

  const submitMessage = async (projectId) => {
    const text = String(drafts[projectId] || "").trim();
    if (!text) {
      return;
    }

    await onSendMessage(projectId, text);
    setDrafts((current) => ({ ...current, [projectId]: "" }));
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
      <h2 className="text-2xl font-semibold">
        {currentUser.role === "client" ? "Client conversations" : "Project chat"}
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {currentUser.role === "client"
          ? "Messages sent by freelancers will appear here for each assigned project."
          : "Send updates to your client directly from the project thread."}
      </p>

      <div className="mt-5 space-y-4">
        {accessibleProjects.length ? (
          accessibleProjects.map((project) => {
            const projectMessages = messages.filter((message) => message.projectId === project.id);
            const counterpartId = currentUser.role === "client" ? project.freelancerId : project.clientId;
            const counterpart = usersById[counterpartId];

            return (
              <div key={project.id} className="rounded-3xl bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {currentUser.role === "client" ? "Freelancer" : "Client"}: {counterpart?.name || "Unknown user"}
                    </p>
                  </div>
                  <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-200">
                    {project.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {projectMessages.length ? (
                    projectMessages.map((message) => {
                      const isOwnMessage = message.senderId === currentUser.id;
                      return (
                        <div
                          key={message.id}
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            isOwnMessage ? "bg-teal-500/15 text-teal-50" : "bg-white/10 text-slate-100"
                          }`}
                        >
                          <p className="font-medium">{usersById[message.senderId]?.name || "Unknown user"}</p>
                          <p className="mt-1">{message.text}</p>
                          <p className="mt-2 text-xs text-slate-400">
                            {new Date(message.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-400">No messages yet. Start the conversation here.</p>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    className="flex-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none"
                    placeholder="Type a project update..."
                    value={drafts[project.id] || ""}
                    onChange={(event) => updateDraft(project.id, event.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => submitMessage(project.id)}
                    disabled={sending}
                    className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-400">
            {currentUser.role === "client"
              ? "Assigned projects will appear here once you hire a freelancer."
              : "You will see chat threads here when you are assigned to a project."}
          </p>
        )}
      </div>
    </div>
  );
}
