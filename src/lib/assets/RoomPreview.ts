import {
  BoxGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

export class RoomPreview extends Mesh {
  private startPoint: Vector3;

  constructor(startPoint: Vector3) {
    const geometry = new BoxGeometry(0.1, 0.01, 0.1);
    const material = new MeshStandardMaterial({color: 0x1aff00, opacity: 0.5, transparent: true});
    super(geometry, material);

    this.startPoint = startPoint;
    this.position.copy(this.startPoint);
  }

  public update(endPoint: Vector3) {
    const sizeX = Math.abs(endPoint.x - this.startPoint.x);
    const sizeZ = Math.abs(endPoint.z - this.startPoint.z);
    const geometry = new BoxGeometry(sizeX, 0.01, sizeZ);
    this.geometry.dispose();
    this.geometry = geometry;
    this.position.set(
          (this.startPoint.x + endPoint.x) / 2,
          this.startPoint.y,
          (this.startPoint.z + endPoint.z) / 2);
  }
}