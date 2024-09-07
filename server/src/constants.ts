import { HypersyncClient } from '@envio-dev/hypersync-client';
import { Chain, createPublicClient, http, PublicClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export interface ChainSetting {
  chain: Chain;
  client: PublicClient;
  prefix: string;
  hypersyncClient: HypersyncClient;
  hasApeStore: boolean;
}

// hypersync URLs: https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks
const baseSepoliaSetting: ChainSetting = {
  chain: baseSepolia,
  client: createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC_URL),
  }) as PublicClient,
  prefix: 'base-sep/',
  hypersyncClient: HypersyncClient.new({ url: 'https://base-sepolia.hypersync.xyz' }),
  hasApeStore: false,
};

const baseSetting: ChainSetting = {
  chain: base,
  client: createPublicClient({
    chain: base,
    transport: http(),
  }) as PublicClient,
  prefix: 'base/',
  hypersyncClient: HypersyncClient.new({ url: 'https://base.hypersync.xyz' }),
  hasApeStore: true,
};

export const chains = {
  'base-sepolia': baseSepoliaSetting,
  base: baseSetting,
};

// see https://docs.sign.global/for-builders/index-1/index/address-book
export const signProtocolAddress = '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD';
export const schemaId = 554; // 0x22a
export const schemaIdHex = '0x22a';
export const fullSchemaId = 'onchain_evm_84532_' + schemaIdHex;
