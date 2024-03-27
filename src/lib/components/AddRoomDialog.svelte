<script lang="ts">
    import { Viewer } from '$lib/viewer';
    import { newRoom } from '../../stores';
    import { getRandomHexColor } from '$lib/utils/helpers';
    import ColorPicker from 'svelte-awesome-color-picker';
	export let isDialogOpen: boolean;
    export let viewer: Viewer;
    export let projectId: number;

    let hex = "#eab507";
    $: if (isDialogOpen) {
        hex = "#" + getRandomHexColor().toString(16);
    }

    let roomDetails = {
        name: '',
        color: 0,
    };

    function handleAddRoomSubmit() {
        // Update details in store but temporarily set position and sensors to null
        newRoom.update(() => (
            { 
                id: '',
                name: roomDetails.name,
                level: 0,
                color: parseInt(hex.replace("#", ""), 16),
                opacity: 0.5,
                project: projectId,
                point1: null,
                point2: null,
                sensors: [],
            }
            ));
        isDialogOpen = false;
        viewer.setRoomInsertionMode(true);
    }

    function handleAddRoomCancelled() {
        isDialogOpen = false;
        viewer.setRoomInsertionMode(false);
    }
</script>

<div class="modal" class:modal-open={isDialogOpen}>
  <div class="modal-box min-h-96">
    <h3 class="font-bold text-lg">
        <ColorPicker bind:hex isAlpha={false} label=""/>
        Add Room
    </h3>
    <form on:submit|preventDefault={handleAddRoomSubmit}>
        <div class="form-control">
            <label class="label" for="roomName">Room Name</label>
            <input type="text" id="roomName" class="input input-bordered" required
            bind:value={roomDetails.name}>
        </div>
        <div class="modal-action">
            <button type="submit" class="btn">Place Room</button>
            <button type="button" class="btn" on:click={handleAddRoomCancelled}>Close</button>
        </div>
    </form>
  </div>
</div>