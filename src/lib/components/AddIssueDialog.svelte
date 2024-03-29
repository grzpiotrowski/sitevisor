<script lang="ts">
    import { createEventDispatcher, onMount } from 'svelte';
    import { SitevisorService } from '../../services/sitevisor-service';
    import type { IIssue } from '../../services/sitevisor-types';
	import type { ISensor } from '$lib/common/interfaces/ISensor';
	import type { IRoom } from '$lib/common/interfaces/IRoom';
	import { get } from 'svelte/store';
	import { objectTypesStore, statusOptionsStore } from '../../stores';
    export let projectId: string;
    export let showObjectSelection: boolean = true; // Controls the visibility of object selection fields
    export let predefinedObjectType: string | undefined = undefined;
    export let predefinedObjectId: number | undefined = undefined; 

    const statusOptions = get(statusOptionsStore);
    const objectTypes = get(objectTypesStore);
    const defaultObjectType: string[] = objectTypes.entries().next().value;
    let objects: Array<ISensor | IRoom> = [];

    const dispatch = createEventDispatcher();

    let issueDetails: Partial<IIssue> = {
        title: '',
        description: '',
        status: 'opened',
        object_id: predefinedObjectId,
        object_type: predefinedObjectType,
    };

    onMount(() => {
        if (predefinedObjectType) {
            fetchObjects(predefinedObjectType);
        }
        else {
            fetchObjects(defaultObjectType[0])
        }
    });

    // Could possibly have a method in the SitevisorService to resolve that
    // Ideally ISensor and IRoom would have a parent interface
    async function fetchObjects(type: string) {
        if (type === 'sensor') {
            objects = await SitevisorService.getSensors({project_id: projectId});
        } else if (type === 'room') {
            objects = await SitevisorService.getRooms(projectId);
        }
        // Automatically select the object if predefined
        if (predefinedObjectId) {
            issueDetails.object_id = predefinedObjectId;
        }
    }

    async function handleCreateIssueSubmit() {
        await SitevisorService.createIssue(issueDetails, projectId)
            .then(createdIssue => {
                dispatch('issueCreated', { issue: createdIssue });
                dispatch('close');
            })
            .catch(error => {
                console.error("Error creating new issue:", error);
            });
    }

    function handleAddIssueCancelled() {
        dispatch('close');
    }

</script> 

<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Create New Issue</h3>
        <form on:submit|preventDefault={handleCreateIssueSubmit}>
            <!-- Issue Title -->
            <div class="form-control">
                <label class="label" for="issueTitle">Title</label>
                <input type="text" id="issueTitle" class="input input-bordered" required bind:value={issueDetails.title}>
            </div>

            <!-- Issue Description -->
            <div class="form-control">
                <label class="label" for="issueDescription">Description</label>
                <textarea id="issueDescription" class="textarea textarea-bordered" required bind:value={issueDetails.description}></textarea>
            </div>

            <!-- Issue Status -->
            <div class="form-control">
                <label class="label" for="issueStatus">Status</label>
                <select id="issueStatus" class="select select-bordered" required bind:value={issueDetails.status}>
                    {#each statusOptions.entries() as [id, statusName]}
                        <option value={id}>{statusName}</option>
                    {/each}
                </select>
            </div>

            {#if showObjectSelection}
                <!-- Object Type Selection -->
                <div class="form-control">
                    <label class="label" for="objectType">Object Type</label>
                    <select id="objectType" class="select select-bordered"
                            bind:value={issueDetails.object_type}
                            on:change="{() => fetchObjects(issueDetails.object_type ?? defaultObjectType[0])}">
                        {#each objectTypes.entries() as [id, name]}
                            <option value={id}>{name}</option>
                        {/each}
                    </select>
                </div>
                
                <!-- Specific Object Selection -->
                <div class="form-control">
                    <label class="label" for="objectId">Object</label>
                    <select id="objectId" class="select select-bordered" bind:value={issueDetails.object_id}>
                        {#each objects as object}
                            <option value={object.id}>{object.name}</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <div class="modal-action">
                <button type="submit" class="btn">Create Issue</button>
                <button type="button" class="btn" on:click={handleAddIssueCancelled}>Close</button>
            </div>
        </form>
    </div>
</div>
