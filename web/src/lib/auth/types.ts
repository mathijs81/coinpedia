import type {ChainString} from '$lib/logic/onchain-data';
import type {Chain} from 'viem/chains';

/**
 * Add here your chain id as hex, be sure to add your chain in the chainsMetadata object too
 */
export enum Chains {
  ETH = '0x1',
  OP = '0xa',
  // 84532
  BASE_SEPOLIA = '0x14a34',
  BASE = '0x2105' //8453
}

export function fromString(chain: ChainString): Chains {
  switch (chain) {
    case 'base':
      return Chains.BASE;
    case 'base-sepolia':
      return Chains.BASE_SEPOLIA;
  }
}

export type ChainsMetadata = Record<Chains, Chain>;
