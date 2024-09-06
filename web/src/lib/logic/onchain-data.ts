import {get} from 'svelte/store';
import {publicClient} from '../auth/store';
import {
  createPublicClient,
  erc20Abi,
  getAddress,
  getContract,
  http,
  parseAbi
} from 'viem';
import {baseSepolia} from 'viem/chains';
import {hookAddress, userAttesterContract} from './constants';

interface OnChainData {
  symbol: string;
  name: string;
  isOwnable: boolean;
  owner: string | null;
}

const ownableAbi = parseAbi(['function owner() view returns (address)']);

export async function getOnchain(
  chain: ChainString,
  address: `0x${string}`
): Promise<OnChainData> {
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

export type ChainString = 'base' | 'base-sepolia';

export function toChainString(chain: string | null): ChainString {
  if (chain === 'base') return 'base';
  return 'base-sepolia';
}

const sepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const partialHookAbi = [
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'attester',
        type: 'address'
      }
    ],
    name: 'whitelist',
    outputs: [
      {
        internalType: 'bool',
        name: 'allowed',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

const owner = sepoliaClient.readContract({
  address: hookAddress,
  abi: partialHookAbi,
  functionName: 'owner'
}) as Promise<string>;

export async function isWhitelisted(address: string): Promise<boolean> {
  return (
    addressEquals(await owner, address) ||
    ((await sepoliaClient.readContract({
      address: hookAddress,
      abi: partialHookAbi,
      functionName: 'whitelist',
      args: [getAddress(address)]
    })) as boolean)
  );
}

export function addressEquals(
  a: string | undefined,
  b: string | undefined
): boolean {
  return (
    a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase()
  );
}
