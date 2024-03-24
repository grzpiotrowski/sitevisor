import type { Load } from "@sveltejs/kit";
import { SitevisorService } from "../../services/sitevisor-service";
export const ssr = false;

export const load: Load = async () => {
  SitevisorService.checkPageRefresh();
  const projects = await SitevisorService.getProjects();
  return {
    projects: projects,
  };
};
