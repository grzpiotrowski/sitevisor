import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
    Vector3,
} from 'three';

export class DimensionLabel extends CSS2DObject {
  public dimension: string;
  public precision: number
  public label: CSS2DObject;

  constructor(position: Vector3) {
    const dimensionDiv = document.createElement('div');
    super(dimensionDiv);
    this.precision = 2;
    this.element.style.marginTop = '-1em';
    this.dimension = "";
    this.element.className = 'label';
    this.element.id = "dimensionDivID";
    
    this.position.copy(position.clone());
    this.layers.set(0);
  }

  public update(position: Vector3, startPoint: Vector3, endPoint: Vector3) {
    this.position.copy(position.clone());
    const vector: Vector3 = endPoint.sub(startPoint);
    this.dimension = "";
    this.dimension += Math.abs(vector.x).toPrecision(this.precision)
    this.dimension += "m x "
    this.dimension += Math.abs(vector.z).toPrecision(this.precision);
    this.dimension += "m"
    this.element.innerHTML = `
    <b> ${this.dimension} </b>
    `;
  } 

}