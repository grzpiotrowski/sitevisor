import { writable } from "svelte/store";
import type { LoggedInUser } from "./services/sitevisor-types";
import type { ISensor } from "$lib/common/interfaces/ISensor";
import type { IRoom } from "$lib/common/interfaces/IRoom";

export const loggedInUser = writable<LoggedInUser>();

// Local state for object creation
export const newSensor = writable<ISensor>();
export const newRoom = writable<IRoom>();