// Shared with server code
export enum SocialNetwork {
  X,
  TELEGRAM,
  DISCORD
}

export interface SocialNetworkEntry {
  type: SocialNetwork;
  url: string;
}

export interface CoinData {
  description: string;
  icon: string;
  website: string;
  socials: SocialNetworkEntry[];
}

export function parseSocials(socials: any): SocialNetworkEntry[] {
  if (Array.isArray(socials)) {
    return socials;
  }
  // Bit annoying, we sometimes encode socials as { type: url } instead of as [{type,url}]
  if (typeof socials === 'object') {
    return Object.entries(socials).map(([type, url]) => ({
      type: parseInt(type),
      url: url as string
    }));
  }
  return [];
}

export function getIconName(network: SocialNetwork) {
  if (network === SocialNetwork.X) {
    return 'bi-twitter-x';
  } else if (network === SocialNetwork.DISCORD) {
    return 'bi-discord';
  } else if (network === SocialNetwork.TELEGRAM) {
    return 'bi-telegram';
  }
  return 'bi-link';
}

export interface AttestationData {
  timestamp: number;
  address: string;
}

export type FullCoinData = CoinData & AttestationData;
