import { Scene } from 'three';
import { Room } from '$lib/assets/Room';
import { Sensor } from '$lib/assets/Sensor';
import type { IRoom } from '$lib/common/interfaces/IRoom';
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
      const room = new Room(options.id, options.color, options.opacity, options.name, options.level, options.point1, options.point2);
      this.scene.add(room);
      this.viewer.rooms.set(room.userData.id, room);
      return room;
    }
    return undefined;
  }

  createSensor(options: ISensor): Sensor | undefined {
    if (options.position != null) {
      const sensor = new Sensor(options.id, options.name, options.device_id, options.level, options.type.name, options.position);
      this.scene.add(sensor);
      this.scene.add(sensor.label);
      this.viewer.sensors.set(sensor.userData.device_id, sensor);
      return sensor;
    }
    return undefined;
    
  }
  
}
