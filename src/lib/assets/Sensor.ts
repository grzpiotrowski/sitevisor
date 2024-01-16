import {
    BoxGeometry,
    Mesh,
    MeshStandardMaterial,
    Vector3,
  } from 'three';
  
export class Sensor extends Mesh {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;

  constructor(name: string, level: number, position: Vector3) {
    super();

    this.geometry = new BoxGeometry(0.5, 0.5, 0.5);
    this.geometry.translate( 0, 0.25, 0 );
    this.material = new MeshStandardMaterial({
      color: 0xff0000,
    });
    this.position.set(position.x, position.y, position.z);

    // Custom object properties
    this.userData = {
      name: name,
      level: level
    };
  }
}