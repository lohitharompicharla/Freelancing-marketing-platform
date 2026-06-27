export const getFreelancerBadges = (user) => {
  const badges = [];

  if ((user.rating || 0) >= 4.5) {
    badges.push("Top Rated");
  }

  if ((user.completedProjects || 0) <= 1) {
    badges.push("Beginner");
  }

  if ((user.rating || 0) >= 4 && (user.completedProjects || 0) >= 2) {
    badges.push("Internship Eligible");
  }

  return badges;
};
