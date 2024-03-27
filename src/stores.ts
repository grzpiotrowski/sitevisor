import { readable, writable } from "svelte/store";
import type { LoggedInUser } from "./services/sitevisor-types";
import type { ISensor } from "$lib/common/interfaces/ISensor";
import type { IRoom } from "$lib/common/interfaces/IRoom";
import type { Sensor } from "$lib/assets/Sensor";
import type { Room } from "$lib/assets/Room";

export const loggedInUser = writable<LoggedInUser>();

// Local state for object creation
export const newSensor = writable<ISensor>();
export const newRoom = writable<IRoom>();
export const selectedSensorStore = writable<Sensor | null>(null);
export const selectedRoomStore = writable<Room | null>(null);

// Used globally in the app, simpler than enums in the database
export const statusOptionsStore = readable(new Map<string, string>([
    ['opened', 'Opened'],
    ['in_progress', 'In Progress'],
    ['resolved', 'Resolved'],
    ['closed', 'Closed']
  ]));
  
  export const objectTypesStore = readable(new Map<string, string>([
    ['sensor', 'Sensor'],
    ['room', 'Room']
  ]));
  