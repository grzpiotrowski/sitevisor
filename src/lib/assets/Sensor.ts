import {
    BoxGeometry,
    MeshStandardMaterial,
    Vector3,
  } from 'three';
import { Point3D } from './BaseTypes/Point3D';
import { SensorLabel } from './SensorLabel';
  
export class Sensor extends Point3D {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;
  label: SensorLabel;

  constructor(name: string, device_id: string, level: number, position: Vector3) {
    super(position);

    this.geometry = new BoxGeometry(0.5, 0.5, 0.5);
    this.geometry.translate( 0, 0.25, 0 );
    this.material = new MeshStandardMaterial({
      color: 0xff0000,
    });
    this.position.set(position.x, position.y, position.z);

    // Custom object properties
    this.userData = {
      name: name,
      device_id: device_id,
      level: level,
      data: null
    };

    this.label = new SensorLabel(this.position, this);
  }

  public update(sensorData: { value: number, unit: string } = { value: 0, unit: '' }) {
    this.userData.data = sensorData;
    this.label.update();
  }
}