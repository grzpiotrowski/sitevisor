<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { PageData } from "./$types";
    import type { IProject } from "../../../services/sitevisor-types";
	export let data: PageData;

    const project: IProject = data.project;
</script>

<Header />

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{project.name}</h2>
            <p>Owner: {project.owner.username}</p>
            <p>Number of Rooms: {project.rooms.length}</p>
            <p>Number of Sensors: {project.sensors.length}</p>
        </div>
    </div>
</div>