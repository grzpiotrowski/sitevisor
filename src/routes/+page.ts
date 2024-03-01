import { SitevisorService } from '../services/sitevisor-service';

export const ssr = false;

export const load = async () => {
	const rooms = await SitevisorService.getRooms();
    console.log(rooms);
	return {
		rooms: rooms,
	};
};