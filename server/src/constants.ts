import { HypersyncClient } from '@envio-dev/hypersync-client';
import { Chain, createPublicClient, http, PublicClient } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export interface ChainSetting {
  chain: Chain;
  client: PublicClient;
  prefix: string;
  hypersyncClient: HypersyncClient;
}

// hypersync URLs: https://docs.envio.dev/docs/HyperSync/hypersync-supported-networks
const baseSepoliaSetting: ChainSetting = {
  chain: baseSepolia,
  client: createPublicClient({
    chain: baseSepolia,
    transport: http(),
  }) as PublicClient,
  prefix: 'base-sep/',
  hypersyncClient: HypersyncClient.new({ url: 'https://base-sepolia.hypersync.xyz' }),
};

const baseSetting: ChainSetting = {
  chain: base,
  client: createPublicClient({
    chain: base,
    transport: http(),
  }) as PublicClient,
  prefix: 'base/',
  hypersyncClient: HypersyncClient.new({ url: 'https://base.hypersync.xyz' }),
};

export const chains = {
  'base-sepolia': baseSepoliaSetting,
  base: baseSetting,
};
