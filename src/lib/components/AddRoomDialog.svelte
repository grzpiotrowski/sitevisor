<script lang="ts">
    import { Viewer } from '$lib/viewer';
    import { newRoom } from '../../stores';
	export let isDialogOpen: boolean;
    export let viewer: Viewer;

    let roomDetails = {
        name: ''
    };

    function handleAddRoomSubmit() {
        // Update details in store but temporarily set position to null
        newRoom.update(() => (
            { name: roomDetails.name,
                level: 0,
                color: 0,
                opacity: 0.5,
                point1: null,
                point2: null
            }
            ));
        isDialogOpen = false;
        viewer.setRoomInsertionMode(true);
        console.log("Form submitted");
    }

    function handleAddRoomCancelled() {
        isDialogOpen = false;
        viewer.setRoomInsertionMode(false);
        console.log("Form cancelled");
    }
</script>

<div class="modal" class:modal-open={isDialogOpen}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">Add Room</h3>
    <form on:submit|preventDefault={handleAddRoomSubmit}>
        <div class="form-control">
            <label class="label" for="roomName">Room Name</label>
            <input type="text" id="roomName" class="input input-bordered" required
            bind:value={roomDetails.name}>
        </div>
        <div class="form-control">
            <!-- TODO: Room fields -->
            <label class="label" for="roomType">Room Type</label>
            <select id="roomType" class="select select-bordered" required
            >
                <option value="" disabled selected>Select type</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
            </select>
        </div>
        <div class="modal-action">
            <button type="submit" class="btn">Place Room</button>
            <button type="button" class="btn" on:click={handleAddRoomCancelled}>Close</button>
        </div>
    </form>
  </div>
</div>