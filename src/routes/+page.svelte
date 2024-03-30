<script lang="ts">
  import HeaderWelcome from "$lib/components/HeaderWelcome.svelte";
  import viewerImage from "$lib/images/viewer-demo-01.png"
</script>


<HeaderWelcome></HeaderWelcome>
<div class="hero min-h-[calc(100vh-70px)] bg-base-200">
  <div class="hero-content flex-col lg:flex-row-reverse">
    <img src="{viewerImage}" class="max-w-xl rounded-lg shadow-2xl" alt="Sitevisor Viewer"/>
    <div>
      <h1 class="text-5xl font-bold">Welcome to SiteVisor!</h1>
      <p class="py-6">SiteVisor is a Digital Twin based web app for environmental monitoring of buildings, with elements of asset management.</p>
      <a class="btn btn-primary" href="/register">Register now</a>
    </div>
  </div>
</div>