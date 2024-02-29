import axios from "axios";
import type { ISensor } from "../lib/common/interfaces/ISensor";
import type { IRoom } from "../lib/common/interfaces/IRoom";

export const SitevisorService = {
	baseUrl: "http://localhost:4000",

	async getRooms(): Promise<IRoom[]> {
		try {
			const response = await axios.get(this.baseUrl + "/api/rooms");
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async createRoom(room: IRoom) {
		try {
            const roomData = {
                name: room.name,
                level: room.level,
				color: room.color,
                opacity: room.opacity,
                point1: { x: room.point1.x, y: room.point1.y, z: room.point1.z },
                point2: { x: room.point2.x, y: room.point2.y, z: room.point2.z },
                height: 3.0
            };
            await axios.post(`${this.baseUrl}/api/rooms/`, roomData);
		} catch (error) {
			console.error("Error creating a Room", error);
		}
	  },

	  async getSensors(): Promise<ISensor[]> {
		try {
			const response = await axios.get(this.baseUrl + "/api/sensors");
			return response.data;
		} catch (error) {
			return [];
		}
	},

	async createSensor(sensor: ISensor) {
		try {
            const sensorData = {
                name: sensor.name,
                level: sensor.level,
                position: { x: sensor.position.x, y: sensor.position.y, z: sensor.position.z },
            };
            await axios.post(`${this.baseUrl}/api/sensors/`, sensorData);
		} catch (error) {
			console.error("Error creating a Sensor", error);
		}
	  },
};
