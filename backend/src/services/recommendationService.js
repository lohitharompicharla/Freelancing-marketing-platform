const categorySkillMap = {
  "Web Dev": ["React", "Node.js", "JavaScript", "TypeScript", "MongoDB", "Express", "HTML", "CSS"],
  Design: ["Figma", "UI Design", "Branding", "UI/UX"],
  Backend: ["Node.js", "Express", "MongoDB", "PostgreSQL", "REST API", "GraphQL"],
  DevOps: ["AWS", "Docker", "Git"]
};

const normalizeSkills = (skills = []) =>
  [...new Set(skills.map((skill) => String(skill).trim().toLowerCase()).filter(Boolean))];

const scoreProject = (project, userSkills = []) => {
  const normalizedUserSkills = normalizeSkills(userSkills);
  const displayRequiredSkills = [...new Set((project.requiredSkills || []).map((skill) => String(skill).trim()).filter(Boolean))];
  const requiredSkills = normalizeSkills(displayRequiredSkills);
  const commonSkills = displayRequiredSkills.filter((skill) => normalizedUserSkills.includes(String(skill).trim().toLowerCase()));
  const categoryMatches = (categorySkillMap[project.category] || []).filter((skill) => normalizedUserSkills.includes(String(skill).trim().toLowerCase()));
  const skillCoverageScore = displayRequiredSkills.length
    ? Math.round((commonSkills.length / displayRequiredSkills.length) * 100)
    : 0;
  const categoryBoost = categoryMatches.length ? Math.min(15, categoryMatches.length * 5) : 0;
  const matchScore = Math.min(100, skillCoverageScore + categoryBoost);
  const recommendationReason = commonSkills.length
    ? `Matched on ${commonSkills.join(", ")}`
    : categoryMatches.length
      ? `Strong ${project.category.toLowerCase()} fit`
      : "General recommendation";

  return {
    id: project.id || project._id?.toString(),
    _id: project._id?.toString?.() || project.id || null,
    jobId: project.id || project._id?.toString(),
    title: project.title,
    category: project.category,
    description: project.description,
    requiredSkills: displayRequiredSkills,
    skills: displayRequiredSkills,
    status: project.status || "Open",
    matchScore,
    matchPercentage: matchScore,
    matchedSkills: commonSkills,
    missingSkills: displayRequiredSkills.filter((skill) => !commonSkills.includes(skill)),
    categoryMatches,
    recommendationReason
  };
};

export const buildProjectRecommendations = (projects, userSkills = []) =>
  projects
    .filter((project) => (project.status || "Open") === "Open")
    .map((project) => scoreProject(project, userSkills))
    .filter((project) => project.matchScore > 0)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 6);
