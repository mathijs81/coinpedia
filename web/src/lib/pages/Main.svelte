<script lang="ts">
  import {activeChain} from '$lib/auth/store';
  import {Chains} from '$lib/auth/types';
  import type {ChainString} from '$lib/logic/onchain-data';
  import {get} from 'svelte/store';
  import CoinOverview from './CoinOverview.svelte';

  let currentChain: ChainString = get(activeChain) === Chains.BASE ? 'base' : 'base-sepolia';
</script>

<div>
  <h2>Welcome to Coinpedia</h2>
  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={currentChain == 'base-sepolia'}
        on:click={() => (currentChain = 'base-sepolia')}
        href="#">Base Sepolia</a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={currentChain == 'base'}
        on:click={() => (currentChain = 'base')}
        href="#">Base</a>
    </li>
  </ul>
  <CoinOverview chain={currentChain} />
</div>

<style>
</style>
