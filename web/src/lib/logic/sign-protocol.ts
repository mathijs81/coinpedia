import {
  EvmChains,
  IndexService,
  SignProtocolClient,
  SpMode
} from '@ethsign/sp-sdk';
import {decodeAbiParameters, getAddress, parseAbiParameters, parseEther} from 'viem';
import {parseSocials, type CoinData, type FullCoinData} from './types';
import {fullSchemaId, schemaId, userAttesterContract} from './constants';

const client = new SignProtocolClient(SpMode.OnChain, {
  chain: EvmChains.baseSepolia
});

const index = new IndexService('testnet');

let defaultContractAddress = '';

export async function attest(
  _coinAddress: string,
  data: CoinData,
  asUser: boolean = false
) {
  const coinAddress = _coinAddress.toLowerCase();
  if (asUser) {
    if (defaultContractAddress === '') {
      defaultContractAddress = (client.client as any).contractInfo.address;
    }
    (client.client as any).contractInfo.address = userAttesterContract;
  } else {
    if (defaultContractAddress !== '') {
      (client.client as any).contractInfo.address = defaultContractAddress;
    }
  }
  const attestationData = {
    coin: getAddress(coinAddress),
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
    indexingValue: coinAddress.toLowerCase(),
    page: 1
  });
  const rows = result?.rows;
  if (!rows) return [];

  return rows.map(row => {
    const decoded = decodeAbiParameters(
      parseAbiParameters('address,string,string,string,string'),
      row.data as `0x${string}`
    );
    return {
      timestamp: parseFloat(row.attestTimestamp),
      address: row.attester,
      attestationId: row.id,
      description: decoded[1],
      icon: decoded[2],
      website: decoded[3],
      socials: parseSocials(JSON.parse(decoded[4]))
    };
  });
}
