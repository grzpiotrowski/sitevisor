import type { IRoom } from "$lib/common/interfaces/IRoom";
import type { ISensor } from "$lib/common/interfaces/ISensor";

export interface IUser {
	username: string;
}

export interface LoggedInUser {
	username: string;
	token: string;
}

export interface IProject {
    id: number;
    name: string;
    owner: IUser;
    kafka_topics: string;
    rooms: IRoom[];
    sensors: ISensor[];
}
