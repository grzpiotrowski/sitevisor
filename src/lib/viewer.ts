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
} from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Room } from './assets/Room';
import { Sensor } from './assets/Sensor';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReferencePlane } from './assets/ReferencePlane';
import { PointerHelper } from './assets/PointerHelper';
import { ObjectFactory } from './utils/ObjectFactory';

import { SitevisorService } from '../services/sitevisor-service';

export class Viewer {
  private projectId: string;
  private canvasElement: HTMLCanvasElement;
  private containerElement: HTMLElement;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private controls: OrbitControls;
  private raycaster: Raycaster;
  private pointer: Vector2;
  private referencePlane: ReferencePlane;
  private pointerHelper: PointerHelper;

  private objectFactory: ObjectFactory;
  private roomInsertionMode: boolean = false;
  private sensorInsertionMode: boolean = false;
  private roomInsertionPoints: Vector3[] = [];

  public sensors: Sensor[] = [];
  public rooms: Room[] = [];

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
        const newRoom = new Room(room.color, room.opacity, room.name, room.level,
          new Vector3(room.point1.x, room.point1.y, room.point1.z),
          new Vector3(room.point2.x, room.point2.y, room.point2.z));
        this.scene.add(newRoom);
        this.rooms.push(newRoom);
      }
    });
    const sensors = await SitevisorService.getSensors(this.projectId);
    sensors.forEach((sensor) => {
      const newSensor = new Sensor(sensor.name,
        sensor.level,
        new Vector3(sensor.position?.x, sensor.position?.y, sensor.position?.z));
      this.scene.add(newSensor);
      this.scene.add(newSensor.label)
      this.sensors.push(newSensor);
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
    window.addEventListener('keypress', this.onKeyPress.bind(this));

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

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);
    this.pointerHelper = new PointerHelper();
    this.scene.add(this.pointerHelper);
    this.loadObjects();
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

  private checkPointerIntersection() {
    this.raycaster.setFromCamera( this.pointer, this.camera );
    const intersects = this.raycaster.intersectObjects( this.scene.children, false );

    if ( intersects.length > 0 ) {
      const intersected = intersects[0].object;
      //console.log(intersected);
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
      const intersection = this.referencePlane.getIntersectionPoint(this.raycaster);
      if (intersection) {
        // console.log(`Intersection at: ${intersection.x}, ${intersection.y}, ${intersection.z}`);
        this.pointerHelper.position.copy( intersection );

        if (this.roomInsertionMode) {
          this.roomInsertionPoints.push(intersection.clone());
          if (this.roomInsertionPoints.length === 2) {
            const room = this.objectFactory.createRoomFromPoints(this.roomInsertionPoints);
            SitevisorService.createRoom(room, this.projectId);
            this.setRoomInsertionMode(false);
            this.roomInsertionPoints = [];
          }
        }
        if (this.sensorInsertionMode) {
          const sensor = this.objectFactory.createSensorAtPoint(intersection.clone());
          SitevisorService.createSensor(sensor, this.projectId);
          this.setSensorInsertionMode(false);
        }
      }
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
  }

  private onKeyPress(event: KeyboardEvent) {
      if (event.key === 'n' || event.key === 'N') {
        console.log("N key pressed");
        // Key presses are active when a modal window is opened.
        // This may cause potential bugs when user is typing into an input field.
      }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.checkPointerIntersection();

    const intersection = this.referencePlane.getIntersectionPoint(this.raycaster);
    if (intersection) {
      this.pointerHelper.position.copy( intersection );
    }
    
    this.render();
    this.labelRenderer.render( this.scene, this.camera );
  };

  private render = () => {
    this.renderer.render(this.scene, this.camera);
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