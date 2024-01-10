<script>
    export let onToggleRoomInsertion;
</script>

<aside>
    <button on:click={onToggleRoomInsertion}>Create Room</button>
</aside>

<style>
    aside {
        width: 250px;
        height: 100vh;
        position: fixed;
        left: 0;
        top: 0;
        background-color: #f3f3f3;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        z-index: 1000;
    }

    button {
        display: block;
        margin: 1em;
        padding: 0.5em 1em;
    }
</style>
