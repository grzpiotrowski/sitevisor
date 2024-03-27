<script lang="ts">
    import { writable } from 'svelte/store';
    import type { PageData } from "./$types";
    import HeaderProject from "$lib/components/HeaderProject.svelte";
    import { goto } from "$app/navigation";
    import { SitevisorService } from "../../../../../services/sitevisor-service";
    import type { IIssue } from "../../../../../services/sitevisor-types";
    import { formatDate } from '$lib/utils/helpers';
	import { get } from 'svelte/store';
	import { objectTypesStore, statusOptionsStore } from '../../../../../stores';
	import type { ISensor } from '$lib/common/interfaces/ISensor';
	import type { IRoom } from '$lib/common/interfaces/IRoom';
	import { onMount } from 'svelte';
    export let data: PageData;

    const statusOptions = get(statusOptionsStore);
    const objectTypes = get(objectTypesStore);

    let issue: IIssue = data.issue;
    let projectId: string = data.projectId;

    // Edit mode state
    let isEditMode = writable(false);

    // Temporary Issue for edit mode
    let tempIssue = writable({...issue});
    let object_name = "";

    $: formattedIssue = ({
        ...issue,
        status: statusOptions.get(issue.status),
        object_type: objectTypes.get(issue.object_type),
        created_at: formatDate(issue.created_at),
        updated_at: formatDate(issue.updated_at),
    });

    onMount(() => {
        getObjectName(issue.object_type, issue.object_id);
    });

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

    async function getObjectName(type: string, id: number) {
        if (type === 'sensor') {
            const object: ISensor = await SitevisorService.getSensor(id.toString());
            object_name = object.name;
        } else if (type === 'room') {
            const object: IRoom = await SitevisorService.getRoom(id.toString());
            object_name = object.name;
        } else {
            object_name = "Unknown";
        }
    }
</script>

<HeaderProject projectid={projectId}/>

<div class="container mx-auto p-5">
    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            {#if $isEditMode}
                <!-- Edit Mode Inputs -->
                <div class="form-control">
                    <label class="label" for="issueTitle">Title</label>
                    <input type="text" id="issueTitle" class="input input-bordered" required bind:value={$tempIssue.title}>
                </div>
                <div class="form-control">
                    <label class="label" for="issueDescription">Description</label>
                    <textarea id="issueDescription" class="textarea textarea-bordered" required bind:value={$tempIssue.description}></textarea>
                </div>
                <div class="form-control">
                    <label class="label" for="issueStatus">Status</label>
                    <select id="issueStatus" class="select select-bordered" required bind:value={$tempIssue.status}>
                        {#each statusOptions.entries() as [id, statusName]}
                            <option value={id}>{statusName}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-control">
                    <label class="label" for="issueAssignee">Assigned to</label>
                    <input class="input input-bordered" bind:value={$tempIssue.assignee} placeholder="Assigned to"/>
                </div>
                <div class="flex mt-8 gap-2">
                    <button class="btn btn-primary w-20" on:click={saveChanges}>Save</button>
                    <button class="btn w-20" on:click={() => isEditMode.set(false)}>Cancel</button>
                </div>
            {:else}
                <!-- View Mode Displays -->
                <h2 class="card-title">{formattedIssue.title}</h2>
                <p>Description: {formattedIssue.description}</p>
                <p>Status: {formattedIssue.status}</p>
                <p>Created by: {formattedIssue.creator}</p>
                <p>Assigned to: {formattedIssue.assignee ? formattedIssue.assignee : 'Unassigned'}</p>
                <p>Created: {formattedIssue.created_at}</p>
                <p>Updated: {formattedIssue.updated_at}</p>
                <p>{formattedIssue.object_type} Name: {object_name}</p>
                <p>Object Type: {formattedIssue.object_type}</p>
                <div class="flex mt-8 gap-2">
                    <a class="btn w-20" href="/projects/{projectId}/{issue.object_type}s/{issue.object_id}">{formattedIssue.object_type} Details</a>
                    <button class="btn btn-primary w-20" on:click={() => isEditMode.set(true)}>Edit</button>
                    <button class="btn btn-error w-20" on:click={deleteIssue}>Delete</button>
                </div>
            {/if}
        </div>
    </div>
</div>
