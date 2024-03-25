import type { Load } from '@sveltejs/kit';
import { SitevisorService } from '../../../../../services/sitevisor-service';
import type { IIssue } from '../../../../../services/sitevisor-types';

export const ssr = false;

export const load: Load = async ({ params }) => {
	SitevisorService.checkPageRefresh();
	const projectId = params.id ?? '';
	const issueId = params.issueid ?? ''; 
	const issue: IIssue = await SitevisorService.getIssueById(issueId);
	return {
	  issue: issue,
	  projectId: projectId,
	};
};