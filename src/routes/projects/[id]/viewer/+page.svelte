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
    let socket: WebSocket;
    let addSensorDialogVisible: boolean = false
    let addRoomDialogVisible: boolean = false
    let sensorCreationMode: boolean;

    let wsConnected = false;

    function reconnectWebSocket() {
        console.log(socket);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
        }

        setTimeout(() => {
            initializeWebSocket();
        }, 1000);
    }

    function initializeWebSocket() {
        const wsUrl = `${import.meta.env.VITE_WEBSOCKET_URL}?clientId=console_consumer&topic=${project.kafka_topics}`;
        socket = new WebSocket(wsUrl);

        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection opened:', event);
            wsConnected = true;
        });

        socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);
            const sensorData = JSON.parse(message.value.value); // Double parse due to the structure
            updateSensorData(sensorData.sensor_id, sensorData.data);
        });

        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event);
            wsConnected = false;
        });

        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
            wsConnected = false;
        });
    }

    onMount(() => {
        viewer = new Viewer();
        viewer.init(el, viewerContainer, project.id.toString());
        
        initializeWebSocket();
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
    <button 
        class={`btn bg-base-100/20 border-base-100/30 absolute bottom-5 right-5`} 
        on:click={reconnectWebSocket}>
        <span class={`badge ${wsConnected ? 'badge-success' : 'badge-error'} border-base-300`}></span>
        Realtime Data Status
    </button>
</div>

<AddSensorDialog
    bind:isDialogOpen={addSensorDialogVisible}
    bind:viewer={viewer}
    />

<AddRoomDialog 
    bind:isDialogOpen={addRoomDialogVisible}
    bind:viewer={viewer}
/>