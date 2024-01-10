import { Scene, Vector3 } from 'three';
import { Room } from '../assets/Room';
import type { IRoom } from '../common/interfaces/IRoom';


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
  createRoomFromPoints(roomInsertionPoints: Vector3[]): Room {
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

    return this.createRoom(options);
  }

  private getRandomHexColor(): number {
    return Math.floor(Math.random() * 16777215);
  }
  
}
