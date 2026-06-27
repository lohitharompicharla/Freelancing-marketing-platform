import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, BookOpen, Clock, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LearningListingPage() {
  const { fetchLearningPosts } = useApp();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    search: "",
    domain: "",
    level: "",
    provider: ""
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const domains = ["Web Dev", "Design", "Data Science", "AI/ML", "Cloud Computing", "Programming", "Marketing"];
  const levels = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    loadPosts();
  }, [page, filters.domain, filters.level, filters.provider]);

  const loadPosts = async () => {
    setLoading(true);
    const result = await fetchLearningPosts({ ...filters, page, limit: 9 });
    setPosts(result.posts || []);
    setTotalPages(result.totalPages || 1);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPosts();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-400" /> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => handleFilterChange("domain", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Domains</option>
                  {domains.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Level</label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">All Levels</option>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Coursera"
                  value={filters.provider}
                  onChange={(e) => handleFilterChange("provider", e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">Discover Top Courses</h1>
            <p className="text-slate-400 mt-2">Curated learning paths to accelerate your freelance career.</p>
          </div>

          <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or tags..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-lg"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium transition-colors">
              Search
            </button>
          </form>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
              <p className="text-slate-400">Try adjusting your search or filters.</p>
              <button
                onClick={() => { setFilters({ search: "", domain: "", level: "", provider: "" }); setPage(1); }}
                className="mt-6 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {posts.map(post => (
                <div key={post._id || post.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:shadow-indigo-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-medium rounded-full">
                      {post.domain}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {post.provider}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-3 mb-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      <span>{post.level}</span>
                    </div>
                    {post.duration && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{post.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags?.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                        #{tag}
                      </span>
                    ))}
                    {(post.tags?.length || 0) > 3 && (
                      <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                        +{(post.tags.length - 3)} more
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                    <Link
                      to={`/learning/${post._id || post.id}`}
                      className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors"
                    >
                      View Details &rarr;
                    </Link>
                    <a
                      href={post.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Apply Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <span className="text-slate-400 text-sm">
                Page <span className="text-white font-medium">{page}</span> of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
