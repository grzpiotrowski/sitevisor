<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import type { ISensor, ISensorType } from '../../../../lib/common/interfaces/ISensor';
  import type { IProject } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
	import { SitevisorService } from '../../../../services/sitevisor-service';
	import SensorTable from '$lib/components/SensorTable.svelte';
  export let data: PageData;

  let project: IProject = data.project;
  let sensors: ISensor[] = [];
  let sensorTypes: ISensorType[] = [];

  onMount(() => {
    fetchSensorTypes();
    fetchSensors();
  });

  async function fetchSensorTypes() {
    sensorTypes = await SitevisorService.getSensorTypes(project.id.toString());
  }

  async function fetchSensors() {
    sensors = await SitevisorService.getSensors( {project_id: project.id.toString()} );
  }

</script>

<HeaderProject projectid={project.id.toString()}/>

<div class="container mx-auto p-5">
  <SensorTable
    projectId={project.id.toString()}
    sensors={sensors}
    sensorTypes={sensorTypes}
  />
</div>
  