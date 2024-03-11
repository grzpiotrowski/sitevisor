<script lang="ts">
    import { Viewer } from '$lib/viewer';
	export let isDialogOpen: boolean;
    export let viewer: Viewer;

    function handleAddSensorSubmit() {
        console.log("Form submitted");
        isDialogOpen = false;
        viewer.setSensorInsertionMode(true);
    }

    function handleAddSensorCancelled() {
        console.log("Form cancelled");
        isDialogOpen = false;
        viewer.setSensorInsertionMode(false);
    }
</script>

<div class="modal" class:modal-open={isDialogOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Add Sensor</h3>
    <form on:submit|preventDefault={handleAddSensorSubmit}>
        <div class="form-control">
            <label class="label" for="sensorName">Sensor Name</label>
            <input type="text" id="sensorName" class="input input-bordered" required>
        </div>
        <div class="form-control">
            <label class="label" for="sensorType">Sensor Type</label>
            <select id="sensorType" class="select select-bordered" required>
                <option value="" disabled selected>Select type</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
            </select>
        </div>
        <div class="modal-action">
            <button type="submit" class="btn">Place Sensor</button>
            <button type="button" class="btn" on:click={handleAddSensorCancelled}>Close</button>
        </div>
    </form>
  </div>
</div>