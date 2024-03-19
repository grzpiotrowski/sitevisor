<script lang="ts">
    import { onMount } from 'svelte';
    import { Viewer } from '$lib/viewer';
    import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
    import AddSensorDialog from '$lib/components/AddSensorDialog.svelte';
    import AddRoomDialog from '$lib/components/AddRoomDialog.svelte';
    import type { PageData } from "../$types";
    import type { IProject } from "../../../../services/sitevisor-types";
	export let data: PageData;

    const project: IProject = data.project;

    let el: HTMLCanvasElement;
    let viewer: Viewer;
    let viewerContainer: HTMLElement;
    let sockets: Map<string, WebSocket> = new Map();
    let socketsStatus: Map<string, boolean> = new Map();
    let overallWsStatus = 'red'; // red, yellow, green
    let showWsStatuses: boolean = false;
    let addSensorDialogVisible: boolean = false;
    let addRoomDialogVisible: boolean = false;
    
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
        
        initializeWebSockets();
    });

    function updateSensorData(device_id: string, newData: any) {
        const sensor = viewer.sensors.get(device_id);
        if (sensor) {
            sensor.update(newData);
        }
    }

    function toggleRoomInsertion() {
        const roomInsertionMode: boolean = viewer.toggleRoomInsertionMode();
        if (roomInsertionMode) {
            addRoomDialogVisible = true;
        }
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
    <Header />
    <div class="flex flex-1 overflow-hidden">
        <div class="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content flex flex-col items-center justify-center h-[calc(100vh-70px)]" bind:this={viewerContainer}>
                <canvas bind:this={el} />
            </div> 

            <Sidebar
                onToggleRoomInsertion={toggleRoomInsertion}
                onToggleSensorInsertion={toggleSensorInsertion}
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
    />

<AddRoomDialog 
    bind:isDialogOpen={addRoomDialogVisible}
    bind:viewer={viewer}
/>