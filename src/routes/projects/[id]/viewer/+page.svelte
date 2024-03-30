<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
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
    import GradientBar from '$lib/components/GradientBar.svelte'
	import HeaderProject from '$lib/components/HeaderProject.svelte';
    import { sensorMapToReadingPositionArray } from '$lib/utils/helpers';
	import type { ISensorType } from '$lib/common/interfaces/ISensor';
	import { SitevisorService } from '../../../../services/sitevisor-service';
    import { loggedInUser } from '../../../../stores';
	import { get } from 'svelte/store';
    import { webSocketStore,
        addWebSocketConnection,
        removeWebSocketConnection,
        updateWebSocketStatus,
        removeWebSocketListener,
        type WebSocketListener
    } from '../../../../websocket-store';
	export let data: PageData;

    const user = get(loggedInUser);

    const project: IProject = data.project;
    const posX: number | null = Number(data.posX);
    const posY: number | null = Number(data.posY);
    const posZ: number | null = Number(data.posZ);

    let el: HTMLCanvasElement;
    let viewer: Viewer;
    let viewerContainer: HTMLElement;
    let overallWsStatus = 'red'; // red, yellow, green, none
    let showWsStatuses: boolean = false;
    let addSensorDialogVisible: boolean = false;
    let addRoomDialogVisible: boolean = false;
    let selectedSensor: Sensor | null = null;
    let selectedRoom: Room | null = null;
    let geometryMode3D: boolean = true;
    let sensorTypes: ISensorType[] = [];

    let heatmapVisibility: boolean = false;
    let minValue: number = 15;
    let maxValue: number = 25;

    let webSockets = new Map<string, WebSocket>();
    let webSocketStatuses = new Map<string, boolean>();
    let webSocketListeners: Map<string, WebSocketListener>;

    webSocketStore.subscribe(({ connections, statuses, listeners }) => {
        webSockets = connections;
        webSocketStatuses = statuses;
        webSocketListeners = listeners;
        updateOverallWsStatus();
    });

    $: if (viewer) {
        viewer.setRoomsGeometryMode(geometryMode3D ? '3D' : '2D');
        viewer.setHeatmapVisibility(heatmapVisibility);
        if (viewer.heatmap) {
            viewer.heatmap.minValue = minValue;
            viewer.heatmap.maxValue = maxValue;
        }
    }
    $: sensorTypeFilter = "";

    async function fetchSensorTypes() {
        sensorTypes = await SitevisorService.getSensorTypes(project.id.toString());
        sensorTypeFilter = sensorTypes[0].name;
        console.log(sensorTypeFilter);
    }

    function getTopicNamesArray() {
        return project.kafka_topics ? project.kafka_topics.split(',') : [];
    }

    function reconnectWebSocket(topic: string) {
        removeWebSocketConnection(topic);

        setTimeout(() => {
            let newSocket = initializeWebSocket(topic);
            if (newSocket) {
                addWebSocketConnection(topic, newSocket);
            }
        }, 1000);
    }

    function updateOverallWsStatus() {
        const statuses = Array.from($webSocketStore.statuses.values());
        if (statuses.length === 0) {
            overallWsStatus = 'none';
        } else if (statuses.every(status => status)) {
            overallWsStatus = 'green';
        } else if (statuses.some(status => status)) {
            overallWsStatus = 'yellow';
        } else {
            overallWsStatus = 'red';
        }
    }

    function initializeWebSocket(topic: string): WebSocket | undefined {
        // Check if WebSocket connection already exists
        if (webSockets.has(topic)) {
            console.log(`WebSocket for topic "${topic}" already exists.`);
            return webSockets.get(topic); // Return the existing WebSocket
        }
        try {
            const uniqueClientId = `sitevisor_consumer_${user.username}_${topic}`;
            const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}?clientId=${uniqueClientId}&topic=${topic}`;

            let socket = new WebSocket(wsUrl);

            // Setup event listeners
            setupWebSocketListeners(socket, topic);

            // Store the websocket connection
            addWebSocketConnection(topic, socket);
            return socket;
        } catch (error) {
            console.error(`Unable to initialize WebSocket for topic: ${topic}`, error);
            return undefined;
        }
    }

    // Initialise all websocket connection based on kafka_topics specified in the project
    function initializeWebSockets() {
        if (!project.kafka_topics) {
            console.log("No topics configured.");
            return;
        }
        const topics = getTopicNamesArray();
        topics.forEach((topic) => {
            // Check if a connection already exists
            if (!webSockets.has(topic)) {
                initializeWebSocket(topic);
                console.log(`Created a WebSocket for topic ${topic}`)
            } else {
                const existingSocket = webSockets.get(topic);
                if (existingSocket) {
                    setupWebSocketListeners(existingSocket, topic);
                }
                console.log(`WebSocket for topic ${topic} already exists.`);
            }
        });
    }

    const handleOpenEvent = (topic: any) => () => {
        console.log(`WebSocket connection opened for topic: ${topic}`);
        updateWebSocketStatus(topic, true);
    };

    const handleMessageEvent = (topic: any) => (event: any) => {
        const message = JSON.parse(event.data);
        console.log(`Processing data from topic: ${message.topic}`);
        const sensorData = JSON.parse(message.value.value); // Double parse due to the structure
        updateSensorData(sensorData.sensor_id, sensorData.data);
        viewer.heatmap.updateHeatmapAdvanced(sensorMapToReadingPositionArray(viewer.sensors, sensorTypeFilter));
    };

    const handleCloseEvent = (topic: any) => () => {
        console.log(`WebSocket connection closed for topic: ${topic}`);
        updateWebSocketStatus(topic, false);
    };

    const handleErrorEvent = (topic: any) => (event: any) => {
        console.error(`WebSocket error for topic: ${topic}`, event);
    };

    // Attaches listeners to handlers 
    function setupWebSocketListeners(socket: WebSocket, topic: string) {

        // Add event listeners to the WebSocket connection
        socket.addEventListener('open', handleOpenEvent(topic));
        socket.addEventListener('message', handleMessageEvent(topic));
        socket.addEventListener('close', handleCloseEvent(topic));
        socket.addEventListener('error', handleErrorEvent(topic));
    }

    function clearExistingWebSockets() {
        // Iterate over existing connections and close each one
        webSockets.forEach((_, topic) => {
            removeWebSocketConnection(topic);
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

        // Preventing the connections existing when switching to a different project
        clearExistingWebSockets();

        initializeWebSockets();

        viewer.setCameraAt(posX, posY, posZ);

        fetchSensorTypes();
    });

    onDestroy(() => {
        // Remove event listeners
        const topics = getTopicNamesArray();
        topics.forEach((topic) => {
            removeWebSocketListener(topic, 'open', handleOpenEvent);
            removeWebSocketListener(topic, 'message', handleMessageEvent);
            removeWebSocketListener(topic, 'close', handleCloseEvent);
            removeWebSocketListener(topic, 'error', handleErrorEvent);
        });
        // Dispose of the rendered to avoid too many WebGL contexts bug
        viewer.renderer.dispose();
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
                {#if heatmapVisibility}
                <div class="absolute top-2 left-2 flex flex-col items-end z-10">
                    <GradientBar
                        minHue={0}
                        maxHue={120}
                        bind:minValue={minValue}
                        bind:maxValue={maxValue}
                        sensorTypes={sensorTypes}
                        bind:sensorTypeFilter={sensorTypeFilter}
                    />
                </div>
                {/if}
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
                {#if $webSocketStore.statuses.size > 0}
                {#each Array.from($webSocketStore.statuses.entries()) as [topic, status]}
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
            <span class={`badge ${overallWsStatus === 'green' ? 'badge-success' : overallWsStatus === 'yellow' ? 'badge-warning' : overallWsStatus === 'none' ? 'badge-dark' : 'badge-error'}`}></span>
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