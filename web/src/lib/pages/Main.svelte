<script lang="ts">
  import type {ChainString} from '$lib/logic/onchain-data';
  import CoinOverview from './CoinOverview.svelte';

  let activeChain: ChainString = 'base-sepolia';
</script>

<div>
  <h2>Welcome to Coinpedia</h2>
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={activeChain == 'base-sepolia'}
        on:click={() => (activeChain = 'base-sepolia')}
        href="#">Base Sepolia</a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={activeChain == 'base'}
        on:click={() => (activeChain = 'base')}
        href="#">Base</a>
    </li>
  </ul>
  <CoinOverview chain={activeChain} />
</div>

<style>
</style>
