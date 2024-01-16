import {
  BoxGeometry,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { Volume } from './BaseTypes/Volume';

export class Room extends Volume {
  constructor(color: number, opacity: number, name: string, level: number, point1: Vector3, point2: Vector3) {

    const sizeX = Math.abs(point2.x - point1.x);
    const sizeZ = Math.abs(point2.z - point1.z);
    const height = 3 // Height (Y) fixed for now
    const position = new Vector3((point1.x + point2.x) / 2, height / 2, (point1.z + point2.z) / 2);

    const geometry = new BoxGeometry(sizeX, height, sizeZ); 
    const material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
      transparent: true
    });
    position.set(position.x, height/2, position.z);

    super(geometry, material, position);

    // Custom object properties
    this.userData = {
      name: name,
      level: level
    };
  }
}
