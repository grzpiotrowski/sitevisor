<script lang="ts">
	import HeaderWelcome from "$lib/components/HeaderWelcome.svelte";
    import LoginForm from "./LoginForm.svelte";
</script>

<HeaderWelcome />

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <LoginForm />
        </div>
    </div>
</div>