import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
} from 'three';

export class Room extends Mesh {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;

  constructor(color: number, opacity: number, name: string, level: number) {
    super();
    this.geometry = new BoxGeometry();
    this.material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
      transparent: true
    });

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
