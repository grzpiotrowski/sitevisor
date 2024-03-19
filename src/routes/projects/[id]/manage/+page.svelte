<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import type { PageData } from "../$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../services/sitevisor-service";
    import type { IProject } from "../../../../services/sitevisor-types";
	export let data: PageData;

    let project: IProject = data.project;
    let updatedName = project.name;
    let updatedKafkaTopics = project.kafka_topics;

    async function deleteProject() {
        try {
            await SitevisorService.deleteProject(project.id.toString());
            goto("/projects");
        } catch (error) {
            console.log("Error trying to delete Project: " + project.id);
        }
    }

    // Function to handle form submission
    async function updateProject() {
        const updatedProject = {
            ...project,
            name: updatedName,
            kafka_topics: updatedKafkaTopics,
        };

        try {
            await SitevisorService.updateProject(project.id.toString(), updatedProject);
            project = updatedProject;
            console.log("Project updated successfully");
        } catch (error) {
            console.error("Error updating project:", error);
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
    <div class="card bg-base-100 shadow-xl mt-4 w-1/2">
        <div class="card-body">
            <form on:submit|preventDefault={updateProject} class="form">
                <div class="form-control">
                    <label class="label" for="projectName">Project Name</label>
                    <input class="input input-bordered" type="text" id="projectName" bind:value={updatedName}>
                </div>
                <div class="form-control">
                    <label class="label" for="kafkaTopics">Kafka Topics</label>
                    <input class="input input-bordered" type="text" id="kafkaTopics" bind:value={updatedKafkaTopics}>
                </div>
                <div class="card-actions justify-begin mt-4">
                    <button type="submit" class="btn btn-primary">Update Project</button>
                </div>
            </form>
        </div>
    </div>
</div>