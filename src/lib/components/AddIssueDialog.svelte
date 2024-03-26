<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { SitevisorService } from '../../services/sitevisor-service';
    import type { IIssue } from '../../services/sitevisor-types';
    export let projectId: string;

    const statusOptions = ['opened', 'in progress', 'resolved'];
    
    const dispatch = createEventDispatcher();

    let issueDetails: Partial<IIssue> = {
        title: '',
        description: '',
        status: 'opened',
        object_id: -1,
        object_type: 'sensor',
    };

    async function handleCreateIssueSubmit() {
        await SitevisorService.createIssue(issueDetails, "2", 'sensor', projectId)
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
                    {#each statusOptions as status}
                        <option value={status}>{status}</option>
                    {/each}
                </select>
            </div>

            <div class="modal-action">
                <button type="submit" class="btn">Create Issue</button>
                <button type="button" class="btn" on:click={handleAddIssueCancelled}>Close</button>
            </div>
        </form>
    </div>
</div>
