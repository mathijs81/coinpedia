<script lang="ts">
  import {page} from '$app/stores';
  import {activeChain} from '$lib/auth/store';
  import {fromString} from '$lib/auth/types';
  import {getOnchain, toChainString} from '$lib/logic/onchain-data';
  import {attest, lookupData} from '$lib/logic/sign-protocol';
  import type {CoinData} from '$lib/logic/types';
  let chain = toChainString($page.params.chain);
  activeChain.set(fromString(chain));
  let address = $page.params.address as `0x${string}`;
  const onChainData = getOnchain(chain, address);
  const currentData = lookupData(chain, address);

  let description = '';
  let website = '';
  let iconUrl = '';
  let errorMessage = '';

  currentData.then(data => {
    if (data) {
      description = data.description;
      website = data.website;
      iconUrl = data.icon;
    }
  });

  const handleSubmit = async () => {
    errorMessage = '';
    try {
      await attest(address, {
        description,
        website,
        icon: iconUrl,
        socials: []
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e);
        errorMessage = e.message;
        if (errorMessage.includes(`Unable to decode signature "0x87aee992"`)) {
          errorMessage = 'There was an error submitting. Are you the coin owner?';
        }
      } else {
        console.log(e);
        errorMessage = 'There was an error submitting. Are you the coin owner?';
      }
    }
  };
</script>

<div>
  {#await onChainData}
    <p>loading...</p>
  {:then data}
    <h3>{data.name} <code>({data.symbol})</code></h3>
    {#if data.isOwnable && data.owner !== '0x0000000000000000000000000000000000000000'}
      <p>This coin is owned by {data.owner}.</p>
    {:else}
      <p>This coin has no owner.</p>
    {/if}
    {#await currentData then current}
      {#if current}
        <h4>Current data</h4>
        <b>Description</b>
        <p>{current.description}</p>
        <b>Website</b>
        <p><a href={current.website} target="_blank">{current.website}</a></p>
        <b>Icon</b>
        <p><img src={current.icon} alt="icon" /><br /><small>{current.icon}</small></p>
      {/if}
    {/await}

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
        <input
          type="url"
          id="website"
          bind:value={website}
          class="form-control"
          placeholder="Enter the official website URL"
          required />
        <div class="invalid-feedback">Please provide a valid website URL.</div>
      </div>

      <div class="mb-3">
        <label for="iconUrl" class="form-label">Icon URL</label>
        <input
          type="url"
          id="iconUrl"
          bind:value={iconUrl}
          class="form-control"
          placeholder="Enter the URL for the token icon"
          required />
        <div class="invalid-feedback">Please provide a valid URL for the icon.</div>
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
      {#if errorMessage}
        <div class="alert alert-danger mt-3">{errorMessage}</div>
      {/if}
    </form>
  {:catch error}
    <p>{error.message}</p>
  {/await}
</div>
