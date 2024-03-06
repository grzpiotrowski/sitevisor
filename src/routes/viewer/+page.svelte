<script lang="ts">
    import { onMount } from 'svelte';
    import { Viewer } from '$lib/viewer';
    import Sidebar from '../../lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';

    let el: HTMLCanvasElement;
    let viewer: Viewer;
    let viewerContainer: HTMLElement;
    let socket: WebSocket;

    onMount(() => {
        viewer = new Viewer();
        viewer.init(el, viewerContainer);

        // WebSocket connection
        socket = new WebSocket('ws://localhost:8078/socket/out?clientId=console_consumer&topic=my-topic');

        // WebSocket event listeners
        socket.addEventListener('open', (event) => {
            console.log('WebSocket connection opened:', event);
        });

        socket.addEventListener('message', (event) => {
            const message = event.data;
            console.log('WebSocket message:', message);
        });

        socket.addEventListener('close', (event) => {
            console.log('WebSocket connection closed:', event);
        });

        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
        });
    });

    function toggleRoomInsertion() {
        viewer.toggleRoomInsertionMode();
    }

    function toggleSensorInsertion() {
        viewer.toggleSensorInsertionMode();
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
</div>