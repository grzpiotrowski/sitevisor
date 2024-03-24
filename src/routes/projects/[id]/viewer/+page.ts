import { SitevisorService } from '../../../../services/sitevisor-service';
import type { Load } from '@sveltejs/kit';

export const ssr = false;

export const load: Load = async ({ params, url }) => {
	SitevisorService.checkPageRefresh();
	const projectId = params.id ?? ''; 
	const project = await SitevisorService.getProjectById(encodeURI(projectId));
	const posX = url.searchParams.get('posX');
	const posY = url.searchParams.get('posY');
	const posZ = url.searchParams.get('posZ');
	return {
	  project: project,
	  posX: posX,
	  posY: posY,
	  posZ: posZ,
	};
  };