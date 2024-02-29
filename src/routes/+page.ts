import { SitevisorService } from '../services/sitevisor-service.js';

export const ssr = false;

export const load = async () => {
	const rooms = await SitevisorService.getRooms();
    console.log(rooms);
	return {
		rooms: rooms,
	};
};