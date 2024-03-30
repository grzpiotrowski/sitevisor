<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';
  import { tick } from 'svelte';

  export let sensorData: number[] = [];
  export let sensorId: string = 'Sensor-ID';
  export let chartId: string;
  
  let chart: Chart | null = null;
  let chartCanvas: HTMLCanvasElement;

  onMount(async () => {
    await tick(); // Ensures the DOM is fully ready
    initChart();
  });

  $: if (chart && sensorData) {
    updateChartData(sensorData);
  }

  function initChart() {
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sensorData.map((_, index) => index.toString()),
        datasets: [{
          label: sensorId,
          data: sensorData,
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        },
      }
    });
  }

  function updateChartData(newData: number[]) {
    if (!chart) return;
    chart.data.labels = newData.map((_, index) => index.toString());
    chart.data.datasets[0].data = newData;
    chart.update();
  }

  onDestroy(() => {
    chart?.destroy();
  });
</script>

<canvas bind:this={chartCanvas} id={chartId}></canvas>
