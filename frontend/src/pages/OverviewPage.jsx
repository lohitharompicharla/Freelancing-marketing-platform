import StatCard from "../components/StatCard";
import LoadingBlock from "../components/LoadingBlock";
import { useApp } from "../context/AppContext";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function OverviewPage() {
  const { users, internships, courses, projects, recommendedCertifications, fetchLearningRecommendations, loading, error, demoMode } = useApp();
  const [learningRecommendations, setLearningRecommendations] = useState([]);

  useEffect(() => {
    const loadRecs = async () => {
      const recs = await fetchLearningRecommendations();
      setLearningRecommendations(recs || []);
    };
    if (!loading) {
      loadRecs();
    }
  }, [loading, fetchLearningRecommendations]);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingBlock label="Preparing FreelanceFlow..." />
      </section>
    );
  }

  const freelancers = users.filter((user) => user.role === "freelancer");
  const eligibleCount = freelancers.filter((user) => (user.completedProjects || 0) >= 2).length;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-hero-grid bg-slate-900/80 p-8 shadow-panel md:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-teal-300">Full Stack Freelancer Hub</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Smart projects, working internship applications, protected dashboards, and learning support in one system.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            FreelanceFlow now supports demo mode, live API mode, internship apply flows, real auth persistence, dynamic
            eligibility badges, and responsive dashboards.
          </p>
          <p className="mt-5 text-sm text-slate-400">
            Mode: {demoMode ? "Demo mode is active. Backend calls are disabled." : "Live API mode is active."}
          </p>
          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4 lg:px-8">
        <StatCard label="Freelancers" value={freelancers.length} accent="#14b8a6" />
        <StatCard label="Open Projects" value={projects.filter((item) => item.status === "Open").length} accent="#f59e0b" />
        <StatCard label="Courses" value={courses.length} accent="#38bdf8" />
        <StatCard label="Internship Eligible" value={eligibleCount} accent="#fb7185" />
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Core modules</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Internship apply modal with details, applicants count, and confirm action",
              "Auth with localStorage token handling and protected routes",
              "Demo mode switch for mock data without API calls",
              "Eligibility badges driven by completed projects",
              "Course completion with certificate cards",
              "Skill-based match percentages for internships"
            ].map((item) => (
              <div key={item} className="rounded-3xl bg-white/5 p-4 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-panel">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-300">Internship spotlight</p>
          <div className="mt-5 space-y-4">
            {internships.slice(0, 2).map((internship) => (
              <div key={internship.id} className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-teal-300">{internship.company}</p>
                <h3 className="mt-2 text-xl font-semibold">{internship.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{internship.salary}</p>
                <p className="mt-3 text-sm text-slate-300">{internship.applicantsCount} applicants</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Picks for Beginners */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Top Certification Picks for Beginners</h2>
          <Link to="/certifications" className="text-sm font-medium text-teal-400 hover:text-teal-300">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCertifications && recommendedCertifications.length > 0 ? (
            recommendedCertifications.map(cert => (
              <Link 
                key={cert.id || cert._id} 
                to={`/certifications/${cert.id || cert._id}`}
                className="bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10 transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">{cert.domain}</span>
                  <span className="text-xs text-slate-400 font-medium">{cert.provider}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">{cert.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{cert.description}</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 py-8 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
              Loading recommendations...
            </div>
          )}
        </div>
      </section>

      {/* Top Learning Picks for Beginners */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Top Learning Picks for Beginners</h2>
          <Link to="/learning" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">Explore Hub &rarr;</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningRecommendations && learningRecommendations.length > 0 ? (
            learningRecommendations.map(post => (
              <Link 
                key={post.id || post._id} 
                to={`/learning/${post.id || post._id}`}
                className="bg-slate-800/80 border border-slate-700/50 p-6 rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 transition-all flex flex-col group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{post.domain}</span>
                  <span className="text-xs text-slate-400 font-medium">{post.provider}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{post.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{post.description}</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-400 py-8 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
              Loading learning posts...
            </div>
          )}
        </div>
      </section>
    </>
  );
}
