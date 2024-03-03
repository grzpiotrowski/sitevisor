<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from "$app/navigation";
    import { SitevisorService } from "../../services/sitevisor-service";

    onMount(async () => {
        await SitevisorService.logout();
        goto('/login');
    });
</script>
