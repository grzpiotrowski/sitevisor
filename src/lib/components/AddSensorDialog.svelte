<script lang="ts">
    import { Viewer } from '$lib/viewer';
    import { newSensor } from '../../stores';
	export let isDialogOpen: boolean;
    export let viewer: Viewer;

    let sensorDetails = {
        name: ''
    };

    function handleAddSensorSubmit() {
        // Update details in store but temporarily set position to null
        newSensor.update(() => (
            { name: sensorDetails.name,
                level: 0,
                position: null,
            }
            ));
        isDialogOpen = false;
        viewer.setSensorInsertionMode(true);
    }

    function handleAddSensorCancelled() {
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
            <input type="text" id="sensorName" class="input input-bordered" required
            bind:value={sensorDetails.name}>
        </div>
        <div class="form-control">
            <!-- TODO: Sensor fields -->
            <label class="label" for="sensorType">Sensor Type</label>
            <select id="sensorType" class="select select-bordered" required
            >
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