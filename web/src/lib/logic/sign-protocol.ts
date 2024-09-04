import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
  type Attestation
} from '@ethsign/sp-sdk';
import {decodeAbiParameters, parseAbiParameters} from 'viem';
import type {ChainString} from './onchain-data';
import type {CoinData} from './types';

const schemaId = '0x1a5';
const fullSchemaId = 'onchain_evm_84532_0x1a5';

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia
});

const index = new IndexService('testnet');

export async function attest(coinAddress: string, data: CoinData) {
  const attestationData = {
    coin: coinAddress,
    description: data.description,
    icon: data.icon,
    website: data.website,
    socials: JSON.stringify(data.socials)
  };

  await client.createAttestation({
    schemaId,
    indexingValue: coinAddress,
    data: attestationData
  });
}

export async function lookupData(
  chain: ChainString,
  coinAddress: string
): Promise<CoinData | null> {
  // TODO: use ChainString for sign protocol
  const result = await index.queryAttestationList({
    schemaId: fullSchemaId,
    indexingValue: coinAddress,
    page: 1
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
    socials: JSON.parse(decoded[4])
  };
}
