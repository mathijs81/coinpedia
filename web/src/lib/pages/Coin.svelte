<script lang="ts">
  import {page} from '$app/stores';
  import {activeChain, whitelisted} from '$lib/auth/store';
  import {fromString} from '$lib/auth/types';
  import {addressEquals, getOnchain, toChainString} from '$lib/logic/onchain-data';
  import {attest, lookup} from '$lib/logic/sign-protocol';
  import {formatAddress} from '$lib/util/formatting';
  import {walletAccount} from '$lib/auth/store';
  import {useAuth} from '$lib/auth/methods';
  import {getIconName, SocialNetwork, type CoinData} from '$lib/logic/types';
  import {apeStoreImport, fetchCoinData} from '$lib/logic/server-data';
    import { getAddress } from 'viem';

  const {connect} = useAuth();

  let chain = toChainString($page.params.chain);
  activeChain.set(fromString(chain));
  let address = getAddress($page.params.address).toLowerCase() as `0x${string}`;
  const onChainData = getOnchain(chain, address);
  const attestations = lookup(address);

  let apeStoreData: CoinData = {} as CoinData;

  const serverData = fetchCoinData(chain, address).then(coin => {
    if (coin) {
      if (coin.apestore) {
        apeStoreData = coin.apestore;
      }
    }
  });

  $: blockchainAddress = (chain == 'base' ? `https://basescan.org/token/${address}` :
    `https://sepolia.basescan.org/token/${address}`);

  let description = '';
  let website = '';
  let iconUrl = '';
  let errorMessage = '';

  let xUrl = '';
  let discordUrl = '';
  let telegramUrl = '';

  const currentData = attestations.then(attestations => {
    if (attestations.length > 0) {
      const data = attestations[0];
      description = data.description;
      website = data.website;
      iconUrl = data.icon;

      data.socials.forEach(social => {
        if (social.type === SocialNetwork.X) {
          xUrl = social.url;
        } else if (social.type === SocialNetwork.DISCORD) {
          discordUrl = social.url;
        } else if (social.type === SocialNetwork.TELEGRAM) {
          telegramUrl = social.url;
        }
      });
      return data;
    }
    return null;
  });

  const handleSubmit = async () => {
    errorMessage = '';
    try {
      const socialArray = [];
      if (xUrl) {
        socialArray.push({type: SocialNetwork.X, url: xUrl});
      }
      if (discordUrl) {
        socialArray.push({type: SocialNetwork.DISCORD, url: discordUrl});
      }
      if (telegramUrl) {
        socialArray.push({type: SocialNetwork.TELEGRAM, url: telegramUrl});
      }

      const asUser = !submitFree;

      await attest(
        address,
        {
          description,
          website,
          icon: iconUrl,
          socials: socialArray
        },
        asUser
      );
    } catch (e) {
      if (e instanceof Error) {
        errorMessage = e.message;
        if (errorMessage.includes(`Unable to decode signature "0x87aee992"`)) {
          errorMessage = 'There was an error submitting. Are you the coin owner?';
        } else {
          console.error(e);
        }
      } else {
        console.log(e);
        errorMessage = 'There was an error submitting. Are you the coin owner?';
      }
    }
  };

  let importResult = '';
  let loadingImport = false;

  const handleImport = async () => {
    loadingImport = true;
    // The server will trigger a lit action that fetches the data and attests it on sign protocol
    try {
      importResult = JSON.stringify(await apeStoreImport(address), null, 2);
    } catch (e) {
      if (e instanceof Error) {
        importResult = e.message;
      } else {
        importResult = 'ERROR:\n' + JSON.stringify(e, null, 2);
      }
    }
  };
  let isOwner = false;
  $: onChainData.then(data => {
    isOwner = addressEquals($walletAccount, data?.owner ?? '');
  });
  $: submitFree = isOwner || $whitelisted;
  $: submitExplanation = submitFree
    ? isOwner
      ? "You can update data for free because you're the token owner."
      : 'Your address is whitelisted for Coinpedia updates'
    : 'To prevent spam, updating data as non-owner costs 0.01 Ξ.';
</script>

