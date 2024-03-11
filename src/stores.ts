import { writable } from "svelte/store";
import type { LoggedInUser } from "./services/sitevisor-types";
import type { ISensor } from "$lib/common/interfaces/ISensor";

export const loggedInUser = writable<LoggedInUser>();

// Local state for sensor data
export const newSensor = writable<ISensor>();