const normalizeSkill = (skill = "") => String(skill).trim().toLowerCase();

const uniqueNormalizedSkills = (skills = []) => [...new Set((skills || []).map(normalizeSkill).filter(Boolean))];

const getMatchedSkills = (requiredSkills = [], userSkills = []) => {
  const userSkillSet = new Set(uniqueNormalizedSkills(userSkills));
  return (requiredSkills || []).filter((skill) => userSkillSet.has(normalizeSkill(skill)));
};

export const calculateFreelancerMatch = (project, freelancer) => {
  const requiredSkills = uniqueNormalizedSkills(project.requiredSkills);
  const freelancerSkills = uniqueNormalizedSkills([...(freelancer.skills || []), ...(freelancer.resumeData?.skills || [])]);
  const matchedSkills = getMatchedSkills(project.requiredSkills, freelancerSkills);
  const skillCoverage = requiredSkills.length ? matchedSkills.length / requiredSkills.length : 0;
  const experienceScore = project.experienceLevel === freelancer.experienceLevel ? 20 : 10;
  const completedProjectsScore = Math.min(Number(freelancer.completedProjects || 0) * 4, 12);
  const ratingScore = Math.min(Number(freelancer.rating || 0) * 2, 8);
  const matchPercentage = Math.round(skillCoverage * 60 + experienceScore + completedProjectsScore + ratingScore);

  return {
    matchPercentage: Math.min(matchPercentage, 100),
    matchedSkills,
    missingSkills: (project.requiredSkills || []).filter((skill) => !matchedSkills.includes(skill))
  };
};

export const getRecommendedFreelancers = (project, freelancers) =>
  freelancers
    .map((freelancer) => {
      const match = calculateFreelancerMatch(project, freelancer);
      return {
        ...freelancer,
        ...match
      };
    })
    .sort((left, right) => right.matchPercentage - left.matchPercentage)
    .slice(0, 5);

export const getRecommendedProjects = (freelancer, projects) =>
  projects
    .filter((project) => project.status === "Open")
    .map((project) => {
      const match = calculateFreelancerMatch(project, freelancer);
      return {
        ...project,
        ...match
      };
    })
    .sort((left, right) => right.matchPercentage - left.matchPercentage)
    .slice(0, 6);
