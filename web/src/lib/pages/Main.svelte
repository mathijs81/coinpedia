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
    <li>Coins that are launched through ape.store can be triggered for an automatic update</li>
    <li>
      If you're not the owner of a coin, you can still update the metadata. To prevent spam, you
      have to pay 0.01 ETH for an update.<br />
      Future iterations may apply a vetting process, where user submissions may be reviewed by others
      before being accepted and the fee may be waived if you temporarily stake some Coinpedia governance
      tokens or the ERC-20 token of the coin you're updating.
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
