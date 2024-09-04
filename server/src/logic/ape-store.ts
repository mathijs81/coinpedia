// Many memecoins on base are created using https://ape.store so we can look up if the exist there.

import { apeCache } from './cache';
import { limitQueue } from './ratelimit';
import { CoinData, SocialNetwork, SocialNetworkEntry } from './types';

function parseSocials(tokenData: any) {
  const result: SocialNetworkEntry[] = [];
  if (tokenData.telegram) {
    result.push({ type: SocialNetwork.TELEGRAM, url: tokenData.telegram });
  }
  if (tokenData.twitter) {
    result.push({ type: SocialNetwork.X, url: tokenData.twitter });
  }
  // ape.store doesn't seem to have discord links
  return result;
}

function getTokenUrl(url: string | undefined) {
  if (!url) {
    return '';
  }
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return '';
}

async function fetchFromNetwork(address: string): Promise<CoinData | null> {
  await limitQueue.removeTokens(1, 'apestore');
  const url = 'https://ape.store/api/token/base/' + address.toLowerCase();
  console.log('fetching ape data from', url);
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      Priority: 'u=0, i',
    },
    method: 'GET',
  });
  const data = (await response.json()) as any;

  if (data.status === 404 || !data.token) {
    return null;
  }
  const tokenData = data.token;
  const iconUrl = getTokenUrl(tokenData.logo);
  return {
    description: tokenData.description,
    icon: iconUrl,
    website: tokenData.website,
    socials: parseSocials(tokenData),
  };
}

// test :
// (async () => {
//   console.log(await fetchFromNetwork('0x6f811f153a2e899f41fc916aa39d67de67c9d77c'));
// })();

let apeRequests = 0;
let cacheHits = 0;

export async function fetchApeData(address: string): Promise<CoinData | null> {
  let value = await apeCache.get<CoinData>(address);
  apeRequests++;
  if (apeRequests % 100 == 0) {
    console.log(
      `apestore cache hits: ${cacheHits} / ${apeRequests}, rate: ${cacheHits / apeRequests}`
    );
  }
  if (!value) {
    value = (await fetchFromNetwork(address)) ?? ({} as CoinData);
    apeCache.set(address, value);
  } else {
    cacheHits++;
    if (value.description === undefined && value.icon === undefined) {
      // This was a cached null
      return null;
    }
  }
  return value;
}
