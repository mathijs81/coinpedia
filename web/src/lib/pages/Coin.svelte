<script lang="ts">
  import {page} from '$app/stores';
  import {getOnchain} from '$lib/logic/onchain-data';
  import {attest, lookupData} from '$lib/logic/sign-protocol';
  let address = $page.params.address;
  const onChainData = getOnchain(address);
  const currentData = lookupData(address);

  let description = '';
  let website = '';
  let iconUrl = '';

  const handleSubmit = async () => {
    attest(address, {
      description,
      website,
      icon: iconUrl,
      socials: []
    });
  };
</script>

<div>
  Hello coin {address}

  {#await onChainData}
    <p>loading...</p>
  {:then data}
    <h3>{data.name} <code>({data.symbol})</code></h3>
    {#if data.isOwnable}
      <p>This coin is owned by {data.owner}.</p>
    {:else}
      <p>This coin is not ownable.</p>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="needs-validation" novalidate>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea 
                id="description" 
                bind:value={description} 
                class="form-control" 
                placeholder="Enter a description of the token" 
                required
            ></textarea>
            <div class="invalid-feedback">
                Please provide a description.
            </div>
        </div>
    
        <div class="mb-3">
            <label for="website" class="form-label">Website URL</label>
            <input 
                type="url" 
                id="website" 
                bind:value={website} 
                class="form-control" 
                placeholder="Enter the official website URL" 
                required
            />
            <div class="invalid-feedback">
                Please provide a valid website URL.
            </div>
        </div>
    
        <div class="mb-3">
            <label for="iconUrl" class="form-label">Icon URL</label>
            <input 
                type="url" 
                id="iconUrl" 
                bind:value={iconUrl} 
                class="form-control" 
                placeholder="Enter the URL for the token icon" 
                required
            />
            <div class="invalid-feedback">
                Please provide a valid URL for the icon.
            </div>
        </div>
    
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>    
  {:catch error}
    <p>{error.message}</p>
  {/await}
</div>
