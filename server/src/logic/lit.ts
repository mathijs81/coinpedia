
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { LocalStorage } from 'node-localstorage';
import { ethers } from 'ethers';
import {
    createSiweMessageWithRecaps,
    generateAuthSig,
    LitAbility,
    LitActionResource,
  } from "@lit-protocol/auth-helpers";

const litNodeClient = new LitNodeClient({
    litNetwork: LitNetwork.DatilDev,
    storageProvider: {
        provider: new LocalStorage("./lit_storage.db"),
    },
    debug: process.env.NODE_ENV !== 'production',
});

litNodeClient.connect();

const signer = new ethers.Wallet(
    process.env.ETHEREUM_KEY!,
    new ethers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
);

export async function runTask() {
    const sessionSigs = await litNodeClient.getSessionSigs({
        chain: "ethereum",
        expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
        resourceAbilityRequests: [
            {
                resource: new LitActionResource("*"),
                ability: LitAbility.LitActionExecution,
            },
        ],
        authNeededCallback: async ({
            resourceAbilityRequests,
            expiration,
            uri,
        }) => {
            const toSign = await createSiweMessageWithRecaps({
                uri: uri!,
                expiration: expiration!,
                resources: resourceAbilityRequests!,
                walletAddress: signer.address,
                nonce: await litNodeClient.getLatestBlockhash(),
                litNodeClient,
            });

            return await generateAuthSig({
                signer,
                toSign,
            });
        },
    });
 
    const address= '0x6f811f153a2e899f41fc916aa39d67de67c9d77c';

    const litActionCode = `(async () => {
  const address = '${ address }';
  const url = 'https://ape.store/api/token/base/' + address;
  console.log('fetching ape data from', url);
  const response = await Lit.Actions.runOnce({ waitForResponse: true, name: 'apeData' }, async () => {
    const res = await fetch(url, {
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
    return JSON.stringify(await res.json());
  });
  
  Lit.Actions.setResponse({response: response});
})();`;
  const res = await litNodeClient.executeJs({
    code: litActionCode,
    sessionSigs
  });
  return res;
}
