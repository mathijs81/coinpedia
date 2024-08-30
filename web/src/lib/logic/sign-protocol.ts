import { EvmChains, IndexService, SignProtocolClient, SpMode, type Attestation } from "@ethsign/sp-sdk";

const schemaId = '0x16f';
const fullSchemaId = 'onchain_evm_84532_0x16f';

const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.baseSepolia
});

const index = new IndexService("testnet");

enum SocialNetwork {
    X, TELEGRAM, DISCORD
}

interface SocialNetworkEntry {
    type: SocialNetwork;
    url: string;
}

interface CoinData {
    description: string;
    icon: string;
    website: string;
    socials: SocialNetwork[];
}

export async function attest(coinAddress: string, data: CoinData) {
    const attestationData = {
            coin: coinAddress,
            description: data.description,
            icon: data.icon,
            website: data.website,
            socials: JSON.stringify(data.socials)
        };

    await client.createAttestation({
        schemaId,
        indexingValue: coinAddress,
        data: attestationData,
    })
}

export async function lookupData(coinAddress: string): Promise<CoinData | null> {
    const result = await index.queryAttestationList({
        schemaId: fullSchemaId,
        indexingValue: coinAddress,
        page: 1
    });
    const rows = result?.rows;
    if (!rows || rows.length === 0) return null;
    console.log(rows[0]);
    return null;
}