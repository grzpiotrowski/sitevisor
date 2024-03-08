<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { PageData } from "../$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../services/sitevisor-service";
    import type { IProject } from "../../../../services/sitevisor-types";
	export let data: PageData;

    const project: IProject = data.project;

    async function deleteProject() {
        try {
            await SitevisorService.deleteProject(project.id.toString());
            goto("/projects");
        } catch (error) {
            console.log("Error trying to delete Project: " + project.id);
        }
    }
</script>

<Header />

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{project.name}</h2>
            <p>Owner: {project.owner.username}</p>
            <p>Number of Rooms: {project.rooms.length}</p>
            <p>Number of Sensors: {project.sensors.length}</p>
            <div class="card-actions justify-end">
                <a class="btn btn-primary" href="/projects/{project.id}/viewer">Digital Twin</a>
                <button class="btn btn-error" on:click={deleteProject}>Delete</button>
            </div>
        </div>
    </div>
</div>