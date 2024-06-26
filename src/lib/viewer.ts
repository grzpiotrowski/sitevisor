import {
  Color,
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AxesHelper,
  Raycaster,
  Vector2,
  Vector3,
  Object3D,
  type Intersection,
  type Object3DEventMap,
  BoxHelper,
} from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Room } from './assets/Room';
import { Sensor } from './assets/Sensor';
import { newSensor, newRoom, selectedSensorStore, selectedRoomStore } from '../stores';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReferencePlane } from './assets/ReferencePlane';
import { PointerHelper } from './assets/PointerHelper';
import { ObjectFactory } from './utils/ObjectFactory';

import { SitevisorService } from '../services/sitevisor-service';
import { RoomPreview } from './assets/RoomPreview';
import { get } from 'svelte/store';
import type { ISensor } from './common/interfaces/ISensor';
import type { IRoom } from './common/interfaces/IRoom';
import { Heatmap } from './assets/Heatmap';

export class Viewer {
  private projectId: string;
  private canvasElement: HTMLCanvasElement;
  private containerElement: HTMLElement;
  private scene: Scene;
  private camera: PerspectiveCamera;
  public renderer: WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  private raycaster: Raycaster;
  private pointer: Vector2;
  private pointerIntersection: Intersection<Object3D<Object3DEventMap>>[];
  private referencePlane: ReferencePlane;
  private pointerHelper: PointerHelper;

  private objectFactory: ObjectFactory;
  private roomInsertionMode: boolean = false;
  private sensorInsertionMode: boolean = false;
  private roomInsertionPoints: Vector3[] = [];

  public sensors: Map<string, Sensor> = new Map();
  public rooms: Map<string, Room> = new Map();
  public heatmap: Heatmap;

