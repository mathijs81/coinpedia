<script lang="ts">
  import '../index.scss';
  import Footer from '../lib/sections/Footer.svelte';
  import Header from '../lib/sections/Header.svelte';

  import AuthProvider from '$lib/auth/AuthProvider.svelte';
</script>

<AuthProvider>
  <main class="d-flex flex-column" style="min-height: 100vh">
    <Header />
    <div class="flex-grow-1 container my-3">
      <slot />
    </div>
    <Footer />
  </main>
</AuthProvider>
