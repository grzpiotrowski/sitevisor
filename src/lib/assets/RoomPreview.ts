import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { DimensionLabel } from './DimensionLabel';

export class RoomPreview extends Mesh {
  public startPoint: Vector3;
  public endPoint: Vector3;
  public label: DimensionLabel;

  constructor(startPoint: Vector3) {
    const geometry = new BoxGeometry(0.1, 0.01, 0.1);
    const material = new MeshStandardMaterial({color: 0x1aff00, opacity: 0.5, transparent: true});
    super(geometry, material);

    this.startPoint = startPoint;
    this.position.copy(this.startPoint.clone());
    this.endPoint = this.startPoint.clone();
    
    this.label = new DimensionLabel(this.endPoint);
  }

  public update(endPoint: Vector3) {
    this.endPoint = endPoint;
    const sizeX = Math.abs(endPoint.x - this.startPoint.x);
    const sizeZ = Math.abs(endPoint.z - this.startPoint.z);
    this.geometry.dispose();
    this.geometry = new BoxGeometry(sizeX, 0.01, sizeZ);
    this.position.set(
          (this.startPoint.x + endPoint.x) / 2,
          this.startPoint.y,
          (this.startPoint.z + endPoint.z) / 2);
    this.label.update(this.endPoint, this.startPoint, this.endPoint);
  }
}