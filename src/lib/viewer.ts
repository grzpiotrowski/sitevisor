import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AxesHelper,
  Raycaster,
  Vector2,
} from 'three';
import { Room } from './Room';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReferencePlane } from './ReferencePlane';

export class Viewer {
  private canvasElement: HTMLCanvasElement;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: Raycaster;
  private pointer: Vector2;
  private mainRoom: Room;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(3, 3, 5);
    this.raycaster = new Raycaster();
    this.pointer = new Vector2();
  }

  init(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
    this.renderer = new WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.initializeLights();
    this.initializeObjects();

    window.addEventListener('resize', this.resize.bind(this));
    window.addEventListener('mousemove', this.setPointerPosition.bind(this));

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
    this.mainRoom = new Room(0x00ff00, 0.5, "Main room", 0);
    this.scene.add(this.mainRoom);

    const referencePlane = new ReferencePlane();
    this.scene.add(referencePlane);

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private checkPointerIntersection() {
    this.raycaster.setFromCamera( this.pointer, this.camera );
    const intersects = this.raycaster.intersectObjects( this.scene.children, false );

    if ( intersects.length > 0 ) {
      const intersected = intersects[0].object;
      console.log(intersected);
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