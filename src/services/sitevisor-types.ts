export interface User {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	_id: string;
}

export interface LoggedInUser {
	username: string;
	token: string;
	_id: string;
}

export interface IProject {
	name: string;
	id: string;
}
