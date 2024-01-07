import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
} from 'three';

export class Room extends Mesh {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;

  constructor(color: number, opacity: number) {
    super();
    this.geometry = new BoxGeometry();
    const material = this.setMaterial(color, opacity);
    this.material = material;
  }

  setMaterial(color: number, opacity: number) {
    this.material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
      transparent: true
    });
    return this.material;
  }
}
