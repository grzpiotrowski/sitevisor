<script lang="ts">
	import type { Sensor } from "$lib/assets/Sensor";
	import { selectedSensorStore } from "../../stores";
  import { createEventDispatcher } from 'svelte';
  import { SitevisorService } from "../../services/sitevisor-service";

  export let selectedSensor: Sensor | null;
  let showSensorDeleteModal = false;
  const dispatch = createEventDispatcher();

  function closeSensorDetails() {
    selectedSensorStore.set(null);
  }

  async function confirmDelete() {
    if (selectedSensor) {
      await SitevisorService.deleteSensor(selectedSensor.userData.id);
      selectedSensorStore.set(null);
      dispatch('removeSensor', { device_id: selectedSensor.userData.device_id });
    }
  }

</script>

<div class="absolute top-0 right-0 mt-[70px] mr-4 p-4 bg-white shadow-md rounded-lg z-10 w-1/5">
  <button class="absolute top-0 right-0 m-2" on:click={closeSensorDetails}>&times;</button>
  <h3 class="text-lg font-semibold">{selectedSensor?.userData.name}</h3>
  <p>ID: {selectedSensor?.userData.device_id}</p>
  <p>Level: {selectedSensor?.userData.level}</p>
  {#if selectedSensor?.userData.data}
    <p>Reading: {selectedSensor?.userData.data.value} {selectedSensor?.userData.data.unit}</p>
  {/if}
  <button class="btn btn-error btn-sm" on:click={() => showSensorDeleteModal = true}>Delete Sensor</button>

  {#if showSensorDeleteModal}
    <div class="modal modal-open">
      <div class="modal-box relative">
        <h3 class="text-lg font-bold">Confirm Deletion</h3>
        <p class="py-4">Are you sure you want to delete this sensor?</p>
        <div class="modal-action">
          <button class="btn" on:click={() => showSensorDeleteModal = false}>Cancel</button>
          <button class="btn btn-error" on:click={confirmDelete}>Delete</button>
        </div>
      </div>
    </div>
  {/if}
</div>
