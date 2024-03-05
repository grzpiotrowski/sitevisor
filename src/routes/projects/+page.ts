import { SitevisorService } from "../../services/sitevisor-service";
export const ssr = false;

export const load = async () => {
  SitevisorService.checkPageRefresh();
  const projects = await SitevisorService.getProjects();
  return {
    projects: projects,
  };
};
