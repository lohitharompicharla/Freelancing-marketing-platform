import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { ArrowLeft, Award, Clock, Calendar, Briefcase, ExternalLink, ShieldCheck } from "lucide-react";

export default function CertificationDetailPage() {
  const { id } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const data = await api.getCertificationById(id);
        setCert(data);
      } catch (err) {
        console.error("Failed to fetch certification details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        Loading certification details...
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-2xl font-bold text-white mb-2">Certification Not Found</h2>
        <p className="mb-6">The certification you are looking for does not exist or has been removed.</p>
        <Link to="/certifications" className="text-teal-400 hover:text-teal-300 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Certifications
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        <Link to="/certifications" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Certifications
        </Link>

        <div className="bg-slate-800/50 border border-slate-700 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-4 py-1.5 bg-slate-900 text-teal-400 text-sm font-bold uppercase tracking-wider rounded-full border border-teal-500/20">
                {cert.domain}
              </span>
              {cert.isVerified && (
                <span className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="w-4 h-4 mr-1.5" /> Platform Verified
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              {cert.title}
            </h1>
            
            <p className="text-lg text-slate-300 max-w-3xl leading-relaxed">
              {cert.description}
            </p>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Skills You Will Gain</h3>
                <div className="flex flex-wrap gap-2">
                  {cert.skills && cert.skills.length > 0 ? (
                    cert.skills.map((skill, index) => (
                      <span key={index} className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 font-medium">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">No specific skills listed.</span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">About the Provider</h3>
                <p className="text-slate-300 leading-relaxed">
                  This certification is officially provided by <strong>{cert.provider}</strong>. Enrolling in this program will redirect you to their official platform where you can complete the coursework and earn your credential.
                </p>
              </section>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">Key Information</h4>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Award className="w-5 h-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Provider</p>
                      <p className="text-white font-medium">{cert.provider}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Briefcase className="w-5 h-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Difficulty Level</p>
                      <p className="text-white font-medium">{cert.difficulty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Estimated Duration</p>
                      <p className="text-white font-medium">{cert.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-indigo-400 mt-0.5 mr-3 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Validity</p>
                      <p className="text-white font-medium">{cert.validity}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700">
                  <button 
                    onClick={() => window.open(cert.officialUrl, "_blank", "noopener,noreferrer")}
                    className="w-full flex items-center justify-center py-4 px-4 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20"
                  >
                    Apply Now <ExternalLink className="w-5 h-5 ml-2" />
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    Redirects to official {cert.provider} website
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
