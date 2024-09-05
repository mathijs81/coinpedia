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
  <p>
    Coinpedia is a permissionless, onchain store of information about ERC-20 coins (on Base and Base
    Sepolia at this moment).
  </p>
  <p>
    You can see the top coins below. You can update missing or outdated information. To maintain
    data integrity, the following rules apply:
  </p>
  <ul>
    <li>Owners of coin contracts can always update the data directly</li>
    <li>Data from ape.store can be fetched and updated automatically</li>
    <li>
      If you submit other data, this will go through a vetting process. You can make this process
      more seamless by staking some of the ERC-20 coins you're submitting data about.
    </li>
  </ul>

  <ul class="nav nav-tabs">
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={currentChain == 'base'}
        on:click={() => (currentChain = 'base')}
        href="#">Base</a>
    </li>
    <li class="nav-item">
      <a
        class="nav-link"
        class:active={currentChain == 'base-sepolia'}
        on:click={() => (currentChain = 'base-sepolia')}
        href="#">Base Sepolia</a>
    </li>
  </ul>
  <CoinOverview chain={currentChain} />
</div>

<style>
</style>
