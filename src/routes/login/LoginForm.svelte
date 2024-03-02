<script>
	import { goto } from "$app/navigation";
	import { SitevisorService } from "../../services/sitevisor-service";

	let username = "";
	let password = "";
	let errorMessage = "";

	async function login() {
		let success = await SitevisorService.login(username, password);
		if (success) {
			goto("/");
		} else {
			username = "";
			password = "";
			errorMessage = "Invalid Credentials";
		}
	}
</script>

<form on:submit|preventDefault={login}>
	<div class="field">
		<label class="label" for="username">Username</label>
		<input bind:value={username} class="input" id="username" name="username" placeholder="Enter Username" type="text" />
	</div>
	<div class="field">
		<label class="label" for="password">Password</label>
		<input bind:value={password} class="input" id="password" name="password" placeholder="Enter Password" type="password" />
	</div>
	<div class="field is-grouped">
		<button class="button is-link">Log In</button>
	</div>
</form>
{#if errorMessage}
	<div class="section">
		{errorMessage}
	</div>
{/if}
