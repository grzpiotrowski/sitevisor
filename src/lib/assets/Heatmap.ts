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
  public plane: Mesh;
  private geometryMode: string;

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
    this.planeGeometry.translate(0,0.01,0)
    this.planeMaterial = new MeshBasicMaterial({ map: this.texture, transparent: true, opacity: 0.9, alphaHash: true });
    this.plane = new Mesh(this.planeGeometry, this.planeMaterial);
    this.plane.visible = false; // Hidden by default
    this.scene.add(this.plane);

    // Resolution of the heatmap
    this.canvas.width = this.referencePlane.size;
    this.canvas.height = this.referencePlane.size;
  }

  updateHeatmap(values: Array<[Vector3, number]>) {
    // Takes in an array of value, position pairs to update the heatmap
    // Creates a simple heatmap by drawing a rectangle at each data point, without any interpolation

    if (!this.ctx) return; // Exit early

    const width = this.canvas.width;
    const height = this.canvas.height;

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

  updateHeatmapAdvanced(sensors: Array<[Vector3, number]>) {
    // This is a more advanced heatmap generation algorithm.
    // It divides the canvas into a grid and colours the cells
    // Normalised (0 to 1) Value of the cell is interpolated based on the value of all data points
    // Each data point affects the cell value inversely proportional to the square of the distance

    if (!this.ctx) return;
  
    const cellSize = 2;
    const numCellsX = Math.ceil(this.canvas.width / cellSize);
    const numCellsY = Math.ceil(this.canvas.height / cellSize);
  
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
    for (let i = 0; i < numCellsX; i++) {
      for (let j = 0; j < numCellsY; j++) {
        const x = i * cellSize + cellSize / 2;
        const y = j * cellSize + cellSize / 2;
  
        const value = this.calculateGridValue(x - this.canvas.width / 2, y - this.canvas.height / 2, sensors);
        const color = this.mapValueToColour(value, this.minValue, this.maxValue, this.minHue, this.maxHue);
  
        this.ctx.fillStyle = color;
        this.ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
      }
    }
  
    this.texture.needsUpdate = true;
  }

  private calculateGridValue(x: number, y: number, sensors: Array<[Vector3, number]>): number {
    // Calculate cell value using inverse square distance weights
    let totalValue = 0;
    let totalWeight = 0;
  
    for (const [position, sensorValue] of sensors) {
      const dx = x - position.x;
      const dy = y - position.z;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance > 0) {
        const weight = 1 / (distance*distance);
        totalValue += sensorValue * weight;
        totalWeight += weight;
      }
    }
  
    if (totalWeight > 0) {
      return totalValue / totalWeight;
    } else {
      return 0; // Default value if no sensors are influencing the cell
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

  public setGeometryMode(geometryMode: string, roomHeight: number) {
    if (geometryMode === "2D" && this.geometryMode != "2D") {
      this.plane.position.setY(this.plane.position.y - roomHeight);
      this.geometryMode = "2D";
    } else if (geometryMode === "3D" && this.geometryMode != "3D") {
      this.plane.position.setY(this.plane.position.y + roomHeight);
      this.geometryMode = "3D";
    }
  }

  public setVisibility(visibility: boolean) {
    this.plane.visible = visibility;
  }
}