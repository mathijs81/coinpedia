import { EvmChains, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { schemaIdHex } from '../constants';
import 'dotenv/config';
import { createWalletClient, getAddress, http } from "viem";
import { baseSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {parse} from 'csv-parse/sync';
import fs from 'fs';

const account=  privateKeyToAccount(process.env.ETHEREUM_KEY as `0x{string}`);
const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.baseSepolia,
    walletClient: createWalletClient({
        chain: baseSepolia,
        transport: http(),
        account
    }),
    account
});

async function attest(_address: string, description: string, iconUrl: string, website: string, socials: string) {
    // make sure address is valid & then lowercase it
    const address = getAddress(_address).toLowerCase();
    const attestationData = {
        coin: address,
        description,
        icon: iconUrl,
        website: website,
        socials: JSON.stringify(socials)
    };
    return await client.createAttestation({
        schemaId: schemaIdHex,
        indexingValue: address,
        data: attestationData
    });
}

async function main() {
    const csv = 'importcoins.csv';
    const records = parse(fs.readFileSync(csv), {
        columns: true,
        skip_empty_lines: true
    });
    for (const record of records) {
        console.log(record.address);
        console.log(await attest(record.address, record.description, record.icon, record.website, record.socials));
        // Wait couple of seconds
        await new Promise(resolve => setTimeout(resolve, 4000));
    }
}

main().catch(console.error);