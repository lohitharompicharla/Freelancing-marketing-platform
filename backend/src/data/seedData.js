import bcrypt from "bcryptjs";

const password = bcrypt.hashSync("password123", 10);

export const seedData = {
  users: [
    {
      id: "client-1",
      name: "Aarav Mehta",
      email: "client@example.com",
      password,
      role: "client",
      skills: [],
      experienceLevel: "Intermediate",
      completedProjects: 4,
      rating: 4.8,
      earnings: 0,
      portfolio: [],
      hiringHistory: 6
    },
    {
      id: "freelancer-1",
      name: "Riya Sharma",
      email: "riya@example.com",
      password,
      role: "freelancer",
      skills: ["React", "Tailwind CSS", "Node.js", "MongoDB", "Figma"],
      experienceLevel: "Expert",
      completedProjects: 5,
      rating: 4.7,
      earnings: 185000,
      portfolio: ["SaaS dashboard", "Healthcare booking UI"]
    },
    {
      id: "freelancer-2",
      name: "Vikram Patel",
      email: "vikram@example.com",
      password,
      role: "freelancer",
      skills: ["Figma", "UI Design", "Branding", "Communication"],
      experienceLevel: "Intermediate",
      completedProjects: 2,
      rating: 4.2,
      earnings: 92000,
      portfolio: ["Fintech redesign", "Startup brand kit"]
    },
    {
      id: "freelancer-3",
      name: "Neha Iyer",
      email: "neha@example.com",
      password,
      role: "freelancer",
      skills: ["JavaScript", "HTML", "CSS"],
      experienceLevel: "Beginner",
      completedProjects: 1,
      rating: 4.0,
      earnings: 18000,
      portfolio: ["Landing page build"]
    }
  ],
  projects: [
    {
      id: "project-1",
      title: "Build a responsive SaaS analytics dashboard",
      description: "Need a modern React dashboard with charts, auth flow, and API integration.",
      category: "Web Dev",
      requiredSkills: ["React", "Tailwind CSS", "Node.js", "API Integration"],
      budgetRange: "Rs 80,000 - Rs 120,000",
      deadline: "2026-04-28",
      experienceLevel: "Expert",
      fileName: "dashboard-spec.pdf",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      status: "In Progress",
      createdAt: "2026-04-01T10:00:00.000Z"
    },
    {
      id: "project-2",
      title: "Redesign mobile onboarding screens",
      description: "Looking for a designer to craft polished onboarding screens for a fintech app.",
      category: "Design",
      requiredSkills: ["Figma", "UI Design", "Branding"],
      budgetRange: "Rs 20,000 - Rs 35,000",
      deadline: "2026-04-20",
      experienceLevel: "Intermediate",
      fileName: "",
      clientId: "client-1",
      status: "Open",
      createdAt: "2026-04-03T11:30:00.000Z"
    },
    {
      id: "project-3",
      title: "Create marketing microsite",
      description: "Beginner-friendly HTML, CSS, JavaScript microsite for campaign launch.",
      category: "Web Dev",
      requiredSkills: ["HTML", "CSS", "JavaScript"],
      budgetRange: "Rs 15,000 - Rs 25,000",
      deadline: "2026-04-18",
      experienceLevel: "Beginner",
      fileName: "",
      clientId: "client-1",
      freelancerId: "freelancer-3",
      status: "Completed",
      createdAt: "2026-03-18T11:30:00.000Z"
    }
  ],
  projectApplications: [
    {
      id: "project-application-1",
      projectId: "project-2",
      freelancerId: "freelancer-2",
      coverLetter: "I can deliver premium mobile-first Figma screens within 6 days.",
      status: "Pending"
    },
    {
      id: "project-application-2",
      projectId: "project-2",
      freelancerId: "freelancer-1",
      coverLetter: "I have shipped several polished dashboards and conversion flows.",
      status: "Pending"
    }
  ],
  chats: [
    {
      id: "chat-1",
      projectId: "project-1",
      clientId: "client-1",
      freelancerId: "freelancer-1",
      participantIds: ["client-1", "freelancer-1"],
      lastMessageAt: "2026-04-08T11:00:00.000Z",
      createdAt: "2026-04-08T10:30:00.000Z"
    },
    {
      id: "chat-2",
      projectId: "project-3",
      clientId: "client-1",
      freelancerId: "freelancer-3",
      participantIds: ["client-1", "freelancer-3"],
      lastMessageAt: "2026-03-20T09:00:00.000Z",
      createdAt: "2026-03-20T09:00:00.000Z"
    }
  ],
  payments: [],
  messages: [
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
  ],
  applications: [
    {
      id: "internship-application-1",
      userId: "freelancer-1",
      internshipId: "internship-1",
      status: "Applied",
      createdAt: "2026-04-03T08:00:00.000Z"
    }
  ],
  reviews: [
    {
      id: "review-1",
      projectId: "project-3",
      clientId: "client-1",
      freelancerId: "freelancer-3",
      rating: 4,
      review: "Great communication and clean delivery for a first collaboration."
    }
  ],
  courses: [
    {
      id: "course-1",
      title: "HTML Fundamentals",
      level: "Beginner",
      duration: "3 hours",
      description: "Build a solid HTML foundation for profile pages, landing pages, and accessible content.",
      modules: [
        {
          title: "Getting Started",
          level: "Beginner",
          content: [
            { title: "HTML structure", type: "video", url: "https://example.com/video1.mp4" },
            { title: "Semantic tags", type: "text", url: "" }
          ]
        },
        {
          title: "Forms and Accessibility",
          level: "Intermediate",
          content: [
            { title: "Forms and accessibility", type: "pdf", url: "https://example.com/forms.pdf" }
          ]
        }
      ],
      quiz: [
        {
          question: "Which tag is semantic?",
          options: ["div", "header", "span"],
          answer: "header"
        }
      ]
    },
    {
      id: "course-2",
      title: "JavaScript Essentials",
      level: "Beginner",
      duration: "4 hours",
      description: "Learn the JavaScript basics needed for interactive freelance projects and small product features.",
      modules: [
        {
          title: "JavaScript Basics",
          level: "Beginner",
          content: [
            { title: "Variables", type: "video", url: "https://example.com/video2.mp4" },
            { title: "Functions", type: "text", url: "" }
          ]
        },
        {
          title: "Data Structures",
          level: "Intermediate",
          content: [
            { title: "Arrays and objects", type: "text", url: "" }
          ]
        }
      ],
      quiz: [
        {
          question: "Which keyword declares a block scoped variable?",
          options: ["var", "let", "with"],
          answer: "let"
        }
      ]
    }
  ],
  certificates: [
    {
      id: "certificate-1",
      userId: "freelancer-1",
      courseId: "course-1",
      title: "HTML Fundamentals Certificate",
      issuedAt: "2026-03-22T08:00:00.000Z",
      certificateNumber: "FF-FREE-COUR-240322",
      downloadUrl: "/api/uploads/certificates/demo-html-fundamentals.html",
      fileName: "demo-html-fundamentals.html"
    }
  ],
  internships: [
    {
      id: "internship-1",
      title: "Frontend Product Intern",
      role: "Frontend Product Intern",
      company: "Nova Labs",
      salary: "Rs 18,000 / month",
      stipend: "Rs 18,000 / month",
      skills: ["React", "Figma", "Communication"],
      description:
        "Collaborate with the product team on onboarding flows, polish reusable UI blocks, and support weekly design reviews.",
      applicantsCount: 1,
      clientId: "client-1",
      createdAt: "2026-04-02T08:00:00.000Z"
    },
    {
      id: "internship-2",
      title: "Full Stack Engineering Intern",
      role: "Full Stack Engineering Intern",
      company: "Orbit Stack",
      salary: "Rs 25,000 / month",
      stipend: "Rs 25,000 / month",
      skills: ["Node.js", "MongoDB", "React", "REST API"],
      description:
        "Support a delivery team building internal admin tools, fix API issues, and ship quality-of-life improvements across the stack.",
      applicantsCount: 0,
      clientId: "client-1",
      createdAt: "2026-04-05T08:00:00.000Z"
    }
  ],
  learningProgress: [
    {
      id: "progress-1",
      userId: "freelancer-3",
      courseId: "course-1",
      completedLessons: ["HTML structure"],
      progress: 33,
      completed: false
    },
    {
      id: "progress-2",
      userId: "freelancer-1",
      courseId: "course-1",
      completedLessons: ["HTML structure", "Semantic tags", "Forms and accessibility"],
      progress: 100,
      completed: true
    }
  ],
  quizAttempts: [
    {
      id: "quiz-attempt-1",
      userId: "freelancer-1",
      courseId: "course-1",
      answers: ["header"],
      score: 1,
      totalQuestions: 1,
      percentage: 100,
      passed: true,
      attemptedAt: "2026-03-22T07:30:00.000Z"
    }
  ],
  certifications: [
    {
      id: "cert-1",
      title: "Google Digital Marketing & E-commerce Professional Certificate",
      provider: "Google",
      skills: ["Digital Marketing", "E-commerce", "SEO", "Analytics"],
      difficulty: "Beginner",
      duration: "6 months",
      validity: "Lifetime",
      domain: "Marketing",
      description: "Learn the fundamentals of digital marketing and e-commerce to gain job-ready skills.",
      officialUrl: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-2",
      title: "Meta Front-End Developer Professional Certificate",
      provider: "Meta",
      skills: ["React", "JavaScript", "HTML/CSS", "UI/UX"],
      difficulty: "Beginner",
      duration: "7 months",
      validity: "Lifetime",
      domain: "Web Development",
      description: "Launch your career as a front-end developer. Build job-ready skills for an in-demand career and earn a credential from Meta.",
      officialUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-3",
      title: "Python for Everybody Specialization",
      provider: "Coursera",
      skills: ["Python", "Data Structures", "Web Scraping", "Databases"],
      difficulty: "Beginner",
      duration: "8 months",
      validity: "Lifetime",
      domain: "Programming",
      description: "Learn to Program and Analyze Data with Python. Develop programs to gather, clean, analyze, and visualize data.",
      officialUrl: "https://www.coursera.org/specializations/python",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-4",
      title: "AWS Certified Cloud Practitioner",
      provider: "AWS",
      skills: ["Cloud Computing", "AWS", "Security", "Architecture"],
      difficulty: "Beginner",
      duration: "Self-paced",
      validity: "3 years",
      domain: "Cloud Computing",
      description: "Validate your overall understanding of the AWS Cloud platform, covering basic cloud concepts and security.",
      officialUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-5",
      title: "AI for Everyone",
      provider: "Coursera",
      skills: ["Artificial Intelligence", "Machine Learning", "Data Science Workflow"],
      difficulty: "Beginner",
      duration: "4 weeks",
      validity: "Lifetime",
      domain: "AI/ML",
      description: "AI is not only for engineers. If you want your organization to become better at using AI, this is the course to tell everyone to take.",
      officialUrl: "https://www.coursera.org/learn/ai-for-everyone",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-6",
      title: "Data Analysis with Excel",
      provider: "LinkedIn Learning",
      skills: ["Excel", "Data Analysis", "Pivot Tables", "Data Visualization"],
      difficulty: "Intermediate",
      duration: "2 weeks",
      validity: "Lifetime",
      domain: "Data Science",
      description: "Master Excel tools and techniques for analyzing and visualizing data to make informed business decisions.",
      officialUrl: "https://www.linkedin.com/learning/paths/become-a-data-analyst",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-7",
      title: "The Web Developer Bootcamp 2024",
      provider: "Udemy",
      skills: ["HTML", "CSS", "JS", "Node", "MongoDB"],
      difficulty: "Beginner",
      duration: "74 hours",
      validity: "Lifetime",
      domain: "Web Development",
      description: "The only course you need to learn web development - HTML, CSS, JS, Node, and More!",
      officialUrl: "https://www.udemy.com/course/the-web-developer-bootcamp/",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-8",
      title: "CS50's Introduction to Computer Science",
      provider: "edX",
      skills: ["C", "Python", "SQL", "Algorithms", "Data Structures"],
      difficulty: "Beginner",
      duration: "12 weeks",
      validity: "Lifetime",
      domain: "Programming",
      description: "An introduction to the intellectual enterprises of computer science and the art of programming.",
      officialUrl: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-9",
      title: "Machine Learning Specialization",
      provider: "Coursera",
      skills: ["Machine Learning", "Python", "TensorFlow", "Algorithms"],
      difficulty: "Intermediate",
      duration: "2 months",
      validity: "Lifetime",
      domain: "AI/ML",
      description: "A foundational online program created in collaboration between DeepLearning.AI and Stanford Online.",
      officialUrl: "https://www.coursera.org/specializations/machine-learning-introduction",
      isVerified: true,
      createdBy: "admin-1"
    },
    {
      id: "cert-10",
      title: "Google UX Design Professional Certificate",
      provider: "Google",
      skills: ["UX Design", "Wireframing", "Figma", "Prototyping"],
      difficulty: "Beginner",
      duration: "6 months",
      validity: "Lifetime",
      domain: "Design",
      description: "Start a career in UX design. Build job-ready skills for an in-demand career and earn a credential from Google.",
      officialUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
      isVerified: true,
      createdBy: "admin-1"
    }
  ],
  learningPosts: [
    {
      id: "lp-1",
      title: "Google UX Design Professional Certificate",
      provider: "Google",
      domain: "Design",
      level: "Beginner",
      whatYouWillLearn: ["UX Design", "Wireframing", "Figma", "Prototyping"],
      whatYouGet: ["Professional Certificate", "Portfolio projects", "Job-ready skills"],
      description: "Start a career in UX design. Build job-ready skills for an in-demand career and earn a credential from Google.",
      duration: "6 months",
      tags: ["ux", "design", "figma"],
      officialUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-10T08:00:00.000Z"
    },
    {
      id: "lp-2",
      title: "Meta Front-End Developer Professional Certificate",
      provider: "Meta",
      domain: "Web Dev",
      level: "Beginner",
      whatYouWillLearn: ["React", "JavaScript", "HTML/CSS", "UI/UX"],
      whatYouGet: ["Professional Certificate", "Interactive portfolio", "React expertise"],
      description: "Launch your career as a front-end developer. Build job-ready skills for an in-demand career and earn a credential from Meta.",
      duration: "7 months",
      tags: ["frontend", "react", "javascript"],
      officialUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-11T08:00:00.000Z"
    },
    {
      id: "lp-3",
      title: "AWS Certified Cloud Practitioner",
      provider: "AWS",
      domain: "Cloud Computing",
      level: "Beginner",
      whatYouWillLearn: ["Cloud Computing", "AWS", "Security", "Architecture"],
      whatYouGet: ["Industry Certification", "Cloud fundamentals", "AWS badge"],
      description: "Validate your overall understanding of the AWS Cloud platform, covering basic cloud concepts and security.",
      duration: "Self-paced",
      tags: ["aws", "cloud", "certification"],
      officialUrl: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-12T08:00:00.000Z"
    },
    {
      id: "lp-4",
      title: "Python for Everybody Specialization",
      provider: "Coursera",
      domain: "Programming",
      level: "Beginner",
      whatYouWillLearn: ["Python", "Data Structures", "Web Scraping", "Databases"],
      whatYouGet: ["Specialization Certificate", "Programming fundamentals"],
      description: "Learn to Program and Analyze Data with Python. Develop programs to gather, clean, analyze, and visualize data.",
      duration: "8 months",
      tags: ["python", "data", "programming"],
      officialUrl: "https://www.coursera.org/specializations/python",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-13T08:00:00.000Z"
    },
    {
      id: "lp-5",
      title: "Data Analysis with Excel",
      provider: "LinkedIn Learning",
      domain: "Data Science",
      level: "Intermediate",
      whatYouWillLearn: ["Excel", "Data Analysis", "Pivot Tables", "Data Visualization"],
      whatYouGet: ["Certificate of Completion", "Analytical skills"],
      description: "Master Excel tools and techniques for analyzing and visualizing data to make informed business decisions.",
      duration: "2 weeks",
      tags: ["excel", "data analysis", "visualization"],
      officialUrl: "https://www.linkedin.com/learning/paths/become-a-data-analyst",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-14T08:00:00.000Z"
    },
    {
      id: "lp-6",
      title: "The Web Developer Bootcamp 2024",
      provider: "Udemy",
      domain: "Web Dev",
      level: "Beginner",
      whatYouWillLearn: ["HTML", "CSS", "JS", "Node", "MongoDB"],
      whatYouGet: ["Certificate of Completion", "Full-stack projects"],
      description: "The only course you need to learn web development - HTML, CSS, JS, Node, and More!",
      duration: "74 hours",
      tags: ["webdev", "fullstack", "node"],
      officialUrl: "https://www.udemy.com/course/the-web-developer-bootcamp/",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-15T08:00:00.000Z"
    },
    {
      id: "lp-7",
      title: "Machine Learning Specialization",
      provider: "Coursera",
      domain: "AI/ML",
      level: "Intermediate",
      whatYouWillLearn: ["Machine Learning", "Python", "TensorFlow", "Algorithms"],
      whatYouGet: ["Specialization Certificate", "ML fundamentals"],
      description: "A foundational online program created in collaboration between DeepLearning.AI and Stanford Online.",
      duration: "2 months",
      tags: ["ml", "ai", "python"],
      officialUrl: "https://www.coursera.org/specializations/machine-learning-introduction",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-16T08:00:00.000Z"
    },
    {
      id: "lp-8",
      title: "CS50's Introduction to Computer Science",
      provider: "edX",
      domain: "Programming",
      level: "Beginner",
      whatYouWillLearn: ["C", "Python", "SQL", "Algorithms", "Data Structures"],
      whatYouGet: ["Certificate (Optional)", "CS fundamentals"],
      description: "An introduction to the intellectual enterprises of computer science and the art of programming.",
      duration: "12 weeks",
      tags: ["cs", "programming", "algorithms"],
      officialUrl: "https://www.edx.org/course/introduction-computer-science-harvardx-cs50x",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-17T08:00:00.000Z"
    },
    {
      id: "lp-9",
      title: "AI for Everyone",
      provider: "Coursera",
      domain: "AI/ML",
      level: "Beginner",
      whatYouWillLearn: ["Artificial Intelligence", "Machine Learning", "Data Science Workflow"],
      whatYouGet: ["Certificate", "AI Literacy"],
      description: "AI is not only for engineers. If you want your organization to become better at using AI, this is the course to tell everyone to take.",
      duration: "4 weeks",
      tags: ["ai", "basics", "business"],
      officialUrl: "https://www.coursera.org/learn/ai-for-everyone",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-18T08:00:00.000Z"
    },
    {
      id: "lp-10",
      title: "Google Digital Marketing & E-commerce",
      provider: "Google",
      domain: "Marketing",
      level: "Beginner",
      whatYouWillLearn: ["Digital Marketing", "E-commerce", "SEO", "Analytics"],
      whatYouGet: ["Professional Certificate", "Marketing skills"],
      description: "Learn the fundamentals of digital marketing and e-commerce to gain job-ready skills.",
      duration: "6 months",
      tags: ["marketing", "seo", "ecommerce"],
      officialUrl: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
      isApproved: true,
      createdBy: "admin-1",
      createdAt: "2026-04-19T08:00:00.000Z"
    }
  ]
};
