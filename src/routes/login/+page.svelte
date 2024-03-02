<script lang="ts">
	import LoginForm from "./LoginForm.svelte";
</script>

<div class="flex flex-wrap justify-center lg:justify-between items-center p-4">
	<div class="flex justify-center w-full lg:w-auto mb-4 lg:mb-0">
	</div>
	<div class="w-full lg:w-1/2 xl:w-1/3">
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Login</h2>
				<LoginForm />
			</div>
		</div>
	</div>
</div>
