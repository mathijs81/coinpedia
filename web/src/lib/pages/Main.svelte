<script>
    import Header from '../sections/Header.svelte';
    import Footer from '../sections/Footer.svelte';
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

        Here you can register your coins.
        <button>Connect your wallet</button>
    </div>
    <Footer />
</main>
