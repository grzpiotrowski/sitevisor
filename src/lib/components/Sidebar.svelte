<script lang="ts">
    export let onToggleRoomInsertion: any;
    export let onToggleSensorInsertion: any;

    export let isHeatmapActive: boolean;
</script>

<div class="drawer-side">
    <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay"></label> 
    <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
    <!-- Sidebar content here -->
    <li><button class="btn mb-2" on:click={onToggleRoomInsertion}>Add Room</button></li>
    <li><button class="btn mb-2" on:click={onToggleSensorInsertion}>Add Sensor</button></li>
    <li><button class="btn {isHeatmapActive ? 'btn-active' : 'mb-2'}" on:click={() => isHeatmapActive = !isHeatmapActive}>Toggle Heatmap</button></li>
    </ul>
</div>
