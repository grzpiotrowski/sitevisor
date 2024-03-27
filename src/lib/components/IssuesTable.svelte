<script lang="ts">
  import type { IIssue } from "../../services/sitevisor-types";
  import { formatDate } from "$lib/utils/helpers";
  import { get } from 'svelte/store';
	import { objectTypesStore, statusOptionsStore } from "../../stores";

  export let issues: IIssue[];
  export let showTypeFilter: boolean = true;
  export let showTypeColumn: boolean = true;

  const statusOptions = get(statusOptionsStore);
  const objectTypes = get(objectTypesStore);

  let statusFilter: string = '';
  let objectTypeFilter: string = '';

  $: formattedIssues = issues.map(issue => ({
    ...issue,
    status: statusOptions.get(issue.status),
    object_type: objectTypes.get(issue.object_type),
    created_at: formatDate(issue.created_at),
    updated_at: formatDate(issue.updated_at)
  })).filter(issue => {
    return (statusFilter ? issue.status === statusFilter : true) &&
           (objectTypeFilter ? issue.object_type === objectTypeFilter : true);
  });
</script>

<div>
  <div class="mb-4 flex items-center">
    <label class="label text-sm mr-3" for="issueStatusSelect">Status: </label>
    <select id="issueStatusSelect" class="select select-sm" bind:value={statusFilter}>
      <option value="">All</option>
      {#each Array.from(statusOptions.values()) as status}
        <option value={status}>{status}</option>
      {/each}
    </select>
    {#if showTypeFilter}
    <label class="label text-sm mr-3" for="objectTypeSelect">Object Type: </label>
    <select id="objectTypeSelect" class="select select-sm" bind:value={objectTypeFilter}>
      <option value="">All</option>
      {#each Array.from(objectTypes.values()) as objectType}
        <option value={objectType}>{objectType}</option>
      {/each}
    </select>
    {/if}
  </div>
</div>
  
<table class="table w-full table-zebra table-pin-rows">
  <thead>
    <tr>
      <th>Title</th>
      <th>Status</th>
      {#if showTypeColumn}
      <th>Type</th>
      {/if}
      <th>Created by</th>
      <th>Assigned to</th>
      <th>Created</th>
      <th>Updated</th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    {#each formattedIssues as issue}
      <tr>
        <td>{issue.title}</td>
        <td>{issue.status}</td>
        {#if showTypeColumn}
        <td>{issue.object_type}</td>
        {/if}
        <td>{issue.creator}</td>
        <td>{issue.assignee ? issue.assignee : 'Unassigned'}</td>
        <td>{issue.created_at}</td>
        <td>{issue.updated_at}</td>
        <td>
          <div class="flex justify-end gap-3">
            <a class="btn btn-xs" href="/projects/{issue.project}/issues/{issue.id}">Details</a>
          </div>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
