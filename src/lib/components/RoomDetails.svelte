<script lang="ts">
	import { selectedRoomStore } from "../../stores";
  import { createEventDispatcher } from 'svelte';
  import { SitevisorService } from "../../services/sitevisor-service";
	import AddIssueDialog from "./AddIssueDialog.svelte";
	import type { IIssue } from "../../services/sitevisor-types";
  import type { Room } from "$lib/assets/Room";

  export let selectedRoom: Room | null;
  let showRoomDeleteModal = false;
  const dispatch = createEventDispatcher();

  $: selectedRoom, handleRoomChange($selectedRoomStore);

  // Track the last selected room id
  let lastRoomId: string = ''; 

  let addIssueDialogVisible: boolean = false;

  function openAddIssueDialog() {
    addIssueDialogVisible = true;
    console.log("Opening Add issue dialog")
  }

  function closeAddIssueDialog() {
    addIssueDialogVisible = false;
    console.log("Closing Add issue dialog")
  }

  function handleIssueCreated(event: { detail: { issue: IIssue; }; }) {
    const newIssue: IIssue = event.detail.issue;
  }  

  function handleRoomChange(selectedRoom: Room | null) {
    if (selectedRoom) {
      if (selectedRoom.userData.id !== lastRoomId) {
        lastRoomId = selectedRoom.userData.id;
      }
    }
  }

  function closeRoomDetails() {
    selectedRoomStore.set(null);
  }

  async function confirmDelete() {
    if (selectedRoom) {
      await SitevisorService.deleteRoom(selectedRoom.userData.id);
      selectedRoomStore.set(null);
      dispatch('removeRoom', { id: selectedRoom.userData.id });
    }
  }
</script>

<div class="absolute top-0 right-0 mt-[70px] mr-4 p-4 bg-white shadow-md rounded-lg z-10 w-1/5">
  <button class="absolute top-0 right-0 m-2" on:click={closeRoomDetails}>&times;</button>
  <h3 class="text-lg font-semibold">Room: {selectedRoom?.userData.name}</h3>
  <p>Level: {selectedRoom?.userData.level}</p>
  <a class="btn btn-sm" href="/projects/{selectedRoom?.userData.project}/rooms/{selectedRoom?.userData.id}">Details</a>
  <button class="btn btn-primary btn-sm" on:click={openAddIssueDialog}>Add Issue</button>
  <button class="btn btn-error btn-sm" on:click={() => showRoomDeleteModal = true}>Delete Room</button>
  {#if showRoomDeleteModal}
    <div class="modal modal-open">
      <div class="modal-box relative">
        <h3 class="text-lg font-bold">Confirm Deletion</h3>
        <p class="py-4">Are you sure you want to delete this room?</p>
        <div class="modal-action">
          <button class="btn" on:click={() => showRoomDeleteModal = false}>Cancel</button>
          <button class="btn btn-error" on:click={confirmDelete}>Delete</button>
        </div>
      </div>
    </div>
  {/if}
</div>
{#if addIssueDialogVisible}
  <AddIssueDialog
    showObjectSelection={false}
    predefinedObjectId={selectedRoom?.userData.id}
    predefinedObjectType='room'
    on:close={closeAddIssueDialog}
    on:issueCreated={handleIssueCreated} projectId={selectedRoom?.userData.project}/>
{/if}