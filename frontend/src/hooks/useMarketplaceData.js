import { useEffect, useState } from "react";
import { demoCourses, demoInternships, demoProjects, demoUsers } from "../data/mockData";
import { api } from "../services/api";

export const useMarketplaceData = () => {
  const [data, setData] = useState({
    users: demoUsers,
    projects: demoProjects,
    courses: demoCourses,
    internships: demoInternships,
    loading: true,
    apiConnected: false
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [users, projects, courses, internships] = await Promise.all([
          api.getUsers(),
          api.getProjects(),
          api.getCourses(),
          api.getInternships()
        ]);

        setData({
          users,
          projects,
          courses,
          internships,
          loading: false,
          apiConnected: true
        });
      } catch (_error) {
        setData((current) => ({ ...current, loading: false, apiConnected: false }));
      }
    };

    load();
  }, []);

  return data;
};
