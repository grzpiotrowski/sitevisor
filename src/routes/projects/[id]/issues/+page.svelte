<script lang="ts">
  import type { PageData } from './$types';
  import type { IProject, IIssue } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
  import AddIssueDialog from '$lib/components/AddIssueDialog.svelte';
  import { formatDate } from '$lib/utils/helpers';
  export let data: PageData;

  let project: IProject = data.project;
  let issues: IIssue[] = data.issues;
  let projectId: string = project.id.toString()
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
    issues = [...issues, newIssue];
}

</script>

<HeaderProject projectid={projectId}/>

<div class="container mx-auto p-5">
  <table class="table w-full table-zebra">
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Type</th>
        <th>Created by</th>
        <th>Assigned to</th>
        <th>Created</th>
        <th>Updated</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each issues as issue}
        <tr>
          <td>{issue.title}</td>
          <td>{issue.status}</td>
          <td>{issue.object_type}</td>
          <td>{issue.creator}</td>
          <td>{issue.assignee ? issue.assignee : 'Unassigned'}</td>
          <td>{formatDate(issue.created_at)}</td>
          <td>{formatDate(issue.updated_at)}</td>
          <td>
            <div class="flex justify-end gap-3">
              <a class="btn btn-xs" href="/projects/{projectId}/issues/{issue.id}">Details</a>
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="flex justify-end mt-4">
    <button class="btn btn-primary" on:click={openAddIssueDialog}>Add New Issue</button>
  </div>
</div>

{#if addIssueDialogVisible}
  <AddIssueDialog on:close={closeAddIssueDialog} on:issueCreated={handleIssueCreated} projectId={projectId}/>
{/if}
  