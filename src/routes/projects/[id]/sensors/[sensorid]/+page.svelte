<script lang="ts">
	import HeaderProject from "$lib/components/HeaderProject.svelte";
    import SensorChart from "$lib/components/Chart.svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../../services/sitevisor-service";
    import type { ISensor } from "$lib/common/interfaces/ISensor";
	import type { IIssue, IProject } from "../../../../../services/sitevisor-types";
	import IssuesTable from "$lib/components/IssuesTable.svelte";
	import { onDestroy, onMount } from "svelte";
	import type { Vector3 } from "three";
	import { addWebSocketListener, removeWebSocketListener } from "../../../../../websocket-store";
	export let data: PageData;

    let sensor: ISensor = data.sensor;
    let issues: IIssue[] = [];
    let project: IProject = data.project;
    const topics: string[] = project.kafka_topics ? project.kafka_topics.split(',') : [];
    let updatedName = sensor.name;
    let updatedDeviceId = sensor.device_id;
    let sensorReadings: number[] = [];

    function handleMessage(event: any) {
        const message = JSON.parse(event.data);
        const sensorData = JSON.parse(message.value.value);
        if (sensorData.sensor_id === sensor.device_id) {
            sensorReadings = [...sensorReadings, sensorData.data.value].slice(-30); // Keep only the last 30 readings
        }
    }

    onMount(async () => {
        await fetchIssues();
        
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

    async function fetchIssues() {
        try {
            issues = await SitevisorService.getIssues({object_type: "sensor", object_id: sensor.id.toString()});
        } catch (error) {
            console.error("Failed to fetch issues:", error);
        }
    }

    async function deleteSensor() {
        try {
            await SitevisorService.deleteSensor(sensor.id.toString());
            goto(`/projects/${sensor.project}/sensors`);
        } catch (error) {
            console.log("Error trying to delete Sensor: " + sensor.id);
        }
    }

    // Function to handle form submission
    async function updateSensor() {
        const updatedSensor: Partial<ISensor> = {
            name: updatedName,
            device_id: updatedDeviceId,
        };

        try {
        await SitevisorService.updateSensor(sensor.id.toString(), updatedSensor);
        sensor = { ...sensor, ...updatedSensor };
        console.log("Sensor updated successfully");
        } catch (error) {
            console.error("Error updating Sensor:", error);
        }
    }

    function navigateToSensor(pos: Vector3 | null) {
        if (pos) {
            goto(`/projects/${sensor.project}/viewer?posX=${pos.x}&posY=${pos.y}&posZ=${pos.z}`);
        }
  }

</script>

<HeaderProject projectid={sensor.project.toString()}/>

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{sensor.name}</h2>
            <p>Device ID: {sensor.device_id}</p>
            <p>Level: {sensor.level}</p>
            <p>Type: {sensor.type.name}</p>
            <div class="card-actions justify-end">
                <button class="btn" on:click={() => navigateToSensor(sensor.position)}>Go to</button>
                <button class="btn btn-error" on:click={deleteSensor}>Delete</button>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div class="card bg-base-100 shadow-xl mt-4">
            <div class="card-body">
                <form on:submit|preventDefault={updateSensor} class="form">
                    <div class="form-control">
                        <label class="label" for="sensorName">Sensor Name</label>
                        <input class="input input-bordered" type="text" id="sensorName" bind:value={updatedName}>
                    </div>
                    <div class="form-control">
                        <label class="label" for="sensorName">Device ID</label>
                        <input class="input input-bordered" type="text" id="deviceId" bind:value={updatedDeviceId}>
                    </div>
                    <div class="card-actions justify-begin mt-4">
                        <button type="submit" class="btn btn-primary">Update Sensor</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="card bg-base-100 shadow-xl mt-4">
            <div class="card-body">
                <h2 class="card-title">Sensor Data</h2>
                <SensorChart bind:sensorData={sensorReadings} sensorId={sensor.device_id} chartId={`sensor-details-page-chart-${sensor.device_id}`}/>
            </div>
        </div>
    </div>
    <div class="card bg-base-100 mt-4 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Issues</h2>
            <IssuesTable issues={issues} showTypeFilter={false} showTypeColumn={false}/>
        </div>
    </div>
</div>