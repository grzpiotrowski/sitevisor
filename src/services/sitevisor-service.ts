import axios from "axios";
import type { ISensor, ISensorType } from "../lib/common/interfaces/ISensor";
import type { IRoom } from "../lib/common/interfaces/IRoom";
import type { IIssue, IProject } from "../services/sitevisor-types";
import { loggedInUser } from "../stores";
import { browser } from '$app/environment';

export const SitevisorService = {
	baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:8080",

	async getTopics(): Promise<string[]> {
		try {
			const response = await axios.get(this.baseUrl + `/api/kafka-proxy`);
			//const response = await axios.get("http://localhost:8080" + `/topics`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async getSensorTypes(projectId: string): Promise<ISensorType[]> {
		try {
			const response = await axios.get(this.baseUrl + `/api/sensortypes/?project_id=${projectId}`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async addSensorType(sensorTypeData: ISensorType): Promise<ISensorType | undefined> {
		try {
			const url = `${this.baseUrl}/api/sensortypes/`;
			const response = await axios.post(url, sensorTypeData);
	
			console.log("Sensor Type created successfully");
			if (response.data) {
				return response.data as Promise<ISensorType>;
			}
		} catch (error) {
			console.error(`Error creating SensorType: ${sensorTypeData.name}`, error);
		}
	},

	async deleteSensorType(id: string): Promise<void> {
		try {
			await axios.delete(`${this.baseUrl}/api/sensortypes/${id}`);
		} catch (error) {
			console.error(`Error deleting SensorType with id ${id}`, error);
			return;
		}
	},

	async getRoom(id: string): Promise<IRoom> {
		try {
			const response = await axios.get(this.baseUrl + `/api/rooms/${id}`);
			return response.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	async updateRoom(id: string, updatedRoomData: Partial<IRoom>): Promise<void> {
		try {
			const url = `${this.baseUrl}/api/rooms/${id}/`;
			await axios.patch(url, updatedRoomData);
	
			console.log("Room updated successfully");
		} catch (error) {
			console.error(`Error updating Room with id: ${id}`, error);
		}
	},

	async getRooms(projectId: string): Promise<IRoom[]> {
		try {
			const response = await axios.get(this.baseUrl + `/api/rooms/?project_id=${projectId}`);
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async createRoom(room: IRoom, projectId: string): Promise<IRoom | undefined> {
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
            const response = await axios.post(`${this.baseUrl}/api/rooms/`, roomData);
			if (response.data) {
				return response.data as Promise<IRoom>;
			}
		} catch (error) {
			console.error("Error creating a Room", error);
			return undefined;
		}
	},

	async deleteRoom(id: string): Promise<void> {
		try {
			await axios.delete(`${this.baseUrl}/api/rooms/${id}`);
		} catch (error) {
			console.error(`Error deleting Room with id ${id}`, error);
			return;
		}
	},

	async getSensor(id: string): Promise<ISensor> {
		try {
			const response = await axios.get(this.baseUrl + `/api/sensors/${id}`);
			return response.data;
		} catch (error) {
			console.log(error);
			throw error;
		}
	},

	async updateSensor(id: string, updatedSensorData: Partial<ISensor>): Promise<void> {
		try {
			const url = `${this.baseUrl}/api/sensors/${id}/`;
			await axios.patch(url, updatedSensorData);
	
			console.log("Sensor updated successfully");
		} catch (error) {
			console.error(`Error updating Sensor with id: ${id}`, error);
		}
	},

	async getSensors(queryParams: Record<string, string | undefined>): Promise<ISensor[]> {
		try {
			let url = `${this.baseUrl}/api/sensors/`;
	
			const searchParams = new URLSearchParams();
			Object.keys(queryParams).forEach(key => {
				if (queryParams[key] !== undefined) {
					searchParams.append(key, queryParams[key]!);
				}
			});
	
			if (Array.from(searchParams).length > 0) {
				url += `?${searchParams.toString()}`;
			}
	
			const response = await axios.get(url);
			return response.data;
		} catch (error) {
			console.error("Error fetching sensors", error);
			return [];
		}
	},

	async createSensor(sensor: ISensor, projectId: string): Promise<ISensor | undefined> {
		try {
            const sensorData = {
                name: sensor.name,
				device_id: sensor.device_id,
                level: sensor.level,
				type_id: sensor.type.id,
                position: { x: sensor.position?.x, y: sensor.position?.y, z: sensor.position?.z },
				project: projectId
            };
            const response = await axios.post(`${this.baseUrl}/api/sensors/`, sensorData);
			if (response.data) {
				return response.data as Promise<ISensor>;
			}
		} catch (error) {
			console.error("Error creating a Sensor", error);
			return undefined;
		}
	},

	async deleteSensor(id: string): Promise<void> {
		try {
			await axios.delete(`${this.baseUrl}/api/sensors/${id}`);
		} catch (error) {
			console.error(`Error deleting Sensor with id ${id}`, error);
			return;
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

	async updateProject(id: string, updatedProjectData: Partial<IProject>): Promise<void> {
		try {
			const url = `${this.baseUrl}/api/projects/${id}/`;
			await axios.put(url, updatedProjectData);
	
			console.log("Project updated successfully");
		} catch (error) {
			console.error(`Error updating Project with id: ${id}`, error);
		}
	},

	async createProject(project: IProject): Promise<IProject | undefined> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/projects/`, project);
			if (response.data) {
				return response.data as Promise<IProject>;
			}
		} catch (error) {
			console.error("Error creating a Project", error);
		}
	},

	async createIssue(issueData: Partial<IIssue>, projectId: string): Promise<IIssue | undefined> {
		try {
			const issuePayload = {
				...issueData,
				project: projectId
			};
			const response = await axios.post(`${this.baseUrl}/api/issues/`, issuePayload);
			console.log("Issue created successfully");
			if (response.data) {
				return response.data as Promise<IIssue>;
			}
		} catch (error) {
			console.error("Error creating an Issue", error);
		}
	},
	
	async updateIssue(id: string, updatedIssueData: Partial<IIssue>): Promise<void> {
		try {
			const url = `${this.baseUrl}/api/issues/${id}/`;
			await axios.patch(url, updatedIssueData);
			console.log("Issue updated successfully");
		} catch (error) {
			console.error(`Error updating Issue with id: ${id}`, error);
		}
	},
	
	async deleteIssue(id: string): Promise<void> {
		try {
			await axios.delete(`${this.baseUrl}/api/issues/${id}`);
			console.log("Issue deleted successfully");
		} catch (error) {
			console.error(`Error deleting Issue with id ${id}`, error);
		}
	},
	
	async getIssueById(id: string): Promise<IIssue> {
		try {
			const response = await axios.get(`${this.baseUrl}/api/issues/${id}`);
			return response.data;
		} catch (error) {
			console.error(`Error fetching Issue with id ${id}`, error);
			throw error;
		}
	},
	
	async getIssues(queryParams: Record<string, string | undefined>): Promise<IIssue[]> {
		try {
			let url = `${this.baseUrl}/api/issues/`;
	
			// Convert queryParams object to URL search parameters
			const searchParams = new URLSearchParams();
			Object.keys(queryParams).forEach(key => {
				if (queryParams[key] !== undefined) {
					searchParams.append(key, queryParams[key]!);
				}
			});
	
			// Append search parameters to the URL if any exist
			if (Array.from(searchParams).length > 0) {
				url += `?${searchParams.toString()}`;
			}
	
			const response = await axios.get(url);
			return response.data;
		} catch (error) {
			console.error("Error fetching issues", error);
			return [];
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
