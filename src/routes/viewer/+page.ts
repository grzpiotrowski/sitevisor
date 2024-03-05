import { SitevisorService } from '../../services/sitevisor-service';

export const ssr = false;

export const load = async () => {
	SitevisorService.checkPageRefresh();
	const rooms = await SitevisorService.getRooms();
    console.log(rooms);
	return {
		rooms: rooms,
	};
};