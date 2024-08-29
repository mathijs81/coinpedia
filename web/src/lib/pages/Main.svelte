<script lang="ts">
    import Header from '../sections/Header.svelte';
    import Footer from '../sections/Footer.svelte';

	import { chainsMetadata } from '$lib/auth/constants';
	import { useAuth } from '$lib/auth/methods';
	import { accountENS, walletAccount, activeChain } from '$lib/auth/store';
	import { Chains } from '$lib/auth/types';

	const { connect, disconnect, switchChain } = useAuth();

	async function switchToETH() {
		$activeChain = Chains.ETH;
		if ($walletAccount) switchChain($activeChain);
	}

	async function switchToOptimism() {
		$activeChain = Chains.OP;
		if ($walletAccount) switchChain($activeChain);
	}
</script>

<svelte:head>
    <link href="https://fonts.googleapis.com/css?family=Rubik|Lilita+One" rel="stylesheet" />
</svelte:head>

<main class="d-flex flex-column" style="min-height: 100vh">
    <Header />
    <div class="flex-grow-1 container my-3">
        <!-- <Body />
            <Graphics /> -->
        <h2>Welcome to OnChain Coin Data</h2>

        {$activeChain}

        Here you can register your coins.
        <button>Connect your wallet</button>
    </div>
    <Footer />
</main>
