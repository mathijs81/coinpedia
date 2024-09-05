import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode,
  type Attestation
} from '@ethsign/sp-sdk';
import {decodeAbiParameters, parseAbiParameters, parseEther} from 'viem';
import type {ChainString} from './onchain-data';
import {parseSocials, type CoinData, type FullCoinData} from './types';

const schemaId = '0x1a5';
const fullSchemaId = 'onchain_evm_84532_0x1a5';

// Kind of a giant hack, but it works:
// we deployed a very light copy of the sign protocol ISP that just makes sure
// to collect 0.01 ETH and forward the attestation and then the hook lets it through
// because we whitelisted the UserAttester contract.
const userAttesterContract = '0x3D764af37c638B8f696C5852Db41b167b98c2556';

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia
});

const index = new IndexService('testnet');

let defaultContractAddress = '';

export async function attest(
  coinAddress: string,
  data: CoinData,
  asUser: boolean = false
) {
  if (asUser) {
    if (defaultContractAddress === '') {
      defaultContractAddress = (client.client as any).contractInfo.address;
    }
    (client.client as any).contractInfo.address = userAttesterContract;
  } else {
    (client.client as any).contractInfo.address = defaultContractAddress;
  }
  const attestationData = {
    coin: coinAddress,
    description: data.description,
    icon: data.icon,
    website: data.website,
    socials: JSON.stringify(data.socials)
  };

  if (asUser) {
    const options = {
      resolverFeesETH: parseEther('0.01')
    };
    await client.createAttestation(
      {
        schemaId,
        indexingValue: coinAddress,
        data: attestationData
      },
      options
    );
  } else {
    await client.createAttestation({
      schemaId,
      indexingValue: coinAddress,
      data: attestationData
    });
  }
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
