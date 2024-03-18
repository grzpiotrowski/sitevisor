import axios from "axios";
import type { ISensor } from "../lib/common/interfaces/ISensor";
import type { IRoom } from "../lib/common/interfaces/IRoom";
import type { IProject } from "../services/sitevisor-types";
import { loggedInUser } from "../stores";
import { browser } from '$app/environment';

export const SitevisorService = {
	baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:8080",

	async getRooms(projectId: string): Promise<IRoom[]> {
		try {
			const response = await axios.get(this.baseUrl + `/api/rooms/?project_id=${projectId}`);
			console.log(response.data)
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async createRoom(room: IRoom, projectId: string) {
		try {
            const roomData = {
                name: room.name,
                level: room.level,
				color: room.color,
                opacity: room.opacity,
                point1: { x: room.point1?.x, y: room.point1?.y, z: room.point1?.z },
                point2: { x: room.point2?.x, y: room.point2?.y, z: room.point2?.z },
                height: 3.0,
				project: projectId
            };
            await axios.post(`${this.baseUrl}/api/rooms/`, roomData);
		} catch (error) {
			console.error("Error creating a Room", error);
		}
	  },

	async getSensors(projectId: string): Promise<ISensor[]> {
		try {
			const response = await axios.get(this.baseUrl + `/api/sensors/?project_id=${projectId}`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async createSensor(sensor: ISensor, projectId: string) {
		try {
            const sensorData = {
                name: sensor.name,
                level: sensor.level,
                position: { x: sensor.position?.x, y: sensor.position?.y, z: sensor.position?.z },
				project: projectId
            };
            await axios.post(`${this.baseUrl}/api/sensors/`, sensorData);
		} catch (error) {
			console.error("Error creating a Sensor", error);
		}
	  },

	async getProjects(): Promise<IProject[]> {
		try {
			const response = await axios.get(this.baseUrl + "/api/projects");
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async getProjectById(id: string): Promise<IProject> {
		try {
			const response = await axios.get(this.baseUrl + `/api/projects/${id}`);
			return response.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	async deleteProject(id: string): Promise<void> {
		try {
			await axios.delete(`${this.baseUrl}/api/projects/${id}`);
		} catch (error) {
			console.error(`Error deleting Project with id ${id}`, error);
			return;
		}
	},

	async createProject(project: IProject) {
		try {
			await axios.post(`${this.baseUrl}/api/projects/`, project);
		} catch (error) {
			console.error("Error creating a Project", error);
		}
	},

	async register(username: string, password: string): Promise<boolean> {
		try {
			const userDetails = {
				username: username,
				password: password
			};
			await axios.post(this.baseUrl + "/api/register/", userDetails);
			return true;
		} catch (error) {
			return false;
		}
	},

	async login(username: string, password: string): Promise<boolean> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/login/`, { username, password });
			axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.access;
			if (response.data){
				loggedInUser.set({
					username: username,
					token: response.data.access,
				});
				localStorage.sitevisor = JSON.stringify({ username: username, token: response.data.access });
				return true;
			}
			return false;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	async logout() {
		loggedInUser.set({
			username: "",
			token: ""
		});
		axios.defaults.headers.common["Authorization"] = "";
		if (browser) {
			localStorage.removeItem("sitevisor");
		}
	},

	checkPageRefresh() {
		if (!axios.defaults.headers.common["Authorization"]) {
			const sitevisorCredentials = localStorage.sitevisor;
			if (sitevisorCredentials) {
				const savedUser = JSON.parse(sitevisorCredentials);
				loggedInUser.set({
					username: savedUser.username,
					token: savedUser.token
				});
				axios.defaults.headers.common["Authorization"] = "Bearer " + savedUser.token;
			}
		}
	},
};
