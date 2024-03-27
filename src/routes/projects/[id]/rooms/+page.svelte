<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';
  import type { IRoom} from '../../../../lib/common/interfaces/IRoom';
  import type { IProject } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
	import { SitevisorService } from '../../../../services/sitevisor-service';
	import type { Vector3 } from 'three';
  export let data: PageData;

  let project: IProject = data.project;
  let rooms: IRoom[] = [];

  let pendingDeleteRoomId: string | null = null;
  let showRoomDeleteModal: boolean = false;

  onMount(() => {
    fetchRooms();
  });

  async function fetchRooms() {
    rooms = await SitevisorService.getRooms(project.id.toString());
  }

  function confirmDelete(roomId: string) {
    pendingDeleteRoomId = roomId;
    showRoomDeleteModal = true;
  }

  async function deleteRoom() {
    if (pendingDeleteRoomId) {
      try {
        await SitevisorService.deleteRoom(pendingDeleteRoomId);  
        rooms = rooms.filter(r => r.id !== pendingDeleteRoomId);
        showRoomDeleteModal = false;
        pendingDeleteRoomId = null;
      } catch (error) {
        console.error("Error deleting room", error);
      }
    }
  }

  function navigateToRoom(point1: Vector3 | null, point2: Vector3 | null) {
    if (point1 && point2) {
      const x: number = (point1.x + point2.x) / 2
      const y: number = (point1.y + point2.y) / 2
      const z: number = (point1.z + point2.z) / 2
      goto(`/projects/${project.id.toString()}/viewer?posX=${x}&posY=${y}&posZ=${z}`);
    }
  }
</script>

<HeaderProject projectid={project.id.toString()}/>

<div class="container mx-auto p-5">
  <table class="table w-full table-zebra">
    <thead>
      <tr>
        <th>Name</th>
        <th>Level</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each rooms as room}
        <tr>
          <td>{room.name}</td>
          <td>{room.level}</td>
          <td>
            <div class="flex justify-end gap-3">
              <button class="btn btn-error btn-xs" on:click={() => confirmDelete(room.id)}>Delete</button>
              <a class="btn btn-xs" href="/projects/{project.id}/rooms/{room.id}">Details</a>
              <button class="btn btn-xs" on:click={() => navigateToRoom(room.point1, room.point2)}>Go to</button>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if showRoomDeleteModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Confirm Deletion</h3>
        <p>Are you sure you want to delete this room?</p>
        <div class="modal-action">
          <button class="btn" on:click={() => showRoomDeleteModal = false}>Cancel</button>
          <button class="btn btn-error" on:click={deleteRoom}>Delete</button>
        </div>
      </div>
    </div>  
  {/if}
</div>
  