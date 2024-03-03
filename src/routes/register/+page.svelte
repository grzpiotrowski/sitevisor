<script>
	import HeaderWelcome from "$lib/components/HeaderWelcome.svelte";
    import SignupForm from "./SignupForm.svelte";
</script>

<HeaderWelcome />

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <SignupForm />
        </div>
    </div>
</div>