<script lang="ts">
  import Logo from '../../assets/logo.svg';

  import {chainsMetadata} from '$lib/auth/constants';
  import {useAuth} from '$lib/auth/methods';
  import {accountENS, walletAccount, activeChain} from '$lib/auth/store';
  import {Chains} from '$lib/auth/types';

  const {connect, disconnect, switchChain} = useAuth();
</script>

<div class="top-header py-1">
  <div class="container-md">
    <div class="row align-items-center">
      <div class="col d-flex align-items-center">
        <a href="/">
          <img src={Logo} alt="Coinpedia" class="logo-img" />
        </a>

        <div>
          <a href="/" class="link-unstyled">
            <h1 class="fs-3 m-0 p-0">Coinpedia</h1>
            <small class="d-block" style="margin-top: -5px"
              >Collecting ERC-20 metadata for everyone</small>
          </a>
        </div>
      </div>
      <div class="col">
        {#if $walletAccount}{$walletAccount}<button
            class="btn btn-primary ms-2"
            on:click={() => disconnect()}>Disconnect</button>
        {:else}
          <button class="btn btn-primary" on:click={() => connect()}>Connect wallet</button>
        {/if}
      </div>
      <!-- <div class="col col-auto">
                <div v-if="error" class="text-danger error">error: {{error}}</div>
                <div v-else-if="isConnected">{{address}}</div>
            </div>
            <div class="col col-auto">
                <button class="btn btn-primary" v-if="!isConnected">Connect</button>
            </div> -->
    </div>
  </div>
</div>

<style lang="scss">
  .logo-img {
    width: 3rem;
    height: 3rem;
    margin-right: 0.5rem;
  }
</style>
