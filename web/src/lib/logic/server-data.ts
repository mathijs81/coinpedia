import type {ChainString} from './onchain-data';
import UnknownCoin from '../../assets/unknown-coin.svg';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};

const refetchInterval = 5 * 60 * 1000;
const expireInterval = 30 * 60 * 1000;

export async function apeStoreImport(address: string) {
  const response = await fetch(
    'https://coins.vogelcode.com/api/v1/submit?address=' + address,
    {method: 'POST'}
  );
  return await response.json();
}

export async function fetchCoinData(chain: ChainString, address: string) {
  const response = await fetch(
    'https://coins.vogelcode.com/api/v1/coin/' + chain + '/' + address
  );
  const coin = await response.json();
  if (coin.error) {
    throw new Error(coin.error);
  }
  return coin;
}

async function fetchData(chain: ChainString) {
  const response = await fetch(
    'https://coins.vogelcode.com/api/v1/coin/' + chain
  );
  const coins = await response.json();
  if (!Array.isArray(coins)) {
    throw new Error('Invalid response from server -- ' + JSON.stringify(coins));
  }
  cache[chain] = {
    data: coins,
    timestamp: Date.now()
  };
  return coins;
}

export function getCoinOverview(chain: ChainString) {
  const fromCache = cache[chain];
  if (!fromCache || fromCache.timestamp < Date.now() - expireInterval) {
    return [];
  } else {
    return fromCache.data;
  }
}

export async function fetchCoinOverview(chain: ChainString) {
  const fromCache = cache[chain];

  if (!fromCache || fromCache.timestamp < Date.now() - expireInterval) {
    return await fetchData(chain);
  }

  if (fromCache.timestamp < Date.now() - refetchInterval) {
    fetchData(chain).catch(error => {
      console.error('Failed to fetch coin overview', error);
    });
  }

  return fromCache.data;
}
