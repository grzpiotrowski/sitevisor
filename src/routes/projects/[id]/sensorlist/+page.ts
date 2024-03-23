import type { Load } from '@sveltejs/kit';
import { SitevisorService } from '../../../../services/sitevisor-service';

export const ssr = false;

export const load: Load = async ({ params }) => {
	SitevisorService.checkPageRefresh();
	const projectId = params.id ?? ''; 
	const project = await SitevisorService.getProjectById(encodeURI(projectId));
	return {
	  project: project,
	};
};