import type { Sensor } from "$lib/assets/Sensor";
import type { Vector3 } from "three/src/Three.js";

export function getRandomHexColor(): number {
  return Math.floor(Math.random() * 16777215);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
  };

  return date.toLocaleTimeString('en-IE', options);
}

export function sensorMapToReadingPositionArray(sensorMap: Map<string, Sensor>, sensorTypeName: string): Array<[Vector3, number]> {
  return Array.from(sensorMap.values())
    .filter(sensor => sensor.userData.type === sensorTypeName)
    .map(sensor => [
      sensor.position,
      sensor.userData.data?.value
    ]);
}