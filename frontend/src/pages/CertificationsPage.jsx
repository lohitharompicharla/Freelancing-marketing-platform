import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { Search, ExternalLink, Award, Clock, Star } from "lucide-react";

export default function CertificationsPage() {
  const { certifications, setCertifications } = useApp();
  const [filteredCerts, setFilteredCerts] = useState([]);
  
  // Filters
  const [domainFilter, setDomainFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setFilteredCerts(certifications);
  }, [certifications]);

  const handleFilter = async () => {
    try {
      let query = "?";
      if (domainFilter) query += `domain=${encodeURIComponent(domainFilter)}&`;
      if (difficultyFilter) query += `difficulty=${encodeURIComponent(difficultyFilter)}&`;
      if (providerFilter) query += `provider=${encodeURIComponent(providerFilter)}&`;
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
      
      const res = await api.getCertifications(query);
      setFilteredCerts(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [domainFilter, difficultyFilter, providerFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-teal-400 to-indigo-400 text-transparent bg-clip-text">
            Verified Certifications
          </h1>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
            Discover top-rated certifications from verified providers to boost your freelance career.
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 shadow-xl">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search certifications..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select 
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
          >
            <option value="">All Domains</option>
            <option value="Web Development">Web Development</option>
            <option value="Programming">Programming</option>
            <option value="AI/ML">AI/ML</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Cloud Computing">Cloud Computing</option>
          </select>

          <select 
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">Any Difficulty</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select 
            className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            <option value="Google">Google</option>
            <option value="Coursera">Coursera</option>
            <option value="Udemy">Udemy</option>
            <option value="edX">edX</option>
            <option value="LinkedIn Learning">LinkedIn Learning</option>
            <option value="AWS">AWS</option>
            <option value="Meta">Meta</option>
          </select>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.length > 0 ? (
            filteredCerts.map((cert) => (
              <div key={cert.id || cert._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/10 transition-all flex flex-col h-full group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-slate-900 text-teal-400 text-xs font-bold uppercase tracking-wider rounded-full border border-teal-500/20">
                    {cert.domain}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${cert.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' : cert.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {cert.difficulty}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-teal-400 transition-colors">
                  {cert.title}
                </h3>
                
                <p className="text-slate-400 text-sm mb-6 flex-grow line-clamp-3">
                  {cert.description}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-300">
                    <Award className="w-4 h-4 mr-2 text-indigo-400" />
                    Provider: <span className="ml-1 font-semibold text-white">{cert.provider}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                    Duration: <span className="ml-1 text-white">{cert.duration}</span>
                  </div>
                </div>

                <Link 
                  to={`/certifications/${cert.id || cert._id}`}
                  className="w-full flex items-center justify-center py-3 px-4 bg-slate-900 hover:bg-teal-500 text-white font-medium rounded-xl transition-colors border border-slate-700 hover:border-teal-500"
                >
                  View Details <ExternalLink className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-slate-800/50 rounded-2xl border border-slate-700 border-dashed">
              <Star className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-slate-300">No certifications found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
