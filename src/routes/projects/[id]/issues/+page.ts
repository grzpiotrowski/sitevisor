import type { Load } from '@sveltejs/kit';
import { SitevisorService } from '../../../../services/sitevisor-service';
import type { IIssue, IProject } from '../../../../services/sitevisor-types';

export const ssr = false;

export const load: Load = async ({ params }) => {
	SitevisorService.checkPageRefresh();
	const projectId = params.id ?? ''; 
	const project: IProject = await SitevisorService.getProjectById(encodeURI(projectId));
	const issues: IIssue[] = await SitevisorService.getIssues({project_id: projectId});
	return {
	  project: project,
	  issues: issues,
	};
};