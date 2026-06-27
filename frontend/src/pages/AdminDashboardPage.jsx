import { useEffect, useState } from "react";
import { LayoutDashboard, Users, FolderKanban, FileText, GraduationCap, Briefcase, CheckCircle, XCircle, Trash2, Edit, Plus, Award, BookOpen, ExternalLink, Check, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export default function AdminDashboardPage() {
  const { 
    token, currentUser, courses, internships,
    fetchAdminUsers, deleteAdminUser,
    fetchAdminProjects, deleteAdminProject,
    fetchAdminApplications, approveApplicationAdmin, rejectApplicationAdmin,
    createCourseAdmin, deleteCourseAdmin,
    createInternshipAdmin, deleteInternshipAdmin,
    certifications, fetchAdminCertifications, createCertificationAdmin, updateCertificationAdmin, deleteCertificationAdmin,
    learningPosts, fetchAdminLearningPosts, createLearningPostAdmin, updateLearningPostAdmin, deleteLearningPostAdmin, toggleLearningPostApproval, setLearningPosts
  } = useApp();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  
  const [courseForm, setCourseForm] = useState({ title: "", level: "", duration: "", price: "", description: "" });
  const [internshipForm, setInternshipForm] = useState({ title: "", role: "", company: "", salary: "", stipend: "", description: "" });
  const [certForm, setCertForm] = useState({ title: "", provider: "Google", domain: "", difficulty: "Beginner", duration: "", validity: "Lifetime", description: "", officialUrl: "", isVerified: true, skills: "" });
  const [showLearningPostForm, setShowLearningPostForm] = useState(false);
  const [learningPostForm, setLearningPostForm] = useState({ title: "", provider: "", domain: "", level: "Beginner", duration: "", whatYouWillLearn: "", whatYouGet: "", description: "", tags: "", officialUrl: "" });

  useEffect(() => {
    if (token && currentUser?.role === "admin") {
      loadData();
    }
  }, [token, currentUser]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, p, a, c, lp] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminProjects(),
        fetchAdminApplications(),
        fetchAdminCertifications(),
        fetchAdminLearningPosts()
      ]);
      setUsers(u);
      setProjects(p);
      setApplications(a);
      setCertifications(c);
      setLearningPosts(lp);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveProject = async (id) => {
    try {
      await api.resolveProjectAdmin(id, token);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteAdminUser(id);
      setUsers(users.filter(u => (u._id || u.id) !== id));
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      await deleteAdminProject(id);
      setProjects(projects.filter(p => (p._id || p.id) !== id));
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    await createCourseAdmin(courseForm);
    setShowCourseForm(false);
    setCourseForm({ title: "", level: "", duration: "", price: "", description: "" });
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    await createInternshipAdmin(internshipForm);
    setShowInternshipForm(false);
    setInternshipForm({ title: "", role: "", company: "", salary: "", stipend: "", description: "" });
  };

  const handleCreateCert = async (e) => {
    e.preventDefault();
    await createCertificationAdmin({
      ...certForm,
      skills: certForm.skills.split(",").map(s => s.trim()).filter(Boolean)
    });
    setShowCertForm(false);
    setCertForm({ title: "", provider: "Google", domain: "", difficulty: "Beginner", duration: "", validity: "Lifetime", description: "", officialUrl: "", isVerified: true, skills: "" });
  };

  const handleCreateLearningPost = async (e) => {
    e.preventDefault();
    await createLearningPostAdmin(learningPostForm);
    setShowLearningPostForm(false);
    setLearningPostForm({ title: "", provider: "", domain: "", level: "Beginner", duration: "", whatYouWillLearn: "", whatYouGet: "", description: "", tags: "", officialUrl: "" });
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <h2 className="text-2xl font-bold">Access Denied: Admins Only</h2>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "projects", label: "Manage Projects", icon: FolderKanban },
    { id: "applications", label: "Manage Applications", icon: FileText },
    { id: "courses", label: "Courses", icon: GraduationCap },
    { id: "internships", label: "Internships", icon: Briefcase },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "learning-posts", label: "Learning Posts", icon: BookOpen }
  ];

  const renderContent = () => {
    if (loading) return <div className="p-8 text-center text-slate-400">Loading admin data...</div>;

    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium">Total Users</h3>
              <p className="text-4xl font-bold text-white mt-2">{users.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium">Total Projects</h3>
              <p className="text-4xl font-bold text-white mt-2">{projects.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
              <h3 className="text-slate-400 font-medium">Total Applications</h3>
              <p className="text-4xl font-bold text-white mt-2">{applications.length}</p>
            </div>
          </div>
        );
      case "users":
        return (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 border-b border-slate-700">
                  <th className="p-4 text-slate-400 font-medium">Name</th>
                  <th className="p-4 text-slate-400 font-medium">Email</th>
                  <th className="p-4 text-slate-400 font-medium">Role</th>
                  <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {users.map(u => (
                  <tr key={u._id || u.id} className="hover:bg-slate-800/30">
                    <td className="p-4 text-slate-200">{u.name}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full uppercase tracking-wider">{u.role}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteUser(u._id || u.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "projects":
        return (
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p._id || p.id} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white">{p.title}</h4>
                  <p className="text-slate-400 text-sm mt-1">Status: <span className="text-emerald-400">{p.status}</span></p>
                </div>
                <div className="flex gap-2">
                  {p.status !== "Completed" && (
                    <button onClick={() => handleResolveProject(p._id || p.id)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-colors">
                      Resolve
                    </button>
                  )}
                  <button onClick={() => handleDeleteProject(p._id || p.id)} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      case "applications":
        return (
          <div className="space-y-4">
            {applications.map(a => (
              <div key={a._id || a.id} className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-200"><span className="text-slate-400">Project ID:</span> {a.projectId}</p>
                  <p className="text-slate-200"><span className="text-slate-400">Freelancer ID:</span> {a.freelancerId}</p>
                  <p className="text-slate-400 text-sm mt-1">Status: <span className="text-indigo-400">{a.status}</span></p>
                </div>
                {a.status === "Pending" && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => { approveApplicationAdmin(a._id || a.id); setApplications(apps => apps.map(app => (app.id === a.id || app._id === a._id) ? {...app, status: 'Accepted'} : app)); }} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
                      <CheckCircle className="w-6 h-6" />
                    </button>
                    <button onClick={() => { rejectApplicationAdmin(a._id || a.id); setApplications(apps => apps.map(app => (app.id === a.id || app._id === a._id) ? {...app, status: 'Rejected'} : app)); }} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case "courses":
        return (
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Platform Courses</h3>
              <button onClick={() => setShowCourseForm(!showCourseForm)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" /> Add Course
              </button>
            </div>
            
            {showCourseForm && (
              <form onSubmit={handleCreateCourse} className="bg-slate-800 p-6 rounded-xl mb-6 space-y-4 border border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Title" required value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Level (e.g. Beginner)" required value={courseForm.level} onChange={e => setCourseForm({...courseForm, level: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Duration (e.g. 4 hours)" required value={courseForm.duration} onChange={e => setCourseForm({...courseForm, duration: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Price (e.g. Free or Rs 500)" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <textarea placeholder="Description" required value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"></textarea>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowCourseForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save Course</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {courses.map(c => (
                <div key={c.id || c._id} className="flex justify-between items-center p-4 bg-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-200">{c.title}</h4>
                    <p className="text-sm text-slate-400">{c.level} • {c.duration}</p>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button onClick={() => deleteCourseAdmin(c.id || c._id)} className="p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p className="text-slate-400 text-center py-4">No courses available.</p>}
            </div>
          </div>
        );
      case "internships":
        return (
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Platform Internships</h3>
              <button onClick={() => setShowInternshipForm(!showInternshipForm)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" /> Add Internship
              </button>
            </div>
            
            {showInternshipForm && (
              <form onSubmit={handleCreateInternship} className="bg-slate-800 p-6 rounded-xl mb-6 space-y-4 border border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Title" required value={internshipForm.title} onChange={e => setInternshipForm({...internshipForm, title: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Role" required value={internshipForm.role} onChange={e => setInternshipForm({...internshipForm, role: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Company" required value={internshipForm.company} onChange={e => setInternshipForm({...internshipForm, company: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Salary" required value={internshipForm.salary} onChange={e => setInternshipForm({...internshipForm, salary: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Stipend" required value={internshipForm.stipend} onChange={e => setInternshipForm({...internshipForm, stipend: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <textarea placeholder="Description" required value={internshipForm.description} onChange={e => setInternshipForm({...internshipForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"></textarea>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowInternshipForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save Internship</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {internships.map(i => (
                <div key={i.id || i._id} className="flex justify-between items-center p-4 bg-slate-800 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-200">{i.title}</h4>
                    <p className="text-sm text-slate-400">{i.company} • {i.role}</p>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button onClick={() => deleteInternshipAdmin(i.id || i._id)} className="p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {internships.length === 0 && <p className="text-slate-400 text-center py-4">No internships available.</p>}
            </div>
          </div>
        );
      case "learning-posts":
        return (
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-medium text-white">Learning Posts</h3>
              <button onClick={() => setShowLearningPostForm(!showLearningPostForm)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" /> Add Post
              </button>
            </div>
            
            {showLearningPostForm && (
              <form onSubmit={handleCreateLearningPost} className="bg-slate-800 p-6 rounded-xl mb-6 space-y-4 border border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Title" required value={learningPostForm.title} onChange={e => setLearningPostForm({...learningPostForm, title: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Provider" required value={learningPostForm.provider} onChange={e => setLearningPostForm({...learningPostForm, provider: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Domain" required value={learningPostForm.domain} onChange={e => setLearningPostForm({...learningPostForm, domain: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <select value={learningPostForm.level} onChange={e => setLearningPostForm({...learningPostForm, level: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <input type="text" placeholder="Duration (e.g. 4 weeks)" value={learningPostForm.duration} onChange={e => setLearningPostForm({...learningPostForm, duration: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="url" placeholder="Official URL (https://...)" required value={learningPostForm.officialUrl} onChange={e => setLearningPostForm({...learningPostForm, officialUrl: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="What You Will Learn (comma-separated)" value={learningPostForm.whatYouWillLearn} onChange={e => setLearningPostForm({...learningPostForm, whatYouWillLearn: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="What You Get (comma-separated)" value={learningPostForm.whatYouGet} onChange={e => setLearningPostForm({...learningPostForm, whatYouGet: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white" />
                  <input type="text" placeholder="Tags (comma-separated)" value={learningPostForm.tags} onChange={e => setLearningPostForm({...learningPostForm, tags: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white col-span-2" />
                </div>
                <textarea placeholder="Description" required value={learningPostForm.description} onChange={e => setLearningPostForm({...learningPostForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white min-h-[100px]"></textarea>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowLearningPostForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg">Save Post</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {learningPosts && learningPosts.map(p => (
                <div key={p.id || p._id} className="flex justify-between items-center p-4 bg-slate-800 rounded-xl">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-slate-200">{p.title}</h4>
                      {!p.isApproved && (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-wider rounded">Unapproved</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">{p.provider} • {p.domain} • {p.level}</p>
                  </div>
                  <div className="flex gap-2 text-slate-400">
                    <button 
                      onClick={() => toggleLearningPostApproval(p.id || p._id)} 
                      className={`p-2 rounded-lg transition-colors ${p.isApproved ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-700"}`}
                      title={p.isApproved ? "Unapprove" : "Approve"}
                    >
                      {p.isApproved ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                    <button onClick={() => deleteLearningPostAdmin(p.id || p._id)} className="p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
              {(!learningPosts || learningPosts.length === 0) && <p className="text-slate-400 text-center py-4">No learning posts available.</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            Admin Console
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Manage platform resources and resolve conflicts.</p>
        </header>

        {/* Mobile Tabs */}
        <div className="md:hidden flex overflow-x-auto gap-2 mb-8 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderContent()}
      </main>
    </div>
  );
}
