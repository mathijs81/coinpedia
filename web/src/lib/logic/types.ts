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
