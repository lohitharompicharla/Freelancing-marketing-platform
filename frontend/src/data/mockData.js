export const demoUsers = [
  {
    id: "client-1",
    name: "Aarav Mehta",
    role: "client",
    company: "HelioScale",
    email: "client@example.com",
    password: "password123",
    skills: [],
    rating: 4.8,
    completedProjects: 4,
    earnings: 0
  },
  {
    id: "admin-1",
    name: "System Admin",
    role: "admin",
    email: "admin@example.com",
    password: "password123",
    skills: [],
    rating: 0,
    completedProjects: 0,
    earnings: 0
  },
  {
    id: "freelancer-1",
    name: "Riya Sharma",
    role: "freelancer",
    email: "riya@example.com",
    password: "password123",
    skills: ["React", "Tailwind CSS", "Node.js", "MongoDB", "Figma"],
    completedProjects: 5,
    rating: 4.7,
    earnings: 185000,
    experienceLevel: "Expert"
  },
  {
    id: "freelancer-2",
    name: "Vikram Patel",
    role: "freelancer",
    email: "vikram@example.com",
    password: "password123",
    skills: ["Figma", "UI Design", "Branding", "Communication"],
    completedProjects: 2,
    rating: 4.2,
    earnings: 92000,
    experienceLevel: "Intermediate"
  },
  {
    id: "freelancer-3",
    name: "Neha Iyer",
    role: "freelancer",
    email: "neha@example.com",
    password: "password123",
    skills: ["HTML", "CSS", "JavaScript"],
    completedProjects: 1,
    rating: 4.0,
    earnings: 18000,
    experienceLevel: "Beginner"
  }
];

export const demoProjects = [
  {
    id: "project-1",
    title: "Build a responsive SaaS analytics dashboard",
    category: "Web Dev",
    description: "Need a modern React dashboard with charts, auth flow, and API integration.",
    requiredSkills: ["React", "Tailwind CSS", "Node.js", "API Integration"],
    budgetRange: "Rs 80,000 - Rs 120,000",
    deadline: "2026-04-28",
    experienceLevel: "Expert",
    status: "In Progress",
    freelancerId: "freelancer-1",
    clientId: "client-1"
  },
  {
    id: "project-2",
    title: "Redesign mobile onboarding screens",
    category: "Design",
    description: "Craft polished onboarding screens for a fintech mobile app.",
    requiredSkills: ["Figma", "UI Design", "Branding"],
    budgetRange: "Rs 20,000 - Rs 35,000",
    deadline: "2026-04-20",
    experienceLevel: "Intermediate",
    status: "Open",
    clientId: "client-1"
  },
  {
    id: "project-3",
    title: "Create marketing microsite",
    category: "Web Dev",
    description: "Beginner-friendly HTML, CSS, JavaScript microsite for campaign launch.",
    requiredSkills: ["HTML", "CSS", "JavaScript"],
    budgetRange: "Rs 15,000 - Rs 25,000",
    deadline: "2026-04-18",
    experienceLevel: "Beginner",
    status: "Completed",
    freelancerId: "freelancer-3",
    clientId: "client-1"
  }
];

export const demoReviews = [
  {
    id: "review-1",
    freelancerId: "freelancer-3",
    rating: 4,
    review: "Great communication and clean delivery for a first collaboration."
  }
];

export const demoCourses = [
  {
    id: "course-1",
    title: "HTML Fundamentals",
    level: "Beginner",
    duration: "3 hours",
    description: "Build a solid HTML foundation for profile pages, landing pages, and accessible content.",
    lessons: ["HTML structure", "Semantic tags", "Forms and accessibility"],
    quiz: [
      {
        id: "course-1-question-1",
        question: "Which tag is semantic?",
        options: ["div", "header", "span"]
      }
    ]
  },
  {
    id: "course-2",
    title: "JavaScript Essentials",
    level: "Beginner",
    duration: "4 hours",
    description: "Learn the JavaScript basics needed for interactive freelance projects and product features.",
    lessons: ["Variables", "Functions", "Arrays and objects"],
    quiz: [
      {
        id: "course-2-question-1",
        question: "Which keyword declares a block scoped variable?",
        options: ["var", "let", "with"]
      }
    ]
  }
];

