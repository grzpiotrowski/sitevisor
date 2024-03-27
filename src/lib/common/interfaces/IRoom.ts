import { Vector3 } from "three";
import type { ISensor } from "./ISensor";

/**
 * Interface representing the properties required to create a Room.
 */
export interface IRoom {
  id: string;
  name: string;
  level: number;
  color: number;
  opacity: number;
  point1: Vector3 | null;
  point2: Vector3 | null;
  project: number;
  sensors: string[];
}