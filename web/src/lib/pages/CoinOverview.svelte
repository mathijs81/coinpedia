<script lang="ts">
  import {goto, onNavigate} from '$app/navigation';
  import {fetchCoinOverview, getCoinOverview} from '$lib/logic/coin-overview-data';

  export let chain: 'base' | 'base-sepolia' = 'base-sepolia';

  // We get whatever is in the cache, and update it if needed
  // if we don't initialize it directly here, then the component will not be ready to be able
  // to scroll back to where you were if you e.g. press back in the browser
  let coins = getCoinOverview(chain);
  $: fetchCoinOverview(chain).then(data => (coins = data));
  $: chainName = chain === 'base' ? 'Base' : 'Base Sepolia';

  onNavigate;
</script>

<div>
  <h3>Top coins on {chainName}</h3>
  <table class="table table-striped table-hover">
    <thead>
      <tr>
        <th></th>
        <th>Symbol</th>
        <th>Name</th>
        <th>Description</th>
        <th class="transact-col">Transfers <small>(last 24h)</small></th>
      </tr>
    </thead>
    <tbody>
      {#each coins as coin}
        <tr on:click={() => goto(`/coin/${chain}/${coin.address}`)}>
          <td class="icon-col"
            ><img src={coin.icon} alt="icon for {coin.symbol}" class="coin-icon" /></td>
          <td class="symbol-col"
            ><a href="/coin/{chain}/{coin.address}"><code>{coin.symbol}</code></a>
          </td><td><a href="/coin/{chain}/{coin.address}">{coin.name}</a></td>
          <td>{coin.description}</td>
          <td class="transact-col">{coin.transactionCount}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .symbol-col {
    max-width: 4ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .coin-icon {
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
  }
  .icon-col {
    width: 3rem;
    text-align: center;
  }
  .transact-col {
    text-align: right;
    max-width: 10ch;
  }
</style>
