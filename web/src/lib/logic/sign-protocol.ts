import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
  type Attestation
} from '@ethsign/sp-sdk';
import {decodeAbiParameters, parseAbiParameters} from 'viem';
import type {ChainString} from './onchain-data';
import {parseSocials, type CoinData, type FullCoinData} from './types';

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

export async function lookup(coinAddress: string): Promise<FullCoinData[]> {
  // TODO: different chains?
  const result = await index.queryAttestationList({
    schemaId: fullSchemaId,
    indexingValue: coinAddress,
    page: 1
  });
  const rows = result?.rows;
  if (!rows) return [];

  return rows.map(row => {
    const decoded = decodeAbiParameters(
      parseAbiParameters('string,string,string,string,string'),
      row.data as `0x${string}`
    );
    return {
      timestamp: parseFloat(row.attestTimestamp),
      address: row.attester,
      description: decoded[1],
      icon: decoded[2],
      website: decoded[3],
      socials: parseSocials(JSON.parse(decoded[4]))
    };
  });
}

// console.log(rows);
// console.log(rows[rows.length-1]);
