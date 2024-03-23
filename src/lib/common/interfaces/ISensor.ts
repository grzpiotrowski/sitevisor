import { Vector3 } from "three";

/**
 * Interface representing the properties required to create a Sensor.
 */
export interface ISensor {
  id: string;
  name: string;
  device_id: string;
  level: number;
  position: Vector3 | null;
  type: ISensorType;
}

export interface ISensorType {
  id: number;
  name: string;
  project: number;
}