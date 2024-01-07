<script lang="ts">
    import { onMount } from 'svelte';
    import { Viewer } from '$lib/Viewer';

    let el: HTMLCanvasElement;
    let viewer: Viewer;

    onMount(() => {
        viewer = new Viewer();
        viewer.init(el);
    });
</script>

<svelte:head>
	<title>Three.js Sveltekit</title>
	<meta name="description" content="SiteVisor App" />
</svelte:head>

<canvas bind:this={el} />