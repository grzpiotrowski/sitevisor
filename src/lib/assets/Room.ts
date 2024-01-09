import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

export class Room extends Mesh {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;

  constructor(color: number, opacity: number, name: string, level: number, point1: Vector3, point2: Vector3) {
    super();

    const sizeX = Math.abs(point2.x - point1.x);
    const sizeZ = Math.abs(point2.z - point1.z);
    const positionX = (point1.x + point2.x) / 2;
    const positionZ = (point1.z + point2.z) / 2;

    this.geometry = new BoxGeometry(sizeX, 3, sizeZ); // Height (Y) fixed for now
    this.material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
      transparent: true
    });
    this.position.set(positionX, 1.5, positionZ); // Set position; Y is half of height

    // Custom object properties
    this.userData = {
      name: name,
      level: level
    };
  }

  setMaterial(color: number, opacity: number) {
    this.material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
    });
    return this.material;
  }
}
