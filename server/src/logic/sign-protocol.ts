import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
  type Attestation,
} from '@ethsign/sp-sdk';
import { decodeAbiParameters, parseAbiParameters, WalletClient } from 'viem';
import type { CoinData } from './types';
import { signCache } from './cache';
import { ChainSetting } from '../constants';

const schemaId = '0x1a5';
const fullSchemaId = 'onchain_evm_84532_0x1a5';

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia,
  walletClient: true as unknown as WalletClient, // If we let the constructor create it, it will try to access window.ethereum
});

const index = new IndexService('testnet');

async function lookup(coinAddress: string): Promise<CoinData | null> {
  // TODO: different chains?
  const result = await index.queryAttestationList({
    schemaId: fullSchemaId,
    indexingValue: coinAddress,
    page: 1,
  });
  const rows = result?.rows;
  if (!rows || rows.length === 0) return null;
  // console.log(rows);
  // console.log(rows[rows.length-1]);
  const decoded = decodeAbiParameters(
    parseAbiParameters('string,string,string,string,string'),
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
