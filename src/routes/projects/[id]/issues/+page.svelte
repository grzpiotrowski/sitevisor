<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import type { IProject, IIssue } from '../../../../services/sitevisor-types';
  import HeaderProject from '$lib/components/HeaderProject.svelte';
  export let data: PageData;

  let project: IProject = data.project;
  let issues: IIssue[] = data.issues;;

</script>

<HeaderProject projectid={project.id.toString()}/>

<div class="container mx-auto p-5">
  <table class="table w-full table-zebra">
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Created date</th>
        <th>Created by</th>
      </tr>
    </thead>
    <tbody>
      {#each issues as issue}
        <tr>
          <td>{issue.title}</td>
          <td>{issue.status}</td>
          <td>{issue.created_at}</td>
          <td>{issue.creator}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
  