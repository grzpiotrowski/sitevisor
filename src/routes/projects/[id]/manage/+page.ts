import { SitevisorService } from "../../../../services/sitevisor-service";
export const ssr = false;

export const load = async ({ params }) => {
  SitevisorService.checkPageRefresh();
  const project = await SitevisorService.getProjectById(encodeURI(params.id));
  return {
    project: project,
  };
};
