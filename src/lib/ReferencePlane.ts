import {
  GridHelper
} from 'three';

export class ReferencePlane extends GridHelper {

  constructor(size: number = 10, divisions: number = 10) {
    super(size, divisions, 0x888888, 0x444444);
  }
}
