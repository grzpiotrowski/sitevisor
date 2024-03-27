<script lang="ts">
  import type { PageData } from './$types';
  import type { IProject, IIssue } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
  import AddIssueDialog from '$lib/components/AddIssueDialog.svelte';
  import IssuesTable from '$lib/components/IssuesTable.svelte';
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
<div class="container mx-auto">
  <div class="container mx-auto overflow-y-scroll h-[calc(100vh-170px)] p-5 pt-0">
    <IssuesTable issues={issues} />
  </div>
  <div class="flex justify-end mt-8">
    <button class="btn btn-primary" on:click={openAddIssueDialog}>Add New Issue</button>
  </div>
</div>
{#if addIssueDialogVisible}
  <AddIssueDialog on:close={closeAddIssueDialog} on:issueCreated={handleIssueCreated} projectId={projectId}/>
{/if}
  