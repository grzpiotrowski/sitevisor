<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from "../$types";
  import type { ISensor } from '../../../../lib/common/interfaces/ISensor';
  import type { IProject } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
  export let data: PageData;

  let project: IProject = data.project;

  let sensors: ISensor[] = project.sensors;

  onMount(() => {
    sensors = project.sensors;
  });
</script>

<HeaderProject projectid={project.id.toString()}/>

<div class="container mx-auto p-5">
  <table class="table w-full table-zebra">
    <thead>
      <tr>
        <th>Name</th>
        <th>Device ID</th>
        <th>Level</th>
        <th>Position</th>
      </tr>
    </thead>
    <tbody>
      {#each sensors as sensor}
        <tr>
          <td>{sensor.name}</td>
          <td>{sensor.device_id}</td>
          <td>{sensor.level}</td>
          <td>{sensor.position?.x.toFixed(2)}, {sensor.position?.y.toFixed(2)}, {sensor.position?.z.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
  