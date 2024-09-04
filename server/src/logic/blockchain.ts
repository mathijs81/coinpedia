import { erc20Abi, getContract } from 'viem';
import { keyv } from './cache';

export async function getLatestBlock(chainSetting: ChainSetting): Promise<bigint> {
  return await chainSetting.client.getBlockNumber();
}

interface CoinData {
  symbol: string;
  name: string;
}

export async function queryOnchainCoindata(
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

import { ChainSetting } from '../constants';
import { limitQueue } from './ratelimit';

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
