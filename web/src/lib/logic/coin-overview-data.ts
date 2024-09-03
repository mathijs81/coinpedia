import type {ChainString} from './onchain-data';
import UnknownCoin from '../../assets/unknown-coin.svg';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};

const refetchInterval = 5 * 60 * 1000;
const expireInterval = 30 * 60 * 1000;

async function fetchData(chain: ChainString) {
  const response = await fetch(
    'https://coins.vogelcode.com/api/v1/coin/' + chain
  );
  const coins = await response.json();
  if (!Array.isArray(coins)) {
    throw new Error('Invalid response from server -- ' + JSON.stringify(coins));
  }
  const result = coins.map(coin => ({
    ...coin,
    icon: coin.icon ?? UnknownCoin,
    description: coin.description ?? 'No description (yet)'
  }));
  cache[chain] = {
    data: result,
    timestamp: Date.now()
  };
  return result;
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
