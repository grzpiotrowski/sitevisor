import type { Load } from "@sveltejs/kit";
import { SitevisorService } from "../../../services/sitevisor-service";
export const ssr = false;

export const load: Load = async ({ params }) => {
  SitevisorService.checkPageRefresh();
  const sensorId = params.id ?? ''; 
  const sensor = await SitevisorService.getSensor(encodeURI(sensorId));
  return {
    sensor: sensor,
  };
};
