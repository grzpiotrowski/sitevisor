<script lang="ts">
	import HeaderProject from "$lib/components/HeaderProject.svelte";
    import type { PageData } from "./$types";
    import { goto } from "$app/navigation";
	import { SitevisorService } from "../../../../../services/sitevisor-service";
    import type { IRoom } from "$lib/common/interfaces/IRoom";
	import type { IIssue } from "../../../../../services/sitevisor-types";
	import IssuesTable from "$lib/components/IssuesTable.svelte";
	import { onMount } from "svelte";
	export let data: PageData;

    let room: IRoom = data.room;
    let issues: IIssue[] = [];
    let updatedName = room.name;

    onMount(async () => {
        await fetchIssues();
    });

    async function fetchIssues() {
    try {
      issues = await SitevisorService.getIssues({object_type: "room", object_id: room.id.toString()});
    } catch (error) {
      console.error("Failed to fetch issues:", error);
    }
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

</script>

<HeaderProject projectid={room.project.toString()}/>

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{room.name}</h2>
            <p>Level: {room.level}</p>
            <div class="card-actions justify-end">
                <button class="btn btn-error" on:click={deleteRoom}>Delete</button>
            </div>
        </div>
    </div>
    <div class="card bg-base-100 shadow-xl mt-4 w-1/2">
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
    <div class="card bg-base-100 mt-4 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">Issues</h2>
            <IssuesTable issues={issues} showTypeFilter={false} showTypeColumn={false}/>
        </div>
    </div>
</div>