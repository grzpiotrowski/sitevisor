import {
  ConeGeometry,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
} from "three";

export class PointerHelper extends Mesh {

  constructor() {
    const geometryHelper = new ConeGeometry( 0.1, 0.7, 10 );
    geometryHelper.translate( 0, -0.35, 0 );
    geometryHelper.rotateX( Math.PI );
    super( geometryHelper, new MeshNormalMaterial() )
  }

  public setCreateMode(isCreateMode: boolean) {
    if (isCreateMode) {
      this.material = new MeshStandardMaterial({color: 0x00ff00})
    } else { 
      this.material = new MeshNormalMaterial()
    }
  }

}