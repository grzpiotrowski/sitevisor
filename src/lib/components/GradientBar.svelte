<script lang="ts">
  import type { ISensorType } from '$lib/common/interfaces/ISensor';
  import { onMount } from 'svelte';
  export let minHue = 120; // Green
  export let maxHue = 0; // Red
  export let minValue: number;
  export let maxValue: number;
  export let sensorTypes: ISensorType[];
  export let sensorTypeFilter: string;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null;

  function updateGradient() {
    if (!ctx) return;
    const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `hsl(${minHue}, 100%, 50%)`); // Min hue at the top
    gradient.addColorStop(0.5, `hsl(${(maxHue - minHue) / 2}, 100%, 50%)`); // Mid hue
    gradient.addColorStop(1, `hsl(${maxHue}, 100%, 50%)`); // Max hue at the bottom

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  onMount(() => {
    ctx = canvas.getContext('2d');
    updateGradient();
  });

  $: minValue, maxValue, updateGradient();
</script>
  
  <div class="grid justify-items-center">
    <select id="sensorTypeSelect" class="select select-sm" bind:value={sensorTypeFilter} required>
      {#each sensorTypes as type}
        <option value={type.name}>{type.name}</option>
      {/each}
      </select>
    <div>
      <input type="number" class="input input-bordered w-16 max-w-xs" bind:value={maxValue}>
    </div>
    <div>
      <canvas bind:this={canvas} width="30" height="200"></canvas>
    </div>
    <div>
      <input type="number" class="input input-bordered w-16 max-w-xs" bind:value={minValue}>
    </div>
  </div>