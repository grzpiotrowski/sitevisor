<script lang="ts">
    import { writable } from 'svelte/store';
    import type { PageData } from "./$types";
    import HeaderProject from "$lib/components/HeaderProject.svelte";
    import { goto } from "$app/navigation";
    import { SitevisorService } from "../../../../../services/sitevisor-service";
    import type { IIssue } from "../../../../../services/sitevisor-types";
    import { formatDate } from '$lib/utils/helpers';
    export let data: PageData;

    let issue: IIssue = data.issue;
    let projectId: string = data.projectId;

    // Edit mode state
    let isEditMode = writable(false);

    // Temporary Issue for edit mode
    let tempIssue = writable({...issue});

    async function saveChanges() {
        const updatedIssueData = $tempIssue;
        try {
            await SitevisorService.updateIssue(issue.id.toString(), updatedIssueData);
            issue = updatedIssueData;
            isEditMode.set(false);
            console.log("Issue updated successfully");
        } catch (error) {
            console.error(`Error updating Issue: ${issue.id}`, error);
        }
    }

    async function deleteIssue() {
        try {
            await SitevisorService.deleteIssue(issue.id.toString());
            goto(`/projects/${projectId}/issues/`);
        } catch (error) {
            console.error("Error trying to delete Issue: " + issue.id, error);
        }
    }
</script>

<HeaderProject projectid={projectId}/>

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            {#if $isEditMode}
                <!-- Edit Mode Inputs -->
                <input class="input input-bordered" bind:value={$tempIssue.title} placeholder="Title"/>
                <textarea class="textarea textarea-bordered h-24" bind:value={$tempIssue.description} placeholder="Description"></textarea>
                <select class="select select-bordered" bind:value={$tempIssue.status}>
                    <option value="opened">Opened</option>
                    <option value="in progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>                
                <input class="input input-bordered" bind:value={$tempIssue.assignee} placeholder="Assigned to"/>
                <input class="input input-bordered" type="number" bind:value={$tempIssue.object_id} placeholder="Object ID"/>
                <select class="select select-bordered" bind:value={$tempIssue.object_type}>
                    <option value="sensor">Sensor</option>
                    <option value="room">Room</option>
                </select>
                <div class="flex mt-8 gap-2">
                    <button class="btn btn-primary w-20" on:click={saveChanges}>Save</button>
                    <button class="btn w-20" on:click={() => isEditMode.set(false)}>Cancel</button>
                </div>
            {:else}
                <!-- View Mode Displays -->
                <h2 class="card-title">{issue.title}</h2>
                <p>Description: {issue.description}</p>
                <p>Status: {issue.status}</p>
                <p>Created by: {issue.creator}</p>
                <p>Assigned to: {issue.assignee ? issue.assignee : 'Unassigned'}</p>
                <p>Created: {formatDate(issue.created_at)}</p>
                <p>Updated: {formatDate(issue.updated_at)}</p>
                <p>Object ID: {issue.object_id}</p>
                <p>Object Type: {issue.object_type}</p>
                <div class="flex mt-8 gap-2">
                    <button class="btn btn-primary w-20" on:click={() => isEditMode.set(true)}>Edit</button>
                    <button class="btn btn-error w-20" on:click={deleteIssue}>Delete</button>
                </div>
            {/if}
        </div>
    </div>
</div>
