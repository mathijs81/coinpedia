import {get} from 'svelte/store';
import {publicClient} from '../auth/store';
import {erc20Abi, getContract, parseAbi} from 'viem';

interface OnChainData {
  symbol: string;
  name: string;
  isOwnable: boolean;
  owner: string | null;
}

const ownableAbi = parseAbi(['function owner() view returns (address)']);

export async function getOnchain(address: `0x${string}`): Promise<OnChainData> {
  const client = get(publicClient);
  const contract = getContract({
    address,
    abi: erc20Abi,
    client
  });

  const symbol = contract.read.symbol();
  const name = contract.read.name();

  let owner = null;
  try {
    owner = await client.readContract({
      address,
      abi: ownableAbi,
      functionName: 'owner'
    });
  } catch (error) {
    console.log(`$address not ownable?`, error);
  }

  return {
    symbol: await symbol,
    name: await name,
    isOwnable: owner !== null,
    owner
  };
}
