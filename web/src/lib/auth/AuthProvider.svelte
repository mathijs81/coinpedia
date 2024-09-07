<script lang="ts">
  // from https://github.com/chiuzon/sveltekit-evm-bootstrap/blob/main/src/lib/stores/auth/AuthProvider.svelte
  import Onboard, {
    type ConnectOptions,
    type DisconnectOptions,
    type WalletState
  } from '@web3-onboard/core';
  import injectedWallet from '@web3-onboard/injected-wallets';
  import {onMount, setContext} from 'svelte';
  import {createWalletClient, custom} from 'viem';
  import {chainsMetadata} from './constants';
  import {CONTEXT_KEY} from './methods';
  import {walletClient} from './store';
  import {Chains} from './types';

  const chains = Object.keys(chainsMetadata).map(key => {
    const chain = chainsMetadata[key as Chains];
    const extra: Record<string, string> = {};
    if (chain.blockExplorers?.default?.url) {
      extra['blockExplorerUrl'] = chain.blockExplorers.default.url;
    }
    return {
      id: key,
      label: chain.name,
      rpcUrl: chain.rpcUrls.default.http[0],
      token: 'ETH',
      ...extra
    };
  });

  const onboard = Onboard({
    chains: chains,
    wallets: [injectedWallet()],
    connect: {
      autoConnectLastWallet: true
    }
  });

  async function OnWalletsStateChange(walletState: WalletState[]) {
    /**Check if the wallet is connected*/
    if (!walletState || walletState.length === 0) {
      if ($walletClient) {
        $walletClient = undefined;
      }
      return;
    }

    /*
    if (
      Object.keys(chainsMetadata).findIndex(key => {
        return key.toLowerCase() === walletState[0].chains[0].id.toLowerCase();
      }) === -1 ||
      // Delete this part if you don't want to check if the current wallet chain is the one from the store
      walletState[0].chains[0].id.toLowerCase() !== $activeChain.toLowerCase()
    ) {
      //await switchChain(Chains.ETH);
      await switchChain($activeChain);
    } else {
      $activeChain = walletState[0].chains[0].id as Chains;
    }
    */
    // Currently we run everything on base sepolia, even for the base coins
    if (walletState[0].chains[0].id.toLowerCase() != Chains.BASE_SEPOLIA.toLowerCase()) {
      await switchChain(Chains.BASE_SEPOLIA);
    }
    $walletClient = createWalletClient({
      /*chainsMetadata[$activeChain], */ chain: chainsMetadata[Chains.BASE_SEPOLIA],
      transport: custom(walletState[0].provider)
    });
  }

  onMount(() => {
    const {unsubscribe} = onboard.state.select('wallets').subscribe(OnWalletsStateChange);

    return () => {
      unsubscribe();
    };
  });

  async function connect(options?: ConnectOptions) {
    await onboard.connectWallet(options);
  }

  async function disconnect(options: DisconnectOptions) {
    const [primaryWallet] = onboard.state.get().wallets;

    if (primaryWallet) {
      await onboard.disconnectWallet({
        ...options,
        label: primaryWallet.label
      });
      if ($walletClient) $walletClient = undefined;
    }
  }

  async function switchChain(chain: string | Chains) {
    await onboard.setChain({chainId: chain});
  }

  setContext(CONTEXT_KEY, {connect, disconnect, switchChain});
</script>

<slot />
