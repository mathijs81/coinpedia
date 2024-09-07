<script lang="ts">
  import {goto} from '$app/navigation';
  import {fetchCoinOverview, getCoinOverview} from '$lib/logic/server-data';
  import UnknownIcon from '../../assets/unknown-coin.svg';

  export let chain: 'base' | 'base-sepolia' = 'base-sepolia';

  let errorMessage: string | null = null;

  // We get whatever is in the cache, and update it if needed
  // if we don't initialize it directly here, then the component will not be ready to be able
  // to scroll back to where you were if you e.g. press back in the browser
  $: chainName = chain === 'base' ? 'Base' : 'Base Sepolia';
  $: coins = getCoinOverview(chain);
  $: fetchCoinOverview(chain)
    .then(data => (coins = data))
    .catch(e => (errorMessage = e.message));

  enum DataUsed {
    CHAIN_ONLY,
    COINPEDIA,
    UNCONFIRMED
  }
  let dataUsed: DataUsed = DataUsed.COINPEDIA;

  $: getIcon = (coin: any) => {
    return (
      (dataUsed !== DataUsed.CHAIN_ONLY ? coin.icon : null) ||
      (dataUsed === DataUsed.UNCONFIRMED ? coin.apestore?.icon : null) ||
      UnknownIcon
    );
  };

  $: getDescription = (coin: any) => {
    return (
      (dataUsed !== DataUsed.CHAIN_ONLY ? coin.description : null) ||
      (dataUsed === DataUsed.UNCONFIRMED ? coin.apestore?.description : null) ||
      ``
    );
  };
</script>

<div class="card">
  <h3 class="p-2">Top coins on {chainName}</h3>
  <div class="sticky-top bg-light px-3">
    Show
    <div class="d-flex flex-row">
      <div class="col d-flex flex-row">
        <input
          type="radio"
          id="chain-only"
          bind:group={dataUsed}
          value={DataUsed.CHAIN_ONLY}
          class="form-check-input me-2" /><label for="chain-only">Only ERC-20 data</label>
      </div>
      <div class="col d-flex flex-row">
        <input
          type="radio"
          id="coinpedia-data"
          bind:group={dataUsed}
          value={DataUsed.COINPEDIA}
          class="form-check-input me-2" /><label for="coinpedia-data"
          >ERC-20 & attested Coinpedia data</label>
      </div>
      {#if chain == 'base'}
        <div class="col  d-flex flex-row">
          <input
            type="radio"
            id="unconfirmed-data"
            bind:group={dataUsed}
            value={DataUsed.UNCONFIRMED}
            class="form-check-input me-2" /><label for="unconfirmed-data"
            >ERC-20, Coinpedia & unconfirmed data</label>
        </div>
      {/if}
    </div>
  </div>
  {#if coins.length === 0 && !errorMessage}
    <div class="loader-container">
      <div class="loader"></div>
    </div>
  {:else if errorMessage}
    <p class="alert alert-danger">{errorMessage}</p>
  {:else}
    <table class="table table-striped table-hover p-0 m-0">
      <thead>
        <tr>
          <th class="icon-col"></th>
          <th class="symbol-col">Symbol</th>
          <th class="name-col">Name</th>
          <th class="desc-col">Description</th>
          <th class="transact-col">Transfers <small>(last 24h)</small></th>
        </tr>
      </thead>
      <tbody>
        {#each coins as coin}
          <tr on:click={() => goto(`/coin/${chain}/${coin.address}`)}>
            <td class="icon-col"
              ><img src={getIcon(coin)} alt="icon for {coin.symbol}" class="coin-icon" /></td>
            <td class="symbol-col"
              ><a href="/coin/{chain}/{coin.address}"><code>{coin.symbol}</code></a>
            </td><td class="name-col"><a href="/coin/{chain}/{coin.address}">{coin.name}</a></td>
            <td>{getDescription(coin)}</td>
            <td class="transact-col">{coin.transactionCount}</td>
          </tr>
        {/each}
      </tbody>
    </table>{/if}</div>

<style>
  table {
    table-layout: fixed;
  }
  .symbol-col {
    width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .name-col {
    width: 20ch;
    overflow: hidden;
    text-overflow: ellipsis;
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
    width: 10ch;
  }
  .card {
    overflow-x: auto;
  }
  .card > * {
    min-width: 600px;
  }
</style>
