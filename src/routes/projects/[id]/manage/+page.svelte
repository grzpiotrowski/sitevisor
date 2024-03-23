<script lang="ts">
	import HeaderProject from "$lib/components/HeaderProject.svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../services/sitevisor-service";
    import type { IProject, ISensorType } from "../../../../services/sitevisor-types";
	export let data: PageData;

    let project: IProject = data.project;
    let sensorTypes: ISensorType[] = data.sensorTypes;
    let updatedName = project.name;
    let updatedKafkaTopics = project.kafka_topics;
    let newSensorTypeName = '';

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

    async function deleteSensorType(id: number) {
        try {
            await SitevisorService.deleteSensorType(id.toString());
            sensorTypes = sensorTypes.filter(sensorType => sensorType.id !== id);
        } catch (error) {
            console.error(`Error deleting sensor type with id ${id}`, error);
        }
    }

    async function addSensorType() {
        let sensorTypeData: ISensorType = {
            id: -1,
            name: newSensorTypeName,
            project: project.id,
        };
        try {
            const newSensorType = await SitevisorService.addSensorType(sensorTypeData);
            if (newSensorType) {
                sensorTypes = [...sensorTypes, newSensorType];
                newSensorTypeName = '';
            }
        } catch (error) {
            console.error(`Error adding sensor type: ${newSensorTypeName}`, error);
        }
    }
</script>

<HeaderProject projectid={project.id.toString()}/>

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{project.name}</h2>
            <p>Owner: {project.owner.username}</p>
            <p>Number of Rooms: {project.rooms.length}</p>
            <p>Number of Sensors: {project.sensors.length}</p>
            <div class="card-actions justify-end">
                <a class="btn btn-primary" href="/projects/{project.id}/viewer">Digital Twin</a>
                <button class="btn btn-error" on:click={deleteProject}>Delete Project</button>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div class="card bg-base-100 shadow-xl mt-4">
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
        <!-- Sensor Types Management Table -->
        <div class="card bg-base-100 shadow-xl mt-4">
            <div class="card-body">
                <h2 class="card-title">Sensor Types</h2>
                <table class="table w-full">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each sensorTypes as sensorType}
                        <tr>
                            <td>{sensorType.name}</td>
                            <td>
                                <button class="btn btn-error btn-xs" on:click={() => deleteSensorType(sensorType.id)}>Delete</button>
                            </td>
                        </tr>
                        {/each}
                        <tr>
                            <td>
                                <input class="input input-bordered input-sm" type="text" bind:value={newSensorTypeName} placeholder="New Sensor Type"/>
                            </td>
                            <td>
                                <button class="btn btn-primary btn-xs" on:click={addSensorType}>Create</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        </div>

</div>