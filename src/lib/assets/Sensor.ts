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
  isSelected: boolean;

  constructor(id: string, name: string, device_id: string, level: number, position: Vector3) {
    super(position);

    this.geometry = new BoxGeometry(0.5, 0.5, 0.5);
    this.geometry.translate( 0, 0.25, 0 );
    this.material = new MeshStandardMaterial({
      color: 0xff0000,
    });
    this.position.set(position.x, position.y, position.z);

    // Custom object properties
    this.userData = {
      id: id,
      name: name,
      device_id: device_id,
      level: level,
      data: null
    };

    this.label = new SensorLabel(this.position, this);

    this.isSelected = false;
  }

  public update(sensorData: { value: number, unit: string } = { value: 0, unit: '' }) {
    this.userData.data = sensorData;
    this.label.update();
  }

  public setIsSelected(isSelected: boolean) {
    this.isSelected = isSelected;
    if (isSelected) {
      this.material = new MeshStandardMaterial({
        color: 0x00ff00,
      });
      this.label.element.style.visibility = 'visible';
    } else {
      this.material = new MeshStandardMaterial({
        color: 0xff0000,
      });
      this.label.element.style.visibility = 'hidden';
    }
  }

  public setIsLabelVisible(isLabelVisible: boolean) {
    if (isLabelVisible) {
      this.label.element.style.visibility = 'visible';
    } else {
      this.label.element.style.visibility = 'hidden';
    }
  }
}