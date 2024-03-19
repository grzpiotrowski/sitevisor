import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import {
  Vector3,
} from 'three';
import { Sensor } from '$lib/assets/Sensor'

export class SensorLabel extends CSS2DObject {
  public sensorName: string;
  public label: CSS2DObject;
  private sensor: Sensor;

  constructor(position: Vector3, sensor: Sensor) {
    const sensorDiv = document.createElement('div');
    super(sensorDiv);
    this.sensor = sensor;
    this.element.style.marginTop = '-1em';
    this.element.style.visibility = 'hidden';
    this.sensorName = sensor.userData.name;
    this.element.className = 'sitevisor-sensor-label';
    this.element.id = `sensor-label-${sensor.userData.device_id}`;
    this.element.innerHTML = `
                <b> ${this.sensorName} </b>
                `;
    this.position.set(position.x, position.y+0.7, position.z);
    this.layers.set(0);
  }

  public update() {
    this.element.innerHTML = `
        <b> ${this.sensor.userData.name} </b><br>
        <b> ${this.sensor.userData.data.value} </b>
        `;
  } 

}