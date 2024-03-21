import {
  CanvasTexture,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Scene
} from 'three';
import { ReferencePlane } from './ReferencePlane';
import type { Sensor } from './Sensor';

export class Heatmap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private texture: CanvasTexture;
  public scene: Scene;
  private referencePlane: ReferencePlane;
  private planeGeometry: PlaneGeometry;
  private planeMaterial: MeshBasicMaterial;
  private plane: Mesh;

  constructor(scene: Scene, referencePlane: ReferencePlane) {
    this.scene = scene;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.texture = new CanvasTexture(this.canvas);
    this.referencePlane = referencePlane;
    this.planeGeometry = new PlaneGeometry(referencePlane.size, referencePlane.size);
    this.planeGeometry.rotateX( - Math.PI / 2 );
    this.planeGeometry.translate(0,-0.05,0)
    this.planeMaterial = new MeshBasicMaterial({ map: this.texture, transparent: true, opacity: 0.5 });
    this.plane = new Mesh(this.planeGeometry, this.planeMaterial);
    this.scene.add(this.plane);

    // Resolution of the heatmap
    this.canvas.width = this.referencePlane.size;
    this.canvas.height = this.referencePlane.size;
  }

  updateHeatmap(sensors: Map<string, Sensor>) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    if (this.ctx) {
        // Clear previous drawing
        this.ctx.clearRect(0, 0, width, height);

        // Example: Iterate over sensor data and draw
        for (const [_, sensor] of sensors) {
            const color = this.mapValueToColour(sensor.userData.data?.value);
            this.ctx.fillStyle = color;
            const rectSize = 3;
            this.ctx.fillRect(sensor.position.x + width/2 - rectSize/2,
                sensor.position.z + height/2 - rectSize/2,
                rectSize,
                rectSize
              );
        };

        this.texture.needsUpdate = true;
    }
}

  mapValueToColour(value: number) {
    // Mapping sensor value to heatmap colour
    const r = Math.min(255, value * 4);
    const b = 255 - r;
    return `rgb(${r},0,${b})`;
  }
}
