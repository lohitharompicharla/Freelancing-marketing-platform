import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Award, Building, ExternalLink } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function LearningDetailPage() {
  const { id } = useParams();
  const { fetchLearningPostById } = useApp();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchLearningPostById(id);
      setPost(data);
      setLoading(false);
    };
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Post Not Found</h2>
        <p className="text-slate-400 mb-8">The learning resource you're looking for doesn't exist or is not approved.</p>
        <Link to="/learning" className="text-indigo-400 hover:text-indigo-300 font-medium">
          &larr; Back to Learning Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/learning" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Learning Hub
        </Link>

        {/* Header Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-sm font-medium rounded-full">
                {post.domain}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm font-medium rounded-full">
                {post.level}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-slate-300 mb-8">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-slate-500" />
                <span className="font-medium text-white">{post.provider}</span>
              </div>
              {post.duration && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-500" />
                  <span>{post.duration}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={post.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105"
              >
                Start Learning <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {post.description && (
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">About this course</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {post.description}
                </p>
              </section>
            )}

            {(post.whatYouWillLearn?.length > 0) && (
              <section className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">What you'll learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {post.whatYouWillLearn.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {(post.whatYouGet?.length > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-400" /> What you get
                </h3>
                <ul className="space-y-4">
                  {post.whatYouGet.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-300 pb-4 border-b border-slate-800 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(post.tags?.length > 0) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-4">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <Link
                      key={tag}
                      to={`/learning?search=${tag}`}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
