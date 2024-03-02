<script lang="ts">
	import { goto } from "$app/navigation";
	import { SitevisorService } from "../../services/sitevisor-service";

	let username = "";
	let password = "";
	let errorMessage = "";

	async function signup() {
		let success = await SitevisorService.register(username, password);
		if (success) {
			goto("/");
		} else {
			errorMessage = "Error trying to register";
		}
	}
</script>

<form on:submit|preventDefault={signup}>
	<div class="flex flex-col mb-4">
		<label for="username" class="text-sm font-bold mb-2">Username</label>
		<input bind:value={username} id="username" class="form-input rounded-md shadow-sm" type="text" placeholder="Enter Username" name="username" />
	</div>
	<div class="flex flex-col mb-4">
		<label for="password" class="text-sm font-bold mb-2">Password</label>
		<input bind:value={password} id="password" class="form-input rounded-md shadow-sm" type="password" placeholder="Enter Password" name="password" />
	</div>
	<div class="flex justify-center">
		<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Sign Up</button>
	</div>
</form>
{#if errorMessage}
	<div class="section">
		{errorMessage}
	</div>
{/if}
