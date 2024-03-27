<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ISensor, ISensorType } from '$lib/common/interfaces/ISensor';
  import { SitevisorService } from '../../services/sitevisor-service';
  import type { Vector3 } from 'three';

  export let projectId: string;
  export let sensors: ISensor[];
  export let sensorTypes: ISensorType[];

  let sensorTypeFilter: string = "";

  let pendingDeleteSensorId: string | null = null;
  let showSensorDeleteModal: boolean = false;

  $: filteredSensors = sensors.map(sensor => ({
    ...sensor
  })).filter(sensor => {
    return (sensorTypeFilter ? sensor.type.id.toString() === sensorTypeFilter : true);
  });
  
  function confirmDelete(sensorId: string) {
    pendingDeleteSensorId = sensorId;
    showSensorDeleteModal = true;
  }

  async function deleteSensor() {
    if (pendingDeleteSensorId) {
      try {
        await SitevisorService.deleteSensor(pendingDeleteSensorId);  
        sensors = sensors.filter(s => s.id !== pendingDeleteSensorId);
        showSensorDeleteModal = false;
        pendingDeleteSensorId = null;
      } catch (error) {
        console.error("Error deleting sensor", error);
      }
    }
  }

  function navigateToSensor(pos: Vector3 | null) {
    if (pos) {
      goto(`/projects/${projectId}/viewer?posX=${pos.x}&posY=${pos.y}&posZ=${pos.z}`);
    }
  }
</script>
  
<div class="mb-4 flex items-center">
  <label class="label mr-3" for="sensorTypeSelect">Sensor Type: </label>
  <select id="sensorTypeSelect" class="select select-sm" bind:value={sensorTypeFilter} required>
  <option selected value="">All</option>
  {#each sensorTypes as type}
    <option value={type.id.toString()}>{type.name}</option>
  {/each}
  </select>
</div>
<table class="table w-full table-zebra">
  <thead>
    <tr>
      <th>Name</th>
      <th>Device ID</th>
      <th>Type</th>
      <th>Level</th>
      <th>Position</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
  {#each filteredSensors as sensor}
    <tr>
    <td>{sensor.name}</td>
    <td>{sensor.device_id}</td>
    <td>{sensor.type.name}</td>
    <td>{sensor.level}</td>
    <td>{sensor.position?.x.toFixed(2)}, {sensor.position?.y.toFixed(2)}, {sensor.position?.z.toFixed(2)}</td>
    <td>
      <div class="flex justify-end gap-3">
        <button class="btn btn-error btn-xs" on:click={() => confirmDelete(sensor.id)}>Delete</button>
        <a class="btn btn-xs" href="/projects/{projectId}/sensors/{sensor.id}">Details</a>
        <button class="btn btn-xs" on:click={() => navigateToSensor(sensor.position)}>Go to</button>
      </div>
    </td>
    </tr>
  {/each}
  </tbody>
</table>
{#if showSensorDeleteModal}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Deletion</h3>
      <p>Are you sure you want to delete this sensor?</p>
      <div class="modal-action">
        <button class="btn" on:click={() => showSensorDeleteModal = false}>Cancel</button>
        <button class="btn btn-error" on:click={deleteSensor}>Delete</button>
      </div>
    </div>
  </div>  
{/if}
    