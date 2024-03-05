<script lang="ts">
	import Header from "$lib/components/Header.svelte";
    import { SitevisorService } from "../../services/sitevisor-service";
    import type { PageData } from "./$types";
    export let data: PageData;

    const projects = data.projects;
    console.log(projects);
  
    function createNewProject() {
        console.log("Creating new project...")
    }
  </script>
  
  <Header />
  <div class="p-4">
    <div class="grid grid-cols-3 gap-4 p-4">
      {#each projects as project}
        <div class="card w-96 bg-base-100 shadow-xl">
          <figure><img src="https://placehold.co/300x400" alt="Project Image"></figure>
          <div class="card-body">
            <h2 class="card-title">{project.name}</h2>
            <div class="card-actions justify-end">
              <a class="btn btn-primary" href="/projects/{project.id}">Open</a>
              <button class="btn btn-secondary">Manage</button>
            </div>
          </div>
        </div>
      {/each}
      <div class="card w-96 bg-base-100 shadow-xl cursor-pointer" on:click={createNewProject}>
        <div class="card-body">
          <h2 class="card-title">New Project</h2>
          <div class="placeholder-icon">
          </div>
        </div>
      </div>
    </div>
  </div>

  