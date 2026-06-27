import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function GlobalSearch({ isOpen, onClose }) {
  const { projects, users } = useApp();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return { projects: [], freelancers: [], clients: [] };

    const lowerQuery = query.toLowerCase();
    
    const matchedProjects = projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery) ||
        p.category?.toLowerCase().includes(lowerQuery) ||
        p.requiredSkills?.some((skill) => skill.toLowerCase().includes(lowerQuery))
    ).slice(0, 5);

    const matchedFreelancers = users.filter(
      (u) =>
        u.role === "freelancer" &&
        (u.name?.toLowerCase().includes(lowerQuery) ||
         u.skills?.some((skill) => skill.toLowerCase().includes(lowerQuery)))
    ).slice(0, 5);

    const matchedClients = users.filter(
      (u) =>
        u.role === "client" &&
        u.name?.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);

    return { projects: matchedProjects, freelancers: matchedFreelancers, clients: matchedClients };
  }, [query, projects, users]);

  if (!isOpen) return null;

  const hasResults =
    searchResults.projects.length > 0 || searchResults.freelancers.length > 0 || searchResults.clients.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-5 py-4 border-b border-white/10">
          <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-lg text-white outline-none placeholder-slate-400"
            placeholder="Search projects, freelancers, or clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="text-xs px-2 py-1 bg-white/10 rounded font-medium text-slate-300 hover:bg-white/20 ml-3">
            ESC
          </button>
        </div>

        {query.trim() && (
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {!hasResults ? (
              <p className="p-4 text-center text-slate-400 tracking-wide">No results found for "{query}"</p>
            ) : (
              <div className="space-y-6 p-2">
                {searchResults.projects.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400 mb-3 px-2">Projects</h3>
                    {searchResults.projects.map(p => (
                      <Link 
                        key={p.id} 
                        to={`/marketplace?projectId=${p.id}`} 
                        onClick={onClose}
                        className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5 mb-2"
                      >
                        <p className="font-semibold text-slate-100">{p.title}</p>
                        <p className="text-sm text-slate-400 line-clamp-1 mt-1.5">{p.description}</p>
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.freelancers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400 mb-3 px-2">Freelancers</h3>
                    {searchResults.freelancers.map(f => (
                      <Link 
                        key={f.id} 
                        to={`/marketplace?freelancerId=${f.id}`} 
                        onClick={onClose}
                        className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5 mb-2"
                      >
                        <p className="font-semibold text-slate-100">{f.name}</p>
                        {f.skills?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {f.skills.slice(0, 4).map(skill => (
                              <span key={skill} className="px-2 py-0.5 rounded text-xs font-medium bg-amber-400/10 text-amber-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {searchResults.clients.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 mb-3 px-2">Clients</h3>
                    {searchResults.clients.map(c => (
                      <div key={c.id} className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/5 mb-2 cursor-default flex items-center justify-between">
                        <p className="font-semibold text-slate-100">{c.name}</p>
                        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold bg-slate-800 px-2 py-1 rounded">Client</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
