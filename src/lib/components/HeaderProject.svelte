<script lang="ts">
  export let projectid: string;
</script>

<header class="navbar bg-base-300">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" href="/">SiteVisor</a>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/projects">Projects</a></li>
        <li><a href="/projects/{projectid}/viewer">Digital Twin</a></li>
        <li><a href="/projects/{projectid}/rooms">Rooms</a></li>
        <li><a href="/projects/{projectid}/sensors">Sensors</a></li>
        <li><a href="/projects/{projectid}/issues">Issues</a></li>
        <li><a href="/logout">Logout</a></li>
      </ul>
    </div>
</header>