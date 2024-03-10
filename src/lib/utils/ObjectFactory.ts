import { Scene, Vector3 } from 'three';
import { Room } from '../assets/Room';
import { Sensor } from '$lib/assets/Sensor';
import type { IRoom } from '../common/interfaces/IRoom';
import type { ISensor } from '$lib/common/interfaces/ISensor';

/**
 * ObjectFactory is a class responsible for creating various objects in the scene.
 */
export class ObjectFactory {
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  createRoom(options: IRoom): Room {
    const room = new Room(options.color, options.opacity, options.name, options.level, options.point1, options.point2);
    this.scene.add(room);
    return room;
  }

  /**
   * Creates a Room object from two points and adds it to the scene.
   */
  createRoomFromPoints(roomInsertionPoints: Vector3[]): IRoom {
    if (roomInsertionPoints.length !== 2) {
      throw new Error("createRoomFromPoints requires exactly two points");
    }

    const options: IRoom = {
      color: this.getRandomHexColor(),
      opacity: 0.5,
      name: "New Room",
      level: 0,
      point1: roomInsertionPoints[0],
      point2: roomInsertionPoints[1]
    };

    this.createRoom(options);
    return options;
  }

  createSensor(options: ISensor): Sensor {
    const sensor = new Sensor(options.name, options.level, options.position);
    this.scene.add(sensor);
    this.scene.add(sensor.label);
    return sensor;
  }

  createSensorAtPoint(sensorPosition: Vector3): ISensor {
    const options: ISensor = {
      name: "New Sensor",
      level: 0,
      position: sensorPosition,
    };
    this.createSensor(options);
    return options;
  }

  private getRandomHexColor(): number {
    return Math.floor(Math.random() * 16777215);
  }
  
}
