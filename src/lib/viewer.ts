import {
    DirectionalLight,
    HemisphereLight,
    PerspectiveCamera,
    Scene,
    WebGLRenderer
  } from 'three';
import { Room } from './Room';
  
const scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const mainRoom = new Room(0x00ff00, 0.5);

scene.add(mainRoom);

const directionalLight = new DirectionalLight(0x9090aa);
directionalLight.position.set(-10, 10, -10).normalize();
scene.add(directionalLight);

const hemisphereLight = new HemisphereLight(0xffffff, 0x444444);
hemisphereLight.position.set(1, 1, 1);
scene.add(hemisphereLight);

let renderer:WebGLRenderer;

const animate = () => {
  requestAnimationFrame(animate);
  mainRoom.rotation.x += 0.01;
  mainRoom.rotation.y += 0.01;
  renderer.render(scene, camera);
};

const resize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
};

export const createScene = (el:HTMLCanvasElement) => {
  renderer = new WebGLRenderer({ antialias: true, canvas: el });
  resize();
  animate();
};

window.addEventListener('resize', resize);