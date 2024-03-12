import { Scene, Vector3 } from 'three';
import { Room } from '../assets/Room';
import { Sensor } from '$lib/assets/Sensor';
import { newSensor, newRoom } from '../../stores';
import { get } from "svelte/store";
import type { IRoom } from '../common/interfaces/IRoom';
import type { ISensor } from '$lib/common/interfaces/ISensor';
import type { Viewer } from '$lib/viewer';

/**
 * ObjectFactory is a class responsible for creating various objects in the scene.
 */
export class ObjectFactory {
  private viewer: Viewer;
  private scene: Scene;

  constructor(viewer: Viewer, scene: Scene) {
    this.viewer = viewer;
    this.scene = scene;
  }

  createRoom(options: IRoom): Room | undefined {
    if (options.point1 != null && options.point2 != null) {
      const room = new Room(options.color, options.opacity, options.name, options.level, options.point1, options.point2);
      this.scene.add(room);
      this.viewer.rooms.push(room);
      return room;
    }
    return undefined;
  }

  /**
   * Creates a Room object from two points and adds it to the scene.
   */
  createRoomFromPoints(roomInsertionPoints: Vector3[]): IRoom {
    if (roomInsertionPoints.length !== 2) {
      throw new Error("createRoomFromPoints requires exactly two points");
    }
    const roomData: IRoom = get(newRoom);
    roomData.point1 = roomInsertionPoints[0];
    roomData.point2 = roomInsertionPoints[1];

    this.createRoom(roomData);
    return roomData;
  }

  createSensor(options: ISensor): Sensor | undefined {
    if (options.position != null) {
      const sensor = new Sensor(options.name, options.level, options.position);
      this.scene.add(sensor);
      this.scene.add(sensor.label);
      this.viewer.sensors.push(sensor);
      return sensor;
    }
    return undefined;
    
  }

  createSensorAtPoint(sensorPosition: Vector3): ISensor {
    const sensorData: ISensor = get(newSensor);
    sensorData.position = sensorPosition;
    this.createSensor(sensorData);
    return sensorData;
  }
  
}
