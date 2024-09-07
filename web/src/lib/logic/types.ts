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
  // sometimes the string is doubly json-ified
  if (typeof socials === 'string') {
    try {
      socials = JSON.parse(socials);
    } catch (error) {
      console.error('Failed to parse socials', socials);
    }
  }
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
  attestationId: string;
}

export type FullCoinData = CoinData & AttestationData;
