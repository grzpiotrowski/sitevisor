<script lang="ts">
	import Header from "$lib/components/Header.svelte";
  import { SitevisorService } from "../../services/sitevisor-service";
  import type { IProject } from "../../services/sitevisor-types";
  import type { ISensorType } from "$lib/common/interfaces/ISensor";
  import { loggedInUser } from "../../stores";
  import type { PageData } from "./$types";
  export let data: PageData;
  import { get, writable } from "svelte/store";

  const user = get(loggedInUser);
  let projects = data.projects;

  let newProjectName = "";
  let projectCreationError = writable('');

  async function createNewProject() {
    const project: IProject = {
      id: -1,
      name: newProjectName,
      kafka_topics: '',
      owner: user,
      rooms: [],
      sensors: []
    };

    const projectExists = projects.some(project => project.name.toLowerCase() === newProjectName.toLowerCase());
    if (projectExists) {
      projectCreationError.set("Project with this name already exists.")
      return;
    }
    projectCreationError.set("");
    const newProject = await SitevisorService.createProject(project);
    newProjectName = "";

    if (newProject) {
      const defaultSensorType1: ISensorType = {id: -1, name: "Temperature", project: newProject.id}
      const defaultSensorType2: ISensorType = {id: -1, name: "Humidity", project: newProject.id}
      await SitevisorService.addSensorType(defaultSensorType1);
      await SitevisorService.addSensorType(defaultSensorType2);
    }

    projects = await SitevisorService.getProjects();
  }
</script>
  
<Header />
<div class="container mx-auto p-2">
  <div class="grid grid-cols-4 gap-10 p-4">
    {#each projects as project}
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body pb-4 pr-4">
          <h2 class="card-title">{project.name}</h2>
          <div class="card-actions justify-end">
            <a class="btn btn-primary" href="/projects/{project.id}/viewer">Open</a>
            <a class="btn btn-secondary" href="/projects/{project.id}/manage">Manage</a>
          </div>
        </div>
      </div>
    {/each}
    <div class="card bg-base-300 shadow-xl" >
      <div class="card-body pb-4 pr-4">
        <div class="relative">
          <input type="text"
            placeholder="New Project Name"
            class="input w-full max-w-xs { $projectCreationError ? 'border-red-500' : '' }"
            bind:value={newProjectName}
            on:input={() => projectCreationError.set("")}
          />
          {#if $projectCreationError}
            <div class="absolute -bottom-10 left-0 bg-red-100 text-red-500 text-sm p-2 rounded-lg shadow-md">
              {$projectCreationError}
            </div>
          {/if}
        </div>
        <div class="card-actions justify-end">
          <button class="btn btn-primary" on:click={createNewProject}>Create</button>
        </div>
      </div>
    </div>
  </div>
</div>
