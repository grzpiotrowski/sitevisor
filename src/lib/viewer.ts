import {
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
import { Room } from './assets/Room';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReferencePlane } from './assets/ReferencePlane';
import { PointerHelper } from './assets/PointerHelper';
import { ObjectFactory } from './utils/ObjectFactory';

export class Viewer {
  private canvasElement: HTMLCanvasElement;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: Raycaster;
  private pointer: Vector2;
  private referencePlane: ReferencePlane;
  private mainRoom: Room;
  private pointerHelper: PointerHelper;

  private objectFactory: ObjectFactory;
  private roomInsertionMode: boolean = false;
  private roomInsertionPoints: Vector3[] = [];

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(-6, 6, -2.5);
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();

    this.objectFactory = new ObjectFactory(this.scene);
  }

  init(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.controls = new OrbitControls(this.camera, this.canvasElement);

    this.initializeLights();
    this.initializeObjects();

    window.addEventListener('resize', this.resize.bind(this));
    canvasElement.addEventListener('mousemove', this.setPointerPosition.bind(this));
    canvasElement.addEventListener('click', this.onCanvasClick.bind(this));
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
    this.mainRoom = new Room(0x00ff00, 0.5, "Main room", 0, new Vector3(-4, 0, 4.23), new Vector3(0.89, 0, -2.62));
    this.scene.add(this.mainRoom);
    this.scene.add(new Room(0x8000ff, 0.5, "Secondary room", 0, new Vector3(0.89, 0, -2.62), new Vector3(3.45, 0, 2.55)))

    this.referencePlane = new ReferencePlane();
    this.scene.add(this.referencePlane);

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);
    this.pointerHelper = new PointerHelper();
    this.scene.add(this.pointerHelper);
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
        console.log(`Intersection at: ${intersection.x}, ${intersection.y}, ${intersection.z}`);
        this.pointerHelper.position.copy( intersection );

        if (this.roomInsertionMode) {
          this.roomInsertionPoints.push(intersection.clone());
          if (this.roomInsertionPoints.length === 2) {
            this.objectFactory.createRoomFromPoints(this.roomInsertionPoints);
            this.roomInsertionMode = false;
            this.pointerHelper.setCreateMode(this.roomInsertionMode);
            this.roomInsertionPoints = [];
          }
        }
      }
    }
  }

  private onKeyPress(event: KeyboardEvent) {
    if (event.key === 'n' || event.key === 'N') {
      this.roomInsertionMode = !this.roomInsertionMode;
      if (this.roomInsertionMode) {
        this.pointerHelper.setCreateMode(this.roomInsertionMode);
        this.roomInsertionPoints = [];
        console.log("Room insertion mode activated");
      } else {
        this.pointerHelper.setCreateMode(this.roomInsertionMode);
        console.log("Room insertion mode deactivated");
      }
    }
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.checkPointerIntersection();
    this.render()
  };

  private render = () => {
    this.renderer.render(this.scene, this.camera);
  }

  private resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}