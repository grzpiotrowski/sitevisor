import {
  PlaneGeometry,
  MeshBasicMaterial,
  GridHelper,
} from 'three';
import { Plane } from './BaseTypes/Plane';

export class ReferencePlane extends Plane {
  public size: number;

  constructor(size: number = 20) {
    const geometry = new PlaneGeometry( size, size );
    geometry.rotateX( - Math.PI / 2 );
    super(geometry, new MeshBasicMaterial( { visible: false } ));
    this.size = size;
    const gridHelper = new GridHelper(size, size, 0x444444, 0x444444);
    this.add(gridHelper);
  }
}
