<script lang="ts">
  import type { IIssue } from "../../services/sitevisor-types";
  import { formatDate } from "$lib/utils/helpers";
  import { get } from 'svelte/store';
	import { objectTypesStore, statusOptionsStore } from "../../stores";

  export let issues: IIssue[];

  const statusOptions = get(statusOptionsStore);
  const objectTypes = get(objectTypesStore);

  $: formattedIssues = issues.map(issue => ({
    ...issue,
    status: statusOptions.get(issue.status),
    object_type: objectTypes.get(issue.object_type),
    created_at: formatDate(issue.created_at),
    updated_at: formatDate(issue.updated_at)
  }));
</script>
  
<table class="table w-full table-zebra table-pin-rows">
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
    {#each formattedIssues as issue}
      <tr>
        <td>{issue.title}</td>
        <td>{issue.status}</td>
        <td>{issue.object_type}</td>
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