export const demoInternships = [
  {
    id: "internship-1",
    title: "Frontend Product Intern",
    role: "Frontend Product Intern",
    company: "Nova Labs",
    salary: "Rs 18,000 / month",
    skills: ["React", "Figma", "Communication"],
    description:
      "Collaborate with the product team on onboarding flows, polish reusable UI blocks, and support weekly design reviews.",
    applicantsCount: 1
  },
  {
    id: "internship-2",
    title: "Full Stack Engineering Intern",
    role: "Full Stack Engineering Intern",
    company: "Orbit Stack",
    salary: "Rs 25,000 / month",
    skills: ["Node.js", "MongoDB", "React", "REST API"],
    description:
      "Support a delivery team building internal admin tools, fix API issues, and ship quality-of-life improvements across the stack.",
    applicantsCount: 0
  }
];

export const demoApplications = [
  {
    id: "internship-application-1",
    userId: "freelancer-1",
    internshipId: "internship-1",
    status: "Applied",
    createdAt: "2026-04-03T08:00:00.000Z"
  }
];

export const demoProjectApplications = [
  {
    id: "project-application-1",
    projectId: "project-2",
    freelancerId: "freelancer-2",
    coverLetter: "I can deliver premium mobile-first Figma screens within 6 days.",
    status: "Pending",
    createdAt: "2026-04-03T08:00:00.000Z"
  },
  {
    id: "project-application-2",
    projectId: "project-2",
    freelancerId: "freelancer-1",
    coverLetter: "I have shipped several polished dashboards and conversion flows.",
    status: "Pending",
    createdAt: "2026-04-03T09:00:00.000Z"
  }
];

export const demoMessages = [
  {
    id: "message-1",
    chatId: "chat-1",
    projectId: "project-1",
    clientId: "client-1",
    freelancerId: "freelancer-1",
    senderId: "freelancer-1",
    text: "Dashboard layout is ready. I will push the chart integration update by this evening.",
    createdAt: "2026-04-08T10:30:00.000Z"
  },
  {
    id: "message-2",
    chatId: "chat-1",
    projectId: "project-1",
    clientId: "client-1",
    freelancerId: "freelancer-1",
    senderId: "client-1",
    text: "Perfect. Please keep the onboarding metrics card on the first fold.",
    createdAt: "2026-04-08T11:00:00.000Z"
  },
  {
    id: "message-3",
    chatId: "chat-2",
    projectId: "project-3",
    clientId: "client-1",
    freelancerId: "freelancer-3",
    senderId: "freelancer-3",
    text: "The microsite is live and the responsive fixes are done.",
    createdAt: "2026-03-20T09:00:00.000Z"
  }
];

export const demoPayments = [];

export const demoLearningProgress = {
  "freelancer-1": {
    "course-1": {
      completedLessons: ["HTML structure", "Semantic tags", "Forms and accessibility"],
      progress: 100,
      completed: true
    },
    "course-2": {
      completedLessons: ["Variables", "Functions"],
      progress: 67,
      completed: false
    }
  },
  "freelancer-3": {
    "course-1": {
      completedLessons: ["HTML structure"],
      progress: 33,
      completed: false
    },
    "course-2": {
      completedLessons: [],
      progress: 0,
      completed: false
    }
  }
};

export const demoCertificates = [
  {
    id: "certificate-1",
    userId: "freelancer-1",
    courseId: "course-1",
    title: "HTML Fundamentals Certificate",
    issuedAt: "2026-04-01T08:00:00.000Z",
    certificateNumber: "DEMO-HTML-240401",
    downloadUrl: ""
  }
];

export const demoQuizAttempts = [
  {
    id: "quiz-attempt-1",
    userId: "freelancer-1",
    courseId: "course-1",
    answers: ["header"],
    score: 1,
    totalQuestions: 1,
    percentage: 100,
    passed: true,
    attemptedAt: "2026-04-01T07:30:00.000Z"
  }
];
