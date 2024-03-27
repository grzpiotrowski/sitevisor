<script lang="ts">
    import { Viewer } from '$lib/viewer';
	import { SitevisorService } from '../../services/sitevisor-service';
    import { newSensor } from '../../stores';
    import type { ISensorType } from '$lib/common/interfaces/ISensor';
	export let isDialogOpen: boolean;
    export let viewer: Viewer;
    export let projectId: number;

    let warningMessage = '';
    let showWarning = false;

    let sensorDetails = {
        name: '',
        device_id: '',
        type_id: -1,
    };

    let sensorTypes: Map<number, ISensorType> = new Map();

    async function fetchSensorTypes() {
        const sensorTypesArray = await SitevisorService.getSensorTypes(projectId.toString());
        sensorTypes = new Map(sensorTypesArray.map(type => [type.id, type]));
    }

    $: if (isDialogOpen) {
        fetchSensorTypes();
    }

    function handleAddSensorSubmit() {
        // Ensure device_id is unique
        if (viewer.sensors.has(sensorDetails.device_id)) {
            warningMessage = "A sensor with this ID already exists. Please use a unique ID.";
            showWarning = true;
            return;
        } else {
            showWarning = false;
        }
        const selectedType = sensorTypes.get(sensorDetails.type_id);

        if (!selectedType) {
            console.error("Selected sensor type is invalid");
            return;
        }

        // Update details in store but temporarily set position and room to null
        newSensor.update(() => (
            {   
                id: '',
                name: sensorDetails.name,
                device_id: sensorDetails.device_id,
                level: 0,
                position: null,
                type: selectedType,
                project: projectId,
                room: null,
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
            <label class="label" for="device_id">Sensor ID</label>
            <input type="text" id="device_id" class="input input-bordered" required
            bind:value={sensorDetails.device_id}>
        </div>
        <div class="form-control">
            <label class="label" for="sensorType">Sensor Type</label>
            <select id="sensorType" class="select select-bordered" bind:value={sensorDetails.type_id} required>
                <option value="" disabled selected>Select type</option>
                {#each Array.from(sensorTypes.values()) as type}
                    <option value={type.id}>{type.name}</option>
                {/each}
            </select>
        </div>
        <div class="modal-action">
            <button type="submit" class="btn">Place Sensor</button>
            <button type="button" class="btn" on:click={handleAddSensorCancelled}>Close</button>
        </div>
    </form>
    {#if showWarning}
        <div class="alert alert-warning shadow-lg mt-2">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.268 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>{warningMessage}</span>
            </div>
        </div>
    {/if}
    </div>
</div>