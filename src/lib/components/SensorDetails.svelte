<script lang="ts">
	import type { Sensor } from "$lib/assets/Sensor";

  export let selectedSensor: Sensor | null;

</script>

<div class="absolute top-0 right-0 mt-[70px] mr-4 p-4 bg-white shadow-md rounded-lg z-10">
  <button class="absolute top-0 right-0 m-2" on:click={() => selectedSensor = null}>&times;</button>
  <h3 class="text-lg font-semibold">{selectedSensor?.userData.name}</h3>
  <p>ID: {selectedSensor?.userData.device_id}</p>
  <p>Level: {selectedSensor?.userData.level}</p>
  {#if selectedSensor?.userData.data}
    <p>Reading: {selectedSensor?.userData.data.value} {selectedSensor?.userData.data.unit}</p>
  {/if}
</div>
