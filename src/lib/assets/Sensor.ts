import {
    BoxGeometry,
    MeshStandardMaterial,
    Vector3,
  } from 'three';
import { Point3D } from './BaseTypes/Point3D';
import { SensorLabel } from './SensorLabel';
import type { Room } from './Room';
  
export class Sensor extends Point3D {
  material: MeshStandardMaterial;
  geometry: BoxGeometry;
  label: SensorLabel;
  isSelected: boolean;

  isGlowing: boolean = false;
  glowStartTime: number = 0;
  glowDuration: number = 500;

  constructor(id: string, name: string, device_id: string, level: number, type: string, project: number, position: Vector3, room: string | null) {
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
      type: type,
      project: project,
      room: room,
      data: null
    };

    this.label = new SensorLabel(this.position, this);

    this.isSelected = false;
  }

  public update(sensorData: { value: number, unit: string } = { value: 0, unit: '' }) {
    this.userData.data = sensorData;

    this.isGlowing = true;
    this.glowStartTime = performance.now();
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

  public checkIsInsideRoom(rooms: Map<string, Room>): Room | undefined {
    // Add a small height (skin width) for the detection purposes
    // Sensor is exactly on the floor of the room so it could happen that its not detected inside due to float
    const skinWidth: number = 0.001;
    const sensorPosition = this.position.clone();
    sensorPosition.setY(sensorPosition.y + skinWidth);

    for (const [room_id, room] of rooms) {
      room.geometry.computeBoundingBox();
      // Creating a copy of the bounding box so it is not mutated with each check
      const bbox = room.geometry.boundingBox?.clone()
      bbox?.translate(room.position);
      if (bbox?.containsPoint(sensorPosition)) {
        return room;
      }
    }
  }

  public setRoomEntry(roomId: string | null) {
    this.userData.room = roomId;
  }
}