import { writable } from "svelte/store";
import type { LoggedInUser } from "./services/sitevisor-types";

export const loggedInUser = writable<LoggedInUser>();