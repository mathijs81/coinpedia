<script lang="ts">
  import Logo from '../../assets/logo.svg';

  import {useAuth} from '$lib/auth/methods';
  import {walletAccount, whitelisted} from '$lib/auth/store';
  import {formatAddress} from '$lib/util/formatting';

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
            <small class="d-block" style="margin-top: -5px">Onchain coin metadata</small>
          </a>
        </div>
      </div>
      <div class="col text-end">
        {#if $walletAccount}{formatAddress($walletAccount)}{#if $whitelisted}<i
              class="bi bi-unlock-fill fs-4 text-success p-2"></i
            >{/if}<button class="btn btn-primary ms-2" on:click={() => disconnect()}
            >Disconnect</button>
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
