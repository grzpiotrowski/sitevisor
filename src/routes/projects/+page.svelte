<script lang="ts">
	import Header from "$lib/components/Header.svelte";
    import { SitevisorService } from "../../services/sitevisor-service";
    import type { IProject } from "../../services/sitevisor-types";
    import type { ISensorType } from "$lib/common/interfaces/ISensor";
    import { loggedInUser } from "../../stores";
    import type { PageData } from "./$types";
    export let data: PageData;
    import { get } from "svelte/store";

    const user = get(loggedInUser);
    let projects = data.projects;

    let newProjectName = "";
  
    async function createNewProject() {
        const project: IProject = {
            id: -1,
            name: newProjectName,
            kafka_topics: '',
            owner: user,
            rooms: [],
            sensors: []
        };
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
  <div class="p-4">
    <div class="grid grid-cols-4 gap-10 p-4">
      {#each projects as project}
        <div class="card bg-base-200 shadow-xl">
          <figure class="px-10 pt-10"><img src="https://placehold.co/300x400" alt="Project Image" class="rounded-xl"></figure>
          <div class="card-body">
            <h2 class="card-title">{project.name}</h2>
            <div class="card-actions justify-end">
              <a class="btn btn-primary" href="/projects/{project.id}/viewer">Open</a>
              <a class="btn btn-secondary" href="/projects/{project.id}/manage">Manage</a>
            </div>
          </div>
        </div>
      {/each}
      <div class="card bg-base-300 shadow-xl cursor-pointer" >
        <div class="card-body">
          <h2 class="card-title">New Project</h2>
          <input type="text" placeholder="Project name" class="input w-full max-w-xs" bind:value={newProjectName}/>
          <div class="card-actions justify-center">
            <button class="btn btn-primary" on:click={createNewProject}>Create</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  