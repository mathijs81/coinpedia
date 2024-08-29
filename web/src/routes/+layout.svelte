<script lang="ts">
	import '../index.scss';

	import AuthProvider from '$lib/auth/AuthProvider.svelte';
</script>

<AuthProvider>
	<slot />
</AuthProvider>