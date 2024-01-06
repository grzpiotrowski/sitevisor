<script lang="ts">
	import { onMount } from 'svelte';
	import { createScene } from '$lib/viewer';

	let el:HTMLCanvasElement;

	onMount(() => {
		createScene(el);
	});
</script>

<svelte:head>
	<title>Three.js Sveltekit</title>
	<meta name="description" content="SiteVisor App" />
</svelte:head>

<canvas bind:this={el} />