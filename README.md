# Coinpedia

Coinpedia is a permissionless, onchain store for ERC-20 token metadata, allowing updates to logos, descriptions, and links by coin owners, offchain APIs or other users.

Coinpedia was developed for the EthOnline 2024 hackathon ([project page](https://ethglobal.com/showcase/coinpedia-iyqm8)).

[Live demo](https://coinpedia.vercel.app)

## Why

In terms of information to understand what a coin is, the ERC-20 spec only exposes values for `name` & `symbol`.
Usually, a site that wants to show information about a coin wants to at least also show a logo, a short description and links to the coin's official website, social channels etc. This information is currently hard to get. Very popular, older coins are included in official coin lists, but new 'hot' coins are not. Private APIs like CoinGecko usually cost money. Sites like dexscreener even charge up to $300 for coin owners to modify the metadata on their site.

Coinpedia aims to create a permissionless, onchain store for this information.
The current implementation works as follows:
* Owners of coin contracts can always update the data directly
* Coins that are launched through ape.store can be scheduled for an automatic update using a Lit Action that then attests the data using a whitelisted address
* If you're not the owner of a coin, you can still update the metadata. Ideally some community vetting process would allow submissions to be reviewed by others before being accepted. In the current implementation, there is just a 0.01 ETH payment required to prevent spam.

## Technologies used

* Sign protocol collects the attestations of coin metadata
* Lit protocol automates importing coin metadata from trusted external APIs (with ape.store implemented as an example)
* Envio HyperSync collects the top transferred coins to show for Base & Base Sepolia
* SvelteKit serves the frontend (source code in the `web/` directory)
    * web3-onboard for connecting the wallet
    * viem for interacting with the blockchain
    * sign node SDK for looking up / creating attestations
* A node fastify server serves the backend that serves and caches the coin data (source code in the `server/` directory)
    * sign node SDK for looking up attestations
    * lit node SDK for executing a Lit Action that fetches coin data from ape.store and then creates & executes a signed transaction to attest this data
    * envio node SDK for fetching the top transferred coins
* solidity smart contracts (source code in the `contracts/` directory)
    * `Hook.sol`: a Sign protocol hook that checks that a user is the owner of an ERC-20 token, or is a whitelisted address
    * `UserAttester.sol`: a facade in front of the Sign protocol `ISP` that charges 0.01 ETH and could be replaced by something more sophisticated in the future for vetting user submissions

## Demo limitations

The current implementation runs fully on Base Sepolia (even for the metadata of Base coins).
At this moment there's also no community vetting process, so the 0.01 ETH payment is the only thing that prevents spam.
To fetch the latest attested data, you need to use the Sign protocol indexer.