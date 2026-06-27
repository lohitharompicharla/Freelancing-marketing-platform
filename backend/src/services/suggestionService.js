const skillKeywords = {
  react: ["React", "JavaScript", "Frontend"],
  mobile: ["React Native", "UI/UX", "API Integration"],
  api: ["Node.js", "Express", "REST API"],
  design: ["Figma", "UI Design", "Branding"],
  dashboard: ["Data Visualization", "React", "Tailwind CSS"],
  ecommerce: ["React", "Node.js", "Payments", "MongoDB"]
};

const budgetHints = {
  Design: "₹15,000 - ₹40,000",
  "Web Dev": "₹40,000 - ₹120,000",
  "App Dev": "₹60,000 - ₹180,000",
  Marketing: "₹10,000 - ₹35,000"
};

export const suggestSkills = (description = "") => {
  const text = description.toLowerCase();
  const suggestions = new Set();

  Object.entries(skillKeywords).forEach(([keyword, skills]) => {
    if (text.includes(keyword)) {
      skills.forEach((skill) => suggestions.add(skill));
    }
  });

  return Array.from(suggestions);
};

export const suggestBudget = (category) => budgetHints[category] || "₹25,000 - ₹75,000";
