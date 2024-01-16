import {
  Mesh,
  PlaneGeometry,
  Material,
  Raycaster,
  Vector3
} from 'three';

export abstract class Plane extends Mesh {
  constructor(geometry: PlaneGeometry, material: Material) {
    super(geometry, material);
  }

  getIntersectionPoint(raycaster: Raycaster): Vector3 | null {
    const intersects = raycaster.intersectObject(this, false);
    if (intersects.length > 0) {
      return intersects[0].point;
    } else {
      return null;
    }
  }
}