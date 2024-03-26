import {
  BoxGeometry,
  MeshStandardMaterial,
  Vector3,
} from 'three';
import { Volume } from './BaseTypes/Volume';

export class Room extends Volume {
  private sizeX: number;
  private sizeZ: number;
  private height: number;
  private geometryMode: string;
  private flatHeight: number;
  private materialNormal: MeshStandardMaterial;
  private materialSelected: MeshStandardMaterial;
  public isSelected: boolean;

  constructor(id: string, color: number, opacity: number, name: string, level: number, project: number, point1: Vector3, point2: Vector3) {

    const sizeX = Math.abs(point2.x - point1.x);
    const sizeZ = Math.abs(point2.z - point1.z);
    const height = 3 // Height (Y) fixed for now
    const position = new Vector3((point1.x + point2.x) / 2, height / 2, (point1.z + point2.z) / 2);

    const geometry = new BoxGeometry(sizeX, height, sizeZ); 
    const material = new MeshStandardMaterial({
      color: color,
      opacity: opacity,
      transparent: true
    });
    position.set(position.x, height/2, position.z);

    super(geometry, material, position);

    this.sizeX = sizeX;
    this.sizeZ = sizeZ;
    this.height = height;
    this.geometryMode = "3D";
    this.flatHeight = 0.01;
    this.materialNormal = material;

    this.materialSelected = new MeshStandardMaterial({
      color: 0x00ff00,
      opacity: opacity,
      transparent: true
    });
    
    // Custom object properties
    this.userData = {
      id: id,
      name: name,
      level: level,
      project: project,
    };

    this.isSelected = false;
  }
  
  public toggleGeometryMode() {
    if (this.geometryMode === "3D") {
      this.geometry = new BoxGeometry(this.sizeX, this.flatHeight, this.sizeZ);
      this.position.setY(this.position.y - this.height/2 + this.flatHeight/2);
      this.geometryMode = "2D";
    } else {
      this.geometry = new BoxGeometry(this.sizeX, this.height, this.sizeZ);
      this.position.setY(this.position.y + this.height/2 - this.flatHeight/2);
      this.geometryMode = "3D";
    }
  }

  public setGeometryMode(geometryMode: string) {
    if (geometryMode === "2D" && this.geometryMode != "2D") {
      this.geometry = new BoxGeometry(this.sizeX, this.flatHeight, this.sizeZ);
      this.position.setY(this.position.y - this.height/2 + this.flatHeight/2);
      this.geometryMode = "2D";
    } else if (geometryMode === "3D" && this.geometryMode != "3D") {
      this.geometry = new BoxGeometry(this.sizeX, this.height, this.sizeZ);
      this.position.setY(this.position.y + this.height/2 - this.flatHeight/2);
      this.geometryMode = "3D";
    }
  }

  public setIsSelected(isSelected: boolean) {
    this.isSelected = isSelected;
    if (isSelected) {
      this.material = this.materialSelected;
    } else {
      this.material = this.materialNormal;
    }
  }
}
