<script lang="ts">
    import { onMount } from 'svelte';
    import { Viewer } from '$lib/viewer';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import AddSensorDialog from '$lib/components/AddSensorDialog.svelte';
    import AddRoomDialog from '$lib/components/AddRoomDialog.svelte';
    import type { PageData } from "./$types";
    import type { IProject } from "../../../../services/sitevisor-types";
	import type { Sensor } from '$lib/assets/Sensor';
    import type { Room } from '$lib/assets/Room';
	import { selectedSensorStore, selectedRoomStore } from '../../../../stores';
	import SensorDetails from '$lib/components/SensorDetails.svelte';
    import RoomDetails from '$lib/components/RoomDetails.svelte';
	import HeaderProject from '$lib/components/HeaderProject.svelte';
    import { sensorMapToReadingPositionArray } from '$lib/utils/helpers';
	export let data: PageData;

    const project: IProject = data.project;
    const posX: number | null = Number(data.posX);
    const posY: number | null = Number(data.posY);
    const posZ: number | null = Number(data.posZ);

    let el: HTMLCanvasElement;
    let viewer: Viewer;
    let viewerContainer: HTMLElement;
    let sockets: Map<string, WebSocket> = new Map();
    let socketsStatus: Map<string, boolean> = new Map();
    let overallWsStatus = 'red'; // red, yellow, green
    let showWsStatuses: boolean = false;
    let addSensorDialogVisible: boolean = false;
    let addRoomDialogVisible: boolean = false;
    let selectedSensor: Sensor | null = null;
    let selectedRoom: Room | null = null;
    let geometryMode3D: boolean = true;
    let heatmapVisibility: boolean = false;

    $: if (viewer) {
        viewer.setRoomsGeometryMode(geometryMode3D ? '3D' : '2D');
        viewer.heatmap.setVisibility(heatmapVisibility);
    }
    
    function getTopicNamesArray() {
        return project.kafka_topics ? project.kafka_topics.split(',') : [];
    }

    function reconnectWebSocket(topic: string) {
        let socket: WebSocket | undefined = sockets.get(topic);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close(); // This alone won't update the UI
        }

        // Triggers Svelte reactivity
        sockets.delete(topic);
        socketsStatus.set(topic, false);
        socketsStatus = new Map(socketsStatus);

        setTimeout(() => {
            let newSocket = initializeWebSocket(topic);
            if (newSocket) {
                sockets.set(topic, newSocket);
            }
            updateOverallWsStatus();
        }, 1000);
    }

    function updateOverallWsStatus() {
        const statuses = Array.from(socketsStatus.values());
        if (statuses.every(status => status)) {
            overallWsStatus = 'green';
        } else if (statuses.some(status => status)) {
            overallWsStatus = 'yellow';
        } else {
            overallWsStatus = 'red';
        }
    }

    function initializeWebSocket(topic: string): WebSocket | undefined {
        try {
            const uniqueClientId = `sitevisor_consumer_${Date.now()}_${topic}`;
            const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}?clientId=${uniqueClientId}&topic=${topic}`;
            
            let socket = new WebSocket(wsUrl);

            socket.addEventListener('open', (event) => {
                console.log(`WebSocket connection to topic: "${topic}" opened:`, event);
                // Triggers Svelte reactivity
                sockets.delete(topic);
                socketsStatus.set(topic, true);
                socketsStatus = new Map(socketsStatus);
                updateOverallWsStatus();
            });

            socket.addEventListener('message', (event) => {
                const message = JSON.parse(event.data);
                const sensorData = JSON.parse(message.value.value); // Double parse due to the structure
                updateSensorData(sensorData.sensor_id, sensorData.data);
                viewer.heatmap.updateHeatmap(sensorMapToReadingPositionArray(viewer.sensors));
            });

            socket.addEventListener('close', (event) => {
                console.log(`WebSocket connection to topic: "${topic}" closed:`, event);
                socketsStatus.set(topic, false);
                updateOverallWsStatus();
            });

            socket.addEventListener('error', (event) => {
                console.error(`WebSocket "${topic}" error:`, event);
                socketsStatus.set(topic, false);
                updateOverallWsStatus();
            });
            return socket;
        }
        catch (error) {
            console.log(`Unable to connect to topic: ${topic}`);
            return undefined;
        }
    }

    function initializeWebSockets() {
        if (!project.kafka_topics) {
            console.log("No topics configured.");
            return;
        }
        const topics = getTopicNamesArray();
        topics.forEach((topic) => {
            let socket = initializeWebSocket(topic);
            if (socket) { sockets.set(topic, socket); }
        });
    }

    onMount(() => {
        viewer = new Viewer();
        viewer.init(el, viewerContainer, project.id.toString());

        selectedSensorStore.subscribe(sensor => {
            selectedSensor = sensor;
        });

        selectedRoomStore.subscribe(room => {
            selectedRoom = room;
        });

        initializeWebSockets();

        viewer.setCameraAt(posX, posY, posZ);
    });

    function updateSensorData(device_id: string, newData: any) {
        const sensor = viewer.sensors.get(device_id);
        if (sensor) {
            sensor.update(newData);
            // Reassign selectedSensor to trigger Svelte reactivity
            if (sensor.userData.device_id === selectedSensor?.userData.device_id) {
                selectedSensor = sensor;
            }
        }
    }

    function toggleRoomInsertion() {
        const roomInsertionMode: boolean = viewer.toggleRoomInsertionMode();
        
        if (roomInsertionMode) {
            addRoomDialogVisible = true;
        }
        geometryMode3D = roomInsertionMode;
        console.log("Add Room button pressed.")
    }

    function toggleSensorInsertion() {
        const sensorInsertionMode: boolean = viewer.toggleSensorInsertionMode();
        if (sensorInsertionMode) {
            addSensorDialogVisible = true;
        }
        console.log("Add Sensor button pressed.")
    }
</script>

<svelte:head>
    <title>SiteVisor</title>
    <meta name="description" content="SiteVisor App" />
</svelte:head>

<div class="flex flex-col h-screen">
    <HeaderProject projectid={project.id.toString()}/>
    {#if selectedSensor}
        <SensorDetails on:removeSensor={e => viewer.removeSensorFromScene(e.detail.device_id)} selectedSensor={selectedSensor} rooms={viewer.rooms}/>
    {/if}
    {#if selectedRoom}
        <RoomDetails on:removeRoom={e => viewer.removeRoomFromScene(e.detail.id)} selectedRoom={selectedRoom}/>
    {/if}
    <div class="flex flex-1 overflow-hidden">
        <div class="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content flex flex-col items-center justify-center h-[calc(100vh-70px)] relative" bind:this={viewerContainer}>
                <canvas bind:this={el} />
                <div class="absolute bottom-2 left-2 flex flex-col items-end z-10">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <input type="checkbox" class="toggle" bind:checked={geometryMode3D} />
                            <span class="label-text ml-2">2D/3D</span> 
                        </label>
                    </div>
                </div>
            </div> 

            <Sidebar
                onToggleRoomInsertion={toggleRoomInsertion}
                onToggleSensorInsertion={toggleSensorInsertion}
                bind:isHeatmapActive={heatmapVisibility}
            />
        </div>
    </div>
    <div class="absolute bottom-5 right-5 flex flex-col items-end">
        <div class="w-full">
            {#if showWsStatuses}
            <div class="mb-2 p-4 bg-base-100 shadow-lg rounded-lg w-full">
                {#if socketsStatus.size > 0}
                {#each Array.from(socketsStatus.entries()) as [topic, status]}
                    <button class="flex justify-between w-full text-left p-2 hover:bg-gray-100 rounded-md"
                            on:click={() => reconnectWebSocket(topic)}>
                        <span class="mr-2">{topic}</span>
                        <span class={status ? 'text-green-500' : 'text-red-500'}>
                            {status ? 'Connected' : 'Disconnected'}
                        </span>
                    </button>
                {/each}
                {:else}
                    <div class="text-center">
                        No connections configured
                    </div>
                {/if}
            </div>
            {/if}
        </div>
        <button 
            class={`btn bg-base-100/20 border-base-100/30`}  
            on:click={() => showWsStatuses = !showWsStatuses}>
            <span class={`badge ${overallWsStatus === 'green' ? 'badge-success' : overallWsStatus === 'yellow' ? 'badge-warning' : 'badge-error'}`}></span>
            Realtime Data Status
        </button>
    </div>
</div>

<AddSensorDialog
    bind:isDialogOpen={addSensorDialogVisible}
    bind:viewer={viewer}
    projectId={project.id}
/>

<AddRoomDialog 
    bind:isDialogOpen={addRoomDialogVisible}
    bind:viewer={viewer}
    projectId={project.id}
/>