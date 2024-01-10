<script lang="ts">
    import { onMount } from 'svelte';
    import { Viewer } from '$lib/viewer';
    import Sidebar from '../lib/components/Sidebar.svelte';

    let el: HTMLCanvasElement;
    let viewer: Viewer;

    onMount(() => {
        viewer = new Viewer();
        viewer.init(el);
    });

    function toggleRoomInsertion() {
        viewer.toggleRoomInsertionMode();
    }
</script>

<svelte:head>
    <title>Three.js Sveltekit</title>
    <meta name="description" content="SiteVisor App" />
</svelte:head>

<Sidebar onToggleRoomInsertion={toggleRoomInsertion} />
<canvas bind:this={el} />