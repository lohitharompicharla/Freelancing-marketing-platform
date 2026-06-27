import { useMemo, useState } from "react";
import LoadingBlock from "../components/LoadingBlock";
import { useApp } from "../context/AppContext";

const formatTimestamp = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });

export default function ChatPage() {
  const { currentUser, users, projects, chats, messages, sendProjectMessage, loading, submitting, error } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [draft, setDraft] = useState("");

  const conversations = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return chats
      .map((chat) => {
        const project = projects.find((item) => item.id === chat.projectId);
        if (!project) {
          return null;
        }
        const conversationMessages = messages.filter((message) => message.projectId === project.id);
        const otherUserId = project.clientId === currentUser.id ? project.freelancerId : project.clientId;
        const otherUser = users.find((user) => user.id === otherUserId);
        return {
          chat,
          project,
          otherUser,
          count: conversationMessages.length,
          lastMessage: conversationMessages[conversationMessages.length - 1] || null,
          lastActivity: chat.lastMessageAt || conversationMessages[conversationMessages.length - 1]?.createdAt
        };
      })
      .filter(Boolean)
      .sort((left, right) => new Date(right.lastActivity || 0).getTime() - new Date(left.lastActivity || 0).getTime());
  }, [chats, currentUser, messages, projects, users]);

  const activeProjectId = selectedProjectId || conversations[0]?.project.id || "";
  const activeConversation = conversations.find((conversation) => conversation.project.id === activeProjectId) || null;
  const conversationMessages = messages.filter((message) => message.projectId === activeProjectId);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!activeProjectId || !draft.trim()) {
      return;
    }
    await sendProjectMessage(activeProjectId, draft);
    setDraft("");
  };

  if (loading || !currentUser) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Loading conversations..." />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-panel">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Project Chat</p>
        <h1 className="mt-2 text-4xl font-semibold">Client and freelancer conversations</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Use project-based chat to discuss delivery updates, clarify requirements, and keep all conversation history in one place.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 shadow-panel">
          <h2 className="px-2 py-2 text-xl font-semibold">Conversations</h2>
          <div className="mt-3 space-y-3">
            {conversations.length ? (
              conversations.map((conversation) => (
                <button
                  key={conversation.project.id}
                  onClick={() => setSelectedProjectId(conversation.project.id)}
                  className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                    activeProjectId === conversation.project.id
                      ? "border-teal-400 bg-teal-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{conversation.project.title}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {conversation.otherUser?.name || "Project member"} · {conversation.otherUser?.role || "Participant"}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{conversation.count}</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-300">
                    {conversation.lastMessage?.text || "No messages yet. Start the conversation."}
                  </p>
                </button>
              ))
            ) : (
              <p className="rounded-3xl bg-white/5 p-4 text-sm text-slate-400">
                No active project chats yet. A chat becomes available once a project has both a client and a freelancer.
              </p>
            )}
          </div>
        </aside>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
          {activeConversation ? (
            <>
              <div className="border-b border-white/10 pb-4">
                <p className="text-sm font-medium text-teal-300">{activeConversation.project.category}</p>
                <h2 className="mt-1 text-2xl font-semibold">{activeConversation.project.title}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Chatting with {activeConversation.otherUser?.name || "project member"}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                {conversationMessages.length ? (
                  conversationMessages.map((message) => {
                    const mine = message.senderId === currentUser.id;
                    const sender = users.find((user) => user.id === message.senderId);
                    return (
                      <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 ${mine ? "bg-teal-500 text-slate-950" : "bg-white/5 text-white"}`}>
                          <p className={`text-xs ${mine ? "text-slate-900/75" : "text-slate-400"}`}>
                            {sender?.name || "User"} · {formatTimestamp(message.createdAt)}
                          </p>
                          <p className="mt-2 text-sm leading-6">{message.text}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-3xl bg-white/5 p-4 text-sm text-slate-400">
                    No messages yet. Send the first message for this project.
                  </p>
                )}
              </div>

              <form onSubmit={handleSend} className="mt-6 space-y-3">
                <textarea
                  rows={4}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message here..."
                  className="w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">Messages are visible to both the assigned client and freelancer.</p>
                  <button
                    type="submit"
                    disabled={submitting || !draft.trim()}
                    className="rounded-full bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="rounded-[1.5rem] bg-white/5 p-6 text-slate-300">Choose a conversation to start chatting.</div>
          )}

          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
