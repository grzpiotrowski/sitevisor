import {
  Mesh,
  Vector3
} from 'three';

export abstract class Point3D extends Mesh {
  constructor(position: Vector3) {
    super();
    this.position.copy(position);
  }
}
