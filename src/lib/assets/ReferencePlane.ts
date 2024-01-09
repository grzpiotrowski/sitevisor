import {
  Raycaster,
  Vector3,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  GridHelper,
} from 'three';

export class ReferencePlane extends Mesh {

  constructor(size: number = 20) {
    const geometry = new PlaneGeometry( size, size );
    geometry.rotateX( - Math.PI / 2 );
    super(geometry, new MeshBasicMaterial( { visible: false } ));
    const gridHelper = new GridHelper(size, size, 0x888888, 0x444444);
    this.add(gridHelper);
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
