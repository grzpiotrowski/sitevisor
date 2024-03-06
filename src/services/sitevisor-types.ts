import type { IRoom } from "$lib/common/interfaces/IRoom";
import type { ISensor } from "$lib/common/interfaces/ISensor";

export interface IUser {
	username: string;
	id: string;
}

export interface LoggedInUser {
	username: string;
	token: string;
	_id: string;
}

export interface IProject {
    id: number;
    name: string;
    owner: IUser;
    rooms: IRoom[];
    sensors: ISensor[];
}
