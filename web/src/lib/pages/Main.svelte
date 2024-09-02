<script lang="ts">
  import UnknownCoin from '../../assets/unknown-coin.svg';
  import {goto} from '$app/navigation';
  const coins = (async () => {
    const response = await fetch('https://coins.vogelcode.com/api/v1/coin/base-sepolia');
    const coins = await response.json();
    return coins.map(coin => ({
      ...coin,
      icon: coin.icon ?? UnknownCoin,
      description: coin.description ?? 'No description (yet)'
    }));
  })();
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css?family=Rubik|Lilita+One" rel="stylesheet" />
</svelte:head>

<div>
  <!-- <Body />
        <Graphics /> -->
  <h2>Welcome to Coinpedia</h2>

  <h3>Top coins on Base Sepolia</h3>
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
          <tr on:click={() => goto(`/coin/${coin.address}`)}>
            <td class="icon-col"
              ><img src={UnknownCoin} alt="icon for {coin.symbol}" class="coin-icon" /></td>
            <td class="symbol-col"
              ><a href="/coin/{coin.address}"><code>{coin.symbol}</code></a>
            </td><td><a href="/coin/{coin.address}">{coin.name}</a></td>
            <td>{coin.description}</td>
            <td class="transact-col">{coin.transactionCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>
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
