import { SitevisorService } from "../../../services/sitevisor-service";
export const ssr = false;

export const load = async ({ params }) => {
  SitevisorService.checkPageRefresh();
  const sensor = await SitevisorService.getSensor(encodeURI(params.id));
  return {
    sensor: sensor,
  };
};
