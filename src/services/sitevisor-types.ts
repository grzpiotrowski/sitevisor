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

export interface IIssue {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    creator: IUser;
    assignee?: IUser;
    object_id: number;
    object_type: string;
    project: string;
}