<div>
  {#await onChainData}
    <p>loading...</p>
  {:then data}
    {#if data.isOwnable && data.owner !== '0x0000000000000000000000000000000000000000'}
      <p class="float-end">
        Owned by {formatAddress(data.owner)}{#if isOwner}<span
            class="badge rounded-pill text-bg-success">YOU</span
          >{/if}
      </p>
    {:else}
      <p class="float-end">No owner.</p>
    {/if}
    {#await currentData then current}
      {#if current}
        <h3>
          <img src={current.icon} alt="icon" class="icon me-2" />
          {data.name} <code>({data.symbol})</code>
        </h3>

        <div class="d-flex gap-2 justify-content-center">
          <div>
            <a href={current.website} target="_blank"
              ><i class="bi bi-globe fs-3 p-3" title={current.website}></i></a>
          </div>
          {#if current.socials}
            {#each current.socials as social}
              <div>
                <a href={social.url} target="_blank"
                  ><i class="bi {getIconName(social.type)} fs-3 p-3" title={social.url}></i></a>
              </div>
            {/each}
          {/if}
        </div>
        <b>Description</b>
        <p>{current.description}</p>
        <b>Blockchain address</b>
        <p>{address} <a href={blockchainAddress} target="_blank"><i class="bi bi-box-arrow-up-right"></i></a></p>
      {:else}
        <h3>{data.name} <code>({data.symbol})</code></h3>
        <b>Blockchain address</b>
        <p>{address} <a href={blockchainAddress} target="_blank"><i class="bi bi-box-arrow-up-right"></i></a></p>
        <p>{data.symbol} has no attested metadata yet</p>
      {/if}
    {/await}

    {#if Object.keys(apeStoreData).length > 0}
      <h3>Ape.Store</h3>
      <div>
        This is a coin that's created on ape.store. Coinpedia can import / refresh the metadata from
        their feed.
      </div>
      <b>Preview</b>
      <div>
        <img src={apeStoreData.icon} alt="icon" class="icon me-2" /><br />
        {#if apeStoreData.website}
          <a href={apeStoreData.website}>{apeStoreData.website}</a><br />
        {/if}
        {apeStoreData.description}
      </div>
      {#if importResult}
        <div>Server response:</div>
        <code>{importResult}</code>
      {:else}
        <button class="btn btn-primary" on:click={handleImport}>Import from ape.store</button>
      {/if}
    {/if}

    <h3 class="mt-3">Submit update</h3>
    {#if !$walletAccount}
      <button class="btn btn-primary" on:click={() => connect()}>Connect wallet</button>
    {:else}
      <form on:submit|preventDefault={handleSubmit} class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="description" class="form-label">Description</label>
          <textarea
            id="description"
            bind:value={description}
            class="form-control"
            placeholder="Enter a description of the token"
            required></textarea>
          <div class="invalid-feedback">Please provide a description.</div>
        </div>

        <div class="mb-3">
          <label for="website" class="form-label">Website URL</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-globe"></i></span>
            <input
              type="url"
              id="website"
              bind:value={website}
              class="form-control"
              placeholder="Enter the official website URL"
              required />
          </div>
        </div>

        <div class="mb-3">
          <label for="iconUrl" class="form-label">Icon URL</label>
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-image"></i></span>
            <input
              type="url"
              id="iconUrl"
              bind:value={iconUrl}
              class="form-control"
              placeholder="Enter the URL for the icon of the token (ideally 256x256px or larger)"
              required />
          </div>
        </div>

        <b>Social channels</b>
        <div class="input-group mb-2">
          <span class="input-group-text"><i class="bi bi-twitter-x"></i></span>
          <input
            type="url"
            id="xUrl"
            bind:value={xUrl}
            class="form-control"
            placeholder="X profile URL" />
        </div>
        <div class="input-group mb-2">
          <span class="input-group-text"><i class="bi bi-telegram"></i></span>
          <input
            type="url"
            id="telegramUrl"
            bind:value={telegramUrl}
            class="form-control"
            placeholder="Telegram URL" />
        </div>
        <div class="input-group mb-2">
          <span class="input-group-text"><i class="bi bi-discord"></i></span>
          <input
            type="url"
            id="discordUrl"
            bind:value={discordUrl}
            class="form-control"
            placeholder="Discord URL" />
        </div>

        <p>{submitExplanation}</p>
        <button type="submit" class="btn btn-primary"
          >Submit{#if !submitFree}{' '}(0.01 Ξ){/if}</button>
        {#if errorMessage}
          <div class="alert alert-danger mt-3">{errorMessage}</div>
        {/if}
      </form>
    {/if}
    {#await attestations then history}
      {#if history && history.length > 0}
        <h3 class="mt-4">History</h3>
        {#each history as attest}
          <div>
            {attest.timestamp} -- attested by {attest.address} <a href={`https://testnet-scan.sign.global/attestation/${attest.attestationId}`} target="_blank"><i class="bi bi-box-arrow-up-right"></i></a>
          </div>
        {/each}
      {/if}
    {/await}
  {:catch error}
    <p>{error.message}</p>
  {/await}
</div>

<style lang="scss">
  .icon {
    max-width: 96px;
    max-height: 96px;
  }
</style>
