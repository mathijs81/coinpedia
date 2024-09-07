import { EvmChains, IndexService, SignProtocolClient, SpMode } from '@ethsign/sp-sdk';
import { decodeAbiParameters, parseAbiParameters, WalletClient } from 'viem';
import { chains, ChainSetting, fullSchemaId } from '../constants';
import { signCache } from './cache';
import type { CoinData } from './types';

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  walletClient: true as unknown as WalletClient, // If we let the constructor create it, it will try to access window.ethereum
});

const index = new IndexService('testnet');

export async function lookupAttestation(id: string) {
  return await client.getAttestation(id);
}

async function lookup(coinAddress: string): Promise<CoinData | null> {
  // TODO: different chains?
  const result = await index.queryAttestationList({
    schemaId: fullSchemaId,
    indexingValue: coinAddress.toLowerCase(),
    page: 1,
  });
  const rows = result?.rows;
  if (!rows || rows.length === 0) return null;
  // console.log(rows);
  // console.log(rows[rows.length-1]);
  const decoded = decodeAbiParameters(
    parseAbiParameters('address,string,string,string,string'),
    rows[0].data as `0x${string}`
  );
  return {
    description: decoded[1],
    icon: decoded[2],
    website: decoded[3],
    socials: JSON.parse(decoded[4]),
  };
}

export async function getAttestedData(
  chainSetting: ChainSetting,
  coinAddress: string
): Promise<CoinData | null> {
  const cacheKey = chainSetting.prefix + coinAddress.toLowerCase();
  let value = await signCache.get<CoinData>(cacheKey);
  if (!value) {
    value = (await lookup(coinAddress)) ?? ({} as CoinData);
    signCache.set(cacheKey, value);
  }
  if (value.description === undefined && value.icon === undefined) {
    // This was a cached null
    return null;
  }
  return value;
}

export async function clearCache(coinAddress: string) {
  signCache.delete(chains['base-sepolia'].prefix + coinAddress.toLowerCase());
  signCache.delete(chains['base'].prefix + coinAddress.toLowerCase());
}
