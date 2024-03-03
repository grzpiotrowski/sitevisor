<script lang="ts">
    export let onToggleRoomInsertion: any;
    export let onToggleSensorInsertion: any;
</script>

<div class="drawer-side">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label> 
    <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
    <!-- Sidebar content here -->
    <li><button class="btn" on:click={onToggleRoomInsertion}>Add Room</button></li>
    <li><button class="btn" on:click={onToggleSensorInsertion}>Add Sensor</button></li>
    </ul>
</div>
