<script lang="ts">
  import UnknownCoin from '../../assets/unknown-coin.svg';
  import {goto} from '$app/navigation';

  export let chain: 'base' | 'base-sepolia' = 'base-sepolia';

  $: coins = (async () => {
    const response = await fetch('https://coins.vogelcode.com/api/v1/coin/' + chain);
    const coins = await response.json();
    if (!Array.isArray(coins)) {
      throw new Error('Invalid response from server -- ' + JSON.stringify(coins));
    }
    return coins.map(coin => ({
      ...coin,
      icon: coin.icon ?? UnknownCoin,
      description: coin.description ?? 'No description (yet)'
    }));
  })();

  $: chainName = chain === 'base' ? 'Base' : 'Base Sepolia';
</script>

<div>
  <h3>Top coins on {chainName}</h3>
  {#await coins}
    <p>loading...</p>
  {:then coins}
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
              ><img src={UnknownCoin} alt="icon for {coin.symbol}" class="coin-icon" /></td>
            <td class="symbol-col"
              ><a href="/coin/{chain}/{coin.address}"><code>{coin.symbol}</code></a>
            </td><td><a href="/coin/{chain}/{coin.address}">{coin.name}</a></td>
            <td>{coin.description}</td>
            <td class="transact-col">{coin.transactionCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:catch error}
    <p>{error.message}</p>
  {/await}
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
