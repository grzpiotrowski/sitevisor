import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3
} from 'three';

export abstract class Volume extends Mesh {
  constructor(geometry: BoxGeometry, material: MeshStandardMaterial, position: Vector3) {
    super(geometry, material);
    this.position.copy(position);
  }

  setMaterial(color: number, opacity: number) {
    this.material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
    });
    return this.material;
  }
}
