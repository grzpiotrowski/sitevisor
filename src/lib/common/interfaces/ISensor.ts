import { Vector3 } from "three";

/**
 * Interface representing the properties required to create a Sensor.
 */
export interface ISensor {
  name: string;
  level: number;
  position: Vector3 | null;
}