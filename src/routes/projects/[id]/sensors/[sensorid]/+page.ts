import type { Load } from "@sveltejs/kit";
import { SitevisorService } from "../../../../../services/sitevisor-service";
import type { IIssue, IProject } from "../../../../../services/sitevisor-types";
import type { ISensor } from "$lib/common/interfaces/ISensor";
export const ssr = false;

export const load: Load = async ({ params }) => {
  SitevisorService.checkPageRefresh();
  const sensorId: string = params.sensorid ?? ''; 
  const projectId: string = params.id ?? '';
  const project: IProject = await SitevisorService.getProjectById(encodeURI(projectId));
  const sensor: ISensor = await SitevisorService.getSensor(encodeURI(sensorId));
  const issues: IIssue[] = await SitevisorService.getIssues({object_type: "sensor", object_id: sensor.id})
  return {
    sensor: sensor,
    issues: issues,
    project: project,
  };
};
