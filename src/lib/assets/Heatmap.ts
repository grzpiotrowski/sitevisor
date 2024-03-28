import {
  CanvasTexture,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Color,
  Scene,
  Vector3
} from 'three';
import { ReferencePlane } from './ReferencePlane';

export class Heatmap {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private texture: CanvasTexture;
  public scene: Scene;
  private referencePlane: ReferencePlane;
  private planeGeometry: PlaneGeometry;
  private planeMaterial: MeshBasicMaterial;
  private plane: Mesh;

  public minValue: number;
  public maxValue: number;
  public minHue: number;
  public maxHue: number;

  constructor(scene: Scene, referencePlane: ReferencePlane) {
    this.scene = scene;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.texture = new CanvasTexture(this.canvas);
    this.referencePlane = referencePlane;
    this.planeGeometry = new PlaneGeometry(referencePlane.size, referencePlane.size);
    this.planeGeometry.rotateX( - Math.PI / 2 );
    this.planeGeometry.translate(0,3.05,0)
    this.planeMaterial = new MeshBasicMaterial({ map: this.texture, transparent: true, opacity: 0.9, alphaHash: true });
    this.plane = new Mesh(this.planeGeometry, this.planeMaterial);
    this.scene.add(this.plane);

    // Resolution of the heatmap
    this.canvas.width = this.referencePlane.size;
    this.canvas.height = this.referencePlane.size;
  }

  updateHeatmap(values: Array<[Vector3, number]>) {
  // Takes in an array of value, position pairs to update the heatmap
  const width = this.canvas.width;
  const height = this.canvas.height;

  if (this.ctx) {
    // Clear previous drawing
    this.ctx.clearRect(0, 0, width, height);
    
    for (const [position, value] of values) {
      const color = this.mapValueToColour(value, this.minValue, this.maxValue, this.minHue, this.maxHue);
      this.ctx.fillStyle = color.toString();
      // The shape drawn cannot be a circle as the drop in performance is too big, rect used instead
      //this.ctx.fill()
      //this.ctx.arc(sensor.position.x + width/2, sensor.position.z + height/2, rectSize, 0, 2* Math.PI);
      const rectSize = 5;
      this.ctx.fillRect(position.x + width/2 - rectSize/2,
        position.z + height/2 - rectSize/2,
        rectSize,
        rectSize
      );
    };

    this.texture.needsUpdate = true;
  }
}

  mapValueToColour(value: number, minValue: number, maxValue: number, minHue: number, maxHue: number): string {
    // Maps the reading value to colour on a gradient
    // Uses Three.js Color object for convenience
    // https://threejs.org/docs/#api/en/math/Color.lerpColors

    const valuesRange = maxValue - minValue;
    let valueNormalised = value - minValue;
    if (valueNormalised !== 0) {
      valueNormalised = (value - minValue) / valuesRange;
    }

    const minColour = new Color(`hsl(${maxHue}, 100%, 50%)`); // Green
    const maxColour = new Color(`hsl(${minHue}, 100%, 50%)`); // Red

    const heatColour = new Color(`hsl(0, 0%, 0%)`); // Initialise colour
    heatColour.lerpColors(minColour, maxColour, valueNormalised);

    // Convert HSL to RGB
    return heatColour.getStyle();
  }
}