  private tempRoomPreview: RoomPreview | null = null;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-6, 6, -2.5);
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.objectFactory = new ObjectFactory(this, this.scene);
  }

  async loadObjects() {
    const rooms = await SitevisorService.getRooms(this.projectId);
    rooms.forEach((room) => {
      if (room.point1 != null && room.point2 != null) {
        const newRoom = new Room(room.id, room.color, room.opacity, room.name, room.level, room.project, room.sensors,
          new Vector3(room.point1.x, room.point1.y, room.point1.z),
          new Vector3(room.point2.x, room.point2.y, room.point2.z));
        this.scene.add(newRoom);
        const boxHelper = newRoom.boxHelper = new BoxHelper(newRoom, 0xffff00 );
        this.scene.add(boxHelper);
        this.rooms.set(newRoom.userData.id, newRoom);
      }
    });
    const sensors = await SitevisorService.getSensors( {project_id: this.projectId} );
    sensors.forEach((sensor) => {
      const newSensor = new Sensor(
        sensor.id,
        sensor.name,
        sensor.device_id,
        sensor.level,
        sensor.type.name,
        sensor.project,
        new Vector3(sensor.position?.x, sensor.position?.y, sensor.position?.z),
        sensor.room);
      this.scene.add(newSensor);
      this.scene.add(newSensor.label)
      this.sensors.set(newSensor.userData.device_id, newSensor);
    });
  }

  init(canvasElement: HTMLCanvasElement, containerElement: HTMLElement, projectId: string) {
    this.projectId = projectId;
    this.canvasElement = canvasElement;
    this.containerElement = containerElement;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.containerElement.clientWidth, this.containerElement.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0px';
    this.containerElement.appendChild(this.labelRenderer.domElement);
    this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);

    this.initializeLights();
    this.initializeObjects();
    this.scene.background = new Color( 0x72898a );

    window.addEventListener('resize', this.resize.bind(this));
    this.labelRenderer.domElement.addEventListener('mousemove', this.setPointerPosition.bind(this));
    this.labelRenderer.domElement.addEventListener('click', this.onCanvasClick.bind(this));

    this.resize();
    this.animate();
  }

  private initializeLights() {
    const directionalLight = new DirectionalLight(0x9090aa);
    directionalLight.position.set(-10, 10, -10).normalize();
    this.scene.add(directionalLight);

    const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(1, 1, 1);
    this.scene.add(hemisphereLight);
  }

  private initializeObjects() {
    this.referencePlane = new ReferencePlane();
    this.scene.add(this.referencePlane);

    //const axesHelper = new AxesHelper(5);
    //this.scene.add(axesHelper);
    this.pointerHelper = new PointerHelper();
    this.scene.add(this.pointerHelper);
    this.loadObjects();
    this.heatmap = new Heatmap(this.scene, this.referencePlane);
    this.heatmap.minHue = 0; this.heatmap.maxHue = 120; this.heatmap.minValue = 15; this.heatmap.maxValue = 30;
  }

  public setCameraAt(x: number, y: number, z: number) {
        this.camera.position.set(x-3, y+5, z-3);
        this.controls.target.set(x, y, z);
        this.controls.update();
  }

  public toggleRoomInsertionMode(): boolean {
    this.roomInsertionMode = !this.roomInsertionMode;
    if (this.roomInsertionMode) {
      this.pointerHelper.setCreateMode(this.roomInsertionMode);
      this.roomInsertionPoints = [];
      this.toggleRoomsGeometryMode();
    } else {
      this.pointerHelper.setCreateMode(this.roomInsertionMode);
      this.toggleRoomsGeometryMode();
      this.removeTempRoomPreview();
    }
    return this.roomInsertionMode;
  }

  public setRoomInsertionMode(mode: boolean): boolean {
    this.roomInsertionMode = mode;
    if (this.roomInsertionMode) {
      this.pointerHelper.setCreateMode(this.roomInsertionMode);
      this.roomInsertionPoints = [];
      this.setRoomsGeometryMode("2D");
    } else {
      this.pointerHelper.setCreateMode(this.roomInsertionMode);
      this.setRoomsGeometryMode("3D");
      this.removeTempRoomPreview();
    }
    return this.roomInsertionMode;
  }

  public toggleSensorInsertionMode(): boolean {
    this.sensorInsertionMode = !this.sensorInsertionMode;
    if (this.sensorInsertionMode) {
      this.pointerHelper.setCreateMode(this.sensorInsertionMode);
    } else {
      this.pointerHelper.setCreateMode(this.sensorInsertionMode);
    }
    return this.sensorInsertionMode;
  }

  public setSensorInsertionMode(mode: boolean): boolean {
    this.sensorInsertionMode = mode;
    if (this.sensorInsertionMode) {
      this.pointerHelper.setCreateMode(this.sensorInsertionMode);
    } else {
      this.pointerHelper.setCreateMode(this.sensorInsertionMode);
    }
    return this.sensorInsertionMode;
  }

  public setHeatmapVisibility(visibility: boolean) {
    this.heatmap.setVisibility(visibility);
  }

  private checkPointerIntersection() {
    this.raycaster.setFromCamera( this.pointer, this.camera );
    this.pointerIntersection = this.raycaster.intersectObjects( this.scene.children, false );
  }

  private getIntersectedSensor(): Sensor | null {
    const sensorIntersect = this.pointerIntersection.find(intersect => intersect.object instanceof Sensor);

    if (sensorIntersect) {
      const sensorObject = sensorIntersect.object as Sensor;
      return sensorObject;
    } else {
      return null;
    }
  }

  private getIntersectedRoom(): Room | null {
    const roomIntersect = this.pointerIntersection.find(intersect => intersect.object instanceof Room);

    if (roomIntersect) {
      const roomObject = roomIntersect.object as Room;
      return roomObject;
    } else {
      return null;
    }
  }  

  private setPointerPosition(event: MouseEvent) {
    const pos = this.getCanvasRelativePosition(event);
    this.pointer.x = (pos.x / this.canvasElement.clientWidth ) *  2 - 1;
    this.pointer.y = (pos.y / this.canvasElement.clientHeight) * -2 + 1;
  }

  private getCanvasRelativePosition(event: MouseEvent) {
    const rect = this.canvasElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  private onCanvasClick(event: MouseEvent) {
    if (event.button === 0) { // Left mouse button clicked
      // Handle interaction with the ReferencePlane
      const intersection = this.referencePlane.getIntersectionPoint(this.raycaster);
      if (intersection) {
        this.pointerHelper.position.copy( intersection.clone() );

        if (this.roomInsertionMode) {
          this.roomInsertionPoints.push(intersection.clone());
          const roomData: IRoom = get(newRoom);
          roomData.point1 = this.roomInsertionPoints[0];
          // Create a Room Preview
          if (this.roomInsertionPoints.length == 1) {
            this.createTempRoomPreview(intersection);
          }
          // Second point should be at (intersection)
          if (this.roomInsertionPoints.length === 2) {
            roomData.point2 = this.roomInsertionPoints[1];
            SitevisorService.createRoom(roomData, this.projectId).then(
              createdRoom => {
                if (createdRoom) {
                  roomData.id = createdRoom.id;
                  const newRoom = this.objectFactory.createRoom(roomData);
                  if (newRoom) {
                    this.updateRoomContent(newRoom);
                    const boxHelper = newRoom.boxHelper = new BoxHelper(newRoom, 0xffff00 );
                    this.scene.add(boxHelper);
                  }
                }
              }
            ).catch(error => {
              console.error("Failed to create a room in backend", error);
            });
            this.setRoomInsertionMode(false);
            this.removeTempRoomPreview();
            this.roomInsertionPoints = [];
          }
        }
        if (this.sensorInsertionMode) {
          // Create a sensor in the backend and then in the scene
          const sensorData: ISensor = get(newSensor);
          sensorData.position = intersection.clone();
          SitevisorService.createSensor(sensorData, this.projectId)
          .then(createdSensor => {
              if (createdSensor) {
                sensorData.id = createdSensor.id;
                const sensor = this.objectFactory.createSensor(sensorData);
                if (sensor) {
                  this.updateSensorRoom(sensor);
                }
              }
              
          })
          .catch(error => {
              console.error("Failed to create sensor in backend", error);
          });

          this.setSensorInsertionMode(false);
        }
      }

      // Handle interaction with Sensors
      const clickedSensor = this.getIntersectedSensor();
      this.handleSensorSelection(clickedSensor);
      if (clickedSensor) this.handleRoomSelection(null);

      // Prioritise sensor selection
      if (!clickedSensor) {
        // Handle interaction with Rooms
        const clickedRoom = this.getIntersectedRoom();
        this.handleRoomSelection(clickedRoom);
      }
    }
  }

  private handleSensorSelection(sensor: Sensor | null) {
    if (sensor) {
      sensor.setIsSelected(true);
    }
    selectedSensorStore.set(sensor);
  }

  public removeSensorFromScene(device_id: string): void {
    const sensor = this.sensors.get(device_id);
    if (sensor) {
      // Update room related to the sensor
      if (sensor.userData.room) {
        this.rooms.get(sensor.userData.room)?.removeSensorEntry(sensor.userData.id);
      }
      // Proceed with removing the sensor
      this.scene.remove(sensor);
      this.scene.remove(sensor.label);
  
      if (sensor.geometry) sensor.geometry.dispose();
      if (sensor.material) sensor.material.dispose();
  
      this.sensors.delete(device_id);
    }
  }

  private handleRoomSelection(room: Room | null) {
    if (room) {
      room.setIsSelected(true);
    }
    selectedRoomStore.set(room);
  }

  public removeRoomFromScene(id: string): void {
    const room = this.rooms.get(id);
    if (room) {
      // Remove Room entry from related Sensors
      if (room.userData.sensors) {
        // Iterating this way around due to device_id and id mismatch
        // Could fix that. This is bad O(n) surely
        for (const [device_id, sensor] of this.sensors) {
          if (room.userData.sensors.indexOf(sensor.userData.id) !== -1) {
            sensor.setRoomEntry(null);
          }
        }
      }

      // Proceed with removing the room
      this.scene.remove(room.boxHelper);
      this.scene.remove(room);
      if (room.geometry) room.geometry.dispose();  
      this.rooms.delete(id);
    }
  }

  private updateTempRoomPreview() {
    if (this.tempRoomPreview) {
        this.tempRoomPreview.update(this.pointerHelper.position.clone());
    }
  }

  private createTempRoomPreview(startPoint: Vector3) {
    this.tempRoomPreview = new RoomPreview(startPoint);
    this.scene.add(this.tempRoomPreview);
    this.scene.add(this.tempRoomPreview.label);
  }

  private removeTempRoomPreview() {
    if (this.tempRoomPreview) {
        this.tempRoomPreview.geometry.dispose();
        this.scene.remove(this.tempRoomPreview.label);
        this.scene.remove(this.tempRoomPreview);
        this.tempRoomPreview = null;
    }
  }

  private async updateRoomContent(room: Room) {
    const sensorsWithin = room.checkSensorsWithin(this.sensors);
    for (let [sensorId, sensor] of sensorsWithin) {  
      // Update properties locally
      this.sensors.get(sensorId)?.setRoomEntry(room.userData.id);
      this.rooms.get(room.userData.id)?.addSensorEntry(sensor.userData.id);
  
      // Backend update
      const updatedSensorData: Partial<ISensor> = {
        room: room.userData.id
      };

      try {
        await SitevisorService.updateSensor(sensor.userData.id, updatedSensorData);
        console.log("Sensor updated successfully with new room assignment");
      } catch (error) {
        console.error(`Error updating Sensor with id: ${sensor.userData.id}`, error);
      }
    }
    
  }

  private updateSensorRoom(sensor: Sensor) {
    const room = sensor.checkIsInsideRoom(this.rooms);
    if (room) {
      // Update properties locally
      this.sensors.get(sensor.userData.device_id)?.setRoomEntry(room.userData.id);
      this.rooms.get(room.userData.id)?.addSensorEntry(sensor.userData.id);
      // Backend update
      SitevisorService.updateSensor(sensor.userData.id, { room: room.userData.id });
    }
  }

  public toggleRoomsGeometryMode() {
    this.rooms.forEach((room) => {
      room.toggleGeometryMode();
    });
  }

  public setRoomsGeometryMode(geometryMode: string) {
    this.rooms.forEach((room) => {
      room.setGeometryMode(geometryMode);
    });
    this.heatmap.setGeometryMode(geometryMode, 3.0);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();

    this.checkPointerIntersection();

    // Update not selected sensors
    for (const [_, sensor] of this.sensors) {
      if (sensor != get(selectedSensorStore)){
        sensor.setIsSelected(false);
      }
    }

    for (const [_, room] of this.rooms) {
      if (room != get(selectedRoomStore)){
        room.setIsSelected(false);
      }
    }

    // Check Sensor mouseover
    const sensorHoveredOver = this.getIntersectedSensor();
    sensorHoveredOver?.setIsLabelVisible(true);

    const intersection = this.referencePlane.getIntersectionPoint(this.raycaster);
    if (intersection) {
      this.pointerHelper.position.copy( intersection );
    }

    if (this.roomInsertionMode) {
      this.updateTempRoomPreview();
    }

    // Sensor glowing on data update
    const currentTime = performance.now();
    for (const [_, sensor] of this.sensors) {
      if (sensor.isGlowing) {
        const elapsed = currentTime - sensor.glowStartTime;
        if (elapsed < sensor.glowDuration) {
          const intensity = 1 - (elapsed / sensor.glowDuration);
          sensor.material.emissive.setHex(0xffff00 * intensity);
        } else {
          sensor.isGlowing = false;
          sensor.material.emissive.setHex(0x000000);
        }
      }
    }
    
    this.render();
    
  };

  private render = () => {
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render( this.scene, this.camera );
  }

  private resize = () => {
    const width = this.containerElement.clientWidth;
    const height = this.containerElement.clientHeight;
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };
}