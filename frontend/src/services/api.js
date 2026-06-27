const BASE_URL = "http://localhost:5000/api";

const API_URL = import.meta.env.VITE_API_URL || BASE_URL;

const request = async (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  
  try {
    const { headers: customHeaders = {}, ...restOptions } = options;
    const res = await fetch(`${API_URL}${path}`, {
      ...restOptions,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...customHeaders
      }
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    
    return data;
  } catch (error) {
    console.error("FULL ERROR:", error);
    throw error;
  }
};

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload)
    }),
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getUsers: () => request("/users"),
  getUser: (id) => request(`/user/${id}`),
  updateProfile: (payload, token) =>
    request("/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  uploadResume: (formData) =>
    request("/auth/upload-resume", {
      method: "POST",
      body: formData
    }),
  getRecommendedProjects: (token) =>
    request("/auth/recommend-projects", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getProjects: () => request("/projects"),
  getMyProjectApplications: (token) =>
    request("/projects/me/applications", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getMyApplications: (token) =>
    request("/my-applications", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  apply: (payload, token) =>
    request("/apply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  applyToProject: (projectId, payload, token) =>
    request(`/projects/${projectId}/apply`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  getProjectApplicants: (projectId, token) =>
    request(`/projects/${projectId}/applications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  hireFreelancer: (projectId, payload, token) =>
    request(`/projects/${projectId}/hire`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  createProject: (payload, token) =>
    request("/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  uploadProjectFile: (formData, token) =>
    request("/projects/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    }),
  updateProjectStatus: (projectId, payload, token) =>
    request(`/projects/${projectId}/status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  getCourses: () => request("/courses"),
  getCourseProgress: (userId, token) =>
    request(`/courses/progress/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getQuizAttempts: (userId, token) =>
    request(`/courses/quiz-attempts/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  updateCourseProgress: (courseId, payload, token) =>
    request(`/courses/${courseId}/progress`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  submitQuizAttempt: (courseId, payload, token) =>
    request(`/courses/${courseId}/attempt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  completeCourse: (courseId, token) =>
    request(`/courses/${courseId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getCertificates: (userId, token) =>
    token
      ? request("/courses/certificates", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      : request(`/courses/certificates/${userId}`),
  getInternships: () => request("/internships"),
  getInternship: (id) => request(`/internships/${id}`),
  createInternship: (payload, token) =>
    request("/internships", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  applyToInternship: (internshipId, token) =>
    request("/apply", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ internshipId })
    }),
  getApplications: (userId, token) =>
    request(`/applications/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getMessages: (token) =>
    request("/messages", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getMessagesByChat: (chatId, token) =>
    request(`/messages/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getChats: (token) =>
    request("/messages/chats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getChatsByUser: (userId, token) =>
    request(`/chat/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  createChat: (payload, token) =>
    request("/chat/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  sendMessage: (payload, token) =>
    request("/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  getPayments: (token) =>
    request("/payments", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  createProjectPaymentOrder: (projectId, payload, token) =>
    request(`/payments/projects/${projectId}/order`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  createPaymentOrder: (payload, token) =>
    request("/payment/order", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  verifyProjectPayment: (payload, token) =>
    request("/payments/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  verifyPayment: (payload, token) =>
    request("/payment/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  acceptApplication: (payload, token) =>
    request("/application/accept", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  getFreelancerDashboard: (token) =>
    request("/dashboard/freelancer", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getClientDashboard: (token) =>
    request("/dashboard/client", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
  getReviews: (freelancerId) => request(`/reviews/freelancer/${freelancerId}`),
  getAllReviews: () => request("/reviews"),
  submitReview: (projectId, payload, token) =>
    request(`/reviews/project/${projectId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    }),
  getSuggestions: (payload) =>
    request("/projects/suggestions", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  getAdminUsers: (token) => request("/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
  deleteUserAdmin: (id, token) => request(`/admin/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  getAdminProjects: (token) => request("/admin/projects", { headers: { Authorization: `Bearer ${token}` } }),
  deleteProjectAdmin: (id, token) => request(`/admin/projects/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  getAdminApplications: (token) => request("/admin/applications", { headers: { Authorization: `Bearer ${token}` } }),
  approveApplicationAdmin: (id, token) => request(`/admin/applications/${id}/approve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),
  rejectApplicationAdmin: (id, token) => request(`/admin/applications/${id}/reject`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),
  resolveProjectAdmin: (id, token) => request(`/admin/projects/${id}/resolve`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }),
  createCourseAdmin: (payload, token) => request("/admin/courses", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  updateCourseAdmin: (id, payload, token) => request(`/admin/courses/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  deleteCourseAdmin: (id, token) => request(`/admin/courses/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  createInternshipAdmin: (payload, token) => request("/admin/internships", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  updateInternshipAdmin: (id, payload, token) => request(`/admin/internships/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  deleteInternshipAdmin: (id, token) => request(`/admin/internships/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  // Certifications
  getCertifications: (query = "") => request(`/certifications${query}`),
  getCertificationById: (id) => request(`/certifications/${id}`),
  getRecommendedCertifications: (query = "") => request(`/certifications/recommendations/top${query}`),
  getAdminCertifications: (token) => request("/admin/certifications", { headers: { Authorization: `Bearer ${token}` } }),
  createCertificationAdmin: (data, token) => request("/admin/certifications", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  updateCertificationAdmin: (id, data, token) => request(`/admin/certifications/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  deleteCertificationAdmin: (id, token) => request(`/admin/certifications/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),

  // Learning Posts
  getLearningPosts: (query = "") => request(`/learning-posts${query}`),
  getLearningPostById: (id) => request(`/learning-posts/${id}`),
  getLearningRecommendations: (query = "") => request(`/learning-recommendations${query}`),
  getAdminLearningPosts: (token) => request("/admin/learning-posts", { headers: { Authorization: `Bearer ${token}` } }),
  createLearningPostAdmin: (data, token) => request("/admin/learning-posts", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  updateLearningPostAdmin: (id, data, token) => request(`/admin/learning-posts/${id}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(data) }),
  deleteLearningPostAdmin: (id, token) => request(`/admin/learning-posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }),
  toggleLearningPostApproval: (id, token) => request(`/admin/learning-posts/${id}/toggle-approval`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } })
};
