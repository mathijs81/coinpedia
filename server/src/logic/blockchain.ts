import { erc20Abi, getContract } from 'viem';

export async function getLatestBlock(chainSetting: ChainSetting): Promise<bigint> {
  return await chainSetting.client.getBlockNumber();
}

interface CoinData {
  symbol: string;
  name: string;
}

import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 4,
  duration: 1,
});
const queue = new RateLimiterQueue(rateLimiter);

export async function queryOnchainCoindata(
  chainSetting: ChainSetting,
  address: string
): Promise<CoinData> {
  const contract = getContract({
    abi: erc20Abi,
    address: address as `0x${string}`,
    client: chainSetting.client,
  });
  await queue.removeTokens(1, chainSetting.prefix);
  const symbol = await contract.read.symbol();
  const name = await contract.read.name();
  return { symbol, name };
}

// Cache using keyv
import KeyvSqlite from '@keyv/sqlite';
import Keyv from 'keyv';
import { ChainSetting } from '../constants';

const keyvSqlite = new KeyvSqlite('sqlite://coins.sqlite');
const keyv = new Keyv({ store: keyvSqlite, namespace: 'coin' });

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
