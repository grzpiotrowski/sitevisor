import type { Load } from "@sveltejs/kit";
import { SitevisorService } from "../../../../../services/sitevisor-service";
import type { IIssue, IProject } from "../../../../../services/sitevisor-types";
import type { IRoom } from "$lib/common/interfaces/IRoom";
export const ssr = false;

export const load: Load = async ({ params }) => {
  SitevisorService.checkPageRefresh();
  const roomId: string = params.roomid ?? '';
  const projectId: string = params.id ?? '';
  const project: IProject = await SitevisorService.getProjectById(encodeURI(projectId));
  const room: IRoom = await SitevisorService.getRoom(encodeURI(roomId));
  const issues: IIssue[] = await SitevisorService.getIssues({object_type: "room", object_id: room.id})
  return {
    room: room,
    issues: issues,
    project: project,
  };
};
