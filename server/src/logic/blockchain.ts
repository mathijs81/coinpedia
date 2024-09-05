import { erc20Abi, getContract, parseAbiItem } from 'viem';
import { keyv } from './cache';

export async function getLatestBlock(chainSetting: ChainSetting): Promise<bigint> {
  return await chainSetting.client.getBlockNumber();
}

interface CoinData {
  symbol: string;
  name: string;
}

async function queryOnchainCoindata(
  chainSetting: ChainSetting,
  address: string
): Promise<CoinData> {
  const contract = getContract({
    abi: erc20Abi,
    address: address as `0x${string}`,
    client: chainSetting.client,
  });
  await limitQueue.removeTokens(1, chainSetting.prefix);
  const symbol = await contract.read.symbol();
  const name = await contract.read.name();
  return { symbol, name };
}

import { chains, ChainSetting, schemaIdHex, signProtocolAddress } from '../constants';
import { limitQueue } from './ratelimit';
import { baseSepolia } from 'viem/chains';
import { lookupAttestation } from './sign-protocol';

let coinRequests = 0;
let cacheHits = 0;

export async function getCoin(chainSetting: ChainSetting, address: string): Promise<CoinData> {
  let value = await keyv.get<CoinData>(chainSetting.prefix + address);
  coinRequests++;
  if (coinRequests % 100 == 0) {
    console.log(`cache hits: ${cacheHits} / ${coinRequests}, rate: ${cacheHits / coinRequests}`);
  }
  if (!value) {
    value = await queryOnchainCoindata(chainSetting, address);
    keyv.set(chainSetting.prefix + address, value);
  } else {
    cacheHits++;
  }
  return value;
}

export async function startSignProtocolListener(callback: (coinAddress: string) => void) {

  // delay 5s for startup
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log("starting contract watch");

  const client = chains['base-sepolia'].client;

  const abi = [parseAbiItem('event AttestationMade(uint64 attestationId, string indexingKey)')];
  // const filter = await client.createEventFilter({
  //   address: signProtocolAddress,
  //   event: parseAbiItem(abi),
  // });
  client.watchContractEvent({
    address: signProtocolAddress,
    abi,
    eventName: 'AttestationMade',
    onLogs: async logs => {
      for (const log of logs) {
        const attestationId = log.args.attestationId!;
        try {
          const attestation = await lookupAttestation(attestationId.toString());
          if (attestation.schemaId === schemaIdHex) {
            console.log("attestation", attestation);
            callback(log.args.indexingKey!);
          }
        } catch (e) {
          console.error("Error looking up attestation for", attestationId, log, e);
        }
      }
    },
    onError: error => console.error(error),
    pollingInterval: 2_000,
  });

}