import {
  DirectionalLight,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AxesHelper,
} from 'three';
import { Room } from './Room';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReferencePlane } from './ReferencePlane';

export class Viewer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private mainRoom: Room;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(3, 3, 5);
  }

  init(canvasElement: HTMLCanvasElement) {
    this.renderer = new WebGLRenderer({ antialias: true, canvas: canvasElement });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.initializeLights();
    this.initializeObjects();

    window.addEventListener('resize', this.resize.bind(this));
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
    this.mainRoom = new Room(0x00ff00, 0.5);
    this.scene.add(this.mainRoom);

    const referencePlane = new ReferencePlane();
    this.scene.add(referencePlane);

    const axesHelper = new AxesHelper(5);
    this.scene.add(axesHelper);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.mainRoom.rotation.x += 0.01;
    this.mainRoom.rotation.y += 0.01;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private resize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };
}