<script lang="ts">
	import HeaderProject from "$lib/components/HeaderProject.svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../../services/sitevisor-service";
    import type { IRoom } from "$lib/common/interfaces/IRoom";
	import type { IIssue, IProject } from "../../../../../services/sitevisor-types";
	import IssuesTable from "$lib/components/IssuesTable.svelte";
	import { onDestroy, onMount } from "svelte";
	import type { Vector3 } from "three";
	import type { ISensor, ISensorType } from "$lib/common/interfaces/ISensor";
	import SensorTable from "$lib/components/SensorTable.svelte";
	import { addWebSocketListener, removeWebSocketListener } from "../../../../../websocket-store";
	export let data: PageData;

    let room: IRoom = data.room;
    let project: IProject = data.project;
    let issues: IIssue[] = [];
    let sensors: ISensor[] = [];
    let sensorTypes: ISensorType[] = [];
    let updatedName = room.name;

    const topics: string[] = project.kafka_topics ? project.kafka_topics.split(',') : [];
    interface SensorReading {
        value: number;
        unit: string;
    }

    let sensorReadings: Record<string, SensorReading> = {};

    onMount(async () => {
        await fetchIssues();
        await fetchSensorTypes();
        await fetchSensors();

        // Add a message listener to the WebSocket connection
        topics.forEach((topic) => {
            addWebSocketListener(topic, 'message', handleMessage);
        });
    });

    onDestroy(() => {
        topics.forEach((topic) => {
            removeWebSocketListener(topic, 'message', handleMessage);
        });
    });

    function handleMessage(event: any) {
        const message = JSON.parse(event.data);
        const sensorData = JSON.parse(message.value.value);
        
        sensors.forEach(sensor => {
            if (sensor.device_id === sensorData.sensor_id) {
                let newReadings = { ...sensorReadings };
                newReadings[sensor.device_id] = { value: sensorData.data.value, unit: sensorData.data.unit };
                sensorReadings = newReadings;
            }
        });
    }

    async function fetchIssues() {
        try {
            issues = await SitevisorService.getIssues({object_type: "room", object_id: room.id.toString()});
        } catch (error) {
            console.error("Failed to fetch issues:", error);
        }
    }

    async function fetchSensorTypes() {
        sensorTypes = await SitevisorService.getSensorTypes(room.project.toString());
    }

    async function fetchSensors() {
        sensors = await SitevisorService.getSensors( {project_id: room.project.toString(), room_id: room.id} );
    }

    async function deleteRoom() {
        try {
            await SitevisorService.deleteRoom(room.id.toString());
            goto(`/projects/${room.project}/rooms`);
        } catch (error) {
            console.log("Error trying to delete Room: " + room.id);
        }
    }

    // Function to handle form submission
    async function updateRoom() {
        const updatedRoom: Partial<IRoom> = {
            name: updatedName,
        };

        try {
            await SitevisorService.updateRoom(room.id.toString(), updatedRoom);
            room = { ...room, ...updatedRoom };
            console.log("Room updated successfully");
        } catch (error) {
            console.error("Error updating Room:", error);
        }
    }

    function navigateToRoom(point1: Vector3 | null, point2: Vector3 | null) {
        if (point1 && point2) {
            const x: number = (point1.x + point2.x) / 2
            const y: number = (point1.y + point2.y) / 2
            const z: number = (point1.z + point2.z) / 2
            goto(`/projects/${room.project}/viewer?posX=${x}&posY=${y}&posZ=${z}`);
        }
    }

</script>

<HeaderProject projectid={room.project.toString()}/>

<div class="container mx-auto p-5">
    <div class="grid grid-cols-2 gap-4">
        <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title">{room.name}</h2>
                <p>Level: {room.level}</p>
                <div class="card-actions justify-end">
                    <button class="btn" on:click={() => navigateToRoom(room.point1, room.point2)}>Go to</button>
                    <button class="btn btn-error" on:click={deleteRoom}>Delete</button>
                </div>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl mt-4">
            <div class="card-body">
                <form on:submit|preventDefault={updateRoom} class="form">
                    <div class="form-control">
                        <label class="label" for="roomName">Room Name</label>
                        <input class="input input-bordered" type="text" id="roomName" bind:value={updatedName}>
                    </div>
                    <div class="card-actions justify-begin mt-4">
                        <button type="submit" class="btn btn-primary">Update Room</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="card bg-base-100 shadow-xl mt-4">
        <h2 class="text-xl font-bold p-4">Latest Sensor Readings</h2>
        {#each sensorTypes as sensorType}
            <div class="p-4">
                <h3 class="text-lg font-semibold">{sensorType.name}</h3>
                {#each sensors as sensor (sensor.device_id)}
                    {#if sensor.type.id === sensorType.id}
                        <p>{sensor.name}: 
                        {#if sensorReadings[sensor.device_id]}    
                            <b>{sensorReadings[sensor.device_id].value} {sensorReadings[sensor.device_id].unit}</b>
                        {:else}
                            <b>No data</b>
                        {/if}
                        </p>
                    {/if}
            {/each}
            </div>
        {/each}
    </div>

    <div class="card bg-base-100 mt-4 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Issues</h2>
            <IssuesTable issues={issues} showTypeFilter={false} showTypeColumn={false}/>
        </div>
    </div>
    <div class="card bg-base-100 mt-4 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Sensors</h2>
            <SensorTable
                projectId={room.project.toString()}
                sensors={sensors}
                sensorTypes={sensorTypes}
            />
        </div>
    </div>
</div>