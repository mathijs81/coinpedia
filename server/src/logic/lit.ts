import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { LocalStorage } from 'node-localstorage';
import { ethers } from 'ethers';
import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitAbility,
  LitActionResource,
} from '@lit-protocol/auth-helpers';

const litNodeClient = new LitNodeClient({
  litNetwork: LitNetwork.DatilDev,
  storageProvider: {
    provider: new LocalStorage('./lit_storage.db'),
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
    chain: 'ethereum',
    expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    resourceAbilityRequests: [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: async ({ resourceAbilityRequests, expiration, uri }) => {
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

  const address = '0x6f811f153a2e899f41fc916aa39d67de67c9d77c';

  // We created a PKP key on lit:
  // That key is whitelisted in the Sign Protocol hook so it's allowed to directly attest new coin metadata
  const pkpPublicKey = '0x04a9594f86e1118ee48a117dd0add16599a076f6f0f012f1cfac3875aa4bbe35dfcceb47bf9cb1744b6409adf865b6cd4955c6ac6a1c9c4a3909a47b27d7149468';
  const pkpAddress = '0x7eD91D43554C4dd13D4A035624a273Ca15ff6d76';
  const rpcAddress = 'https://sepolia.base.org';

  // see https://docs.sign.global/for-builders/index-1/index/address-book
  const signProtocolAddress = '0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD';
  const schemaId = 421; // 0x1a5

  const litActionCode = `(async () => {
function getTokenUrl(url) {
if (!url) {
    return '';
}
if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
}
return '';
}

  const address = '${address}';
//   const url = 'https://ape.store/api/token/base/' + address;
//   console.log('fetching ape data from', url);
//   const response = await Lit.Actions.runOnce({ waitForResponse: true, name: 'apeData' }, async () => {
//     const res = await fetch(url, {
//       headers: {
//         'User-Agent':
//           'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
//         Accept:
//           'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.5',
//         'Upgrade-Insecure-Requests': '1',
//         'Sec-Fetch-Dest': 'document',
//         'Sec-Fetch-Mode': 'navigate',
//         'Sec-Fetch-Site': 'none',
//         'Sec-Fetch-User': '?1',
//         Priority: 'u=0, i',
//       },
//       method: 'GET',
//     });
//     return JSON.stringify(await res.json());
//   });
const response = \`{"token":{"id":58509,"chain":8453,"router":4,"hidden":false,"creator":"0x642246b6AE10273581Efd957CF9bC7caF03e6330","createDate":"2024-08-18T15:59:28.007942","deployDate":"2024-08-18T15:59:44.099241","kingDate":"2024-08-22T21:11:48","launchDate":null,"address":"0x6f811f153a2e899f41fc916aa39d67de67c9d77c","pairAddress":null,"name":"Pathological Pork","symbol":"PTH","description":"Pathological Pork (PTH) redefines conventional crypto approaches through its unique blend of memecoin culture with a self-sustaining, token-driven content creation ecosystem. By empowering creators to produce high-quality digital experiences, we drive community growth and charitable initiatives.","twitter":"https://x.com/PathologicalPrk","telegram":"https://t.me/PathologicalPork","website":"https://pth.media/","logo":"ipfs://QmfPudziWhQKYJtvJUxxwidHc2hriCKjxqUmWxhPpgAhYr/","referrer":null,"price":11286703178,"lastBump":"2024-09-04T16:33:20","marketCap":0,"chatCount":0,"holders":0,"isKing":false},"currentPrice":0.0000276335108062431031049915,"marketCap":27634,"virtualLiquidity":7830,"kingProgress":100,"apeProgress":40,"hasMap":true}\`;

  // Extract the metadata
  const data = JSON.parse(response);
  if (data.status === 404 || !data.token) {
    return null;
  }
  const tokenData = data.token;
  const iconUrl = getTokenUrl(tokenData.logo);
  const schemaData = [
  address, tokenData.description ?? '',
  iconUrl ?? '', tokenData.website ?? '',
    // TODO socials: parseSocials(tokenData),
    '{}'
  ];
  const schemaDataBytes = ethers.utils.defaultAbiCoder.encode(
    ['string', 'string', 'string', 'string', 'string'],
    schemaData
  );

  const attestAbi = [
    {
    inputs: [
      {
        components: [
          { internalType: "uint64", name: "schemaId", type: "uint64" },
          {
            internalType: "uint64",
            name: "linkedAttestationId",
            type: "uint64",
          },
          { internalType: "uint64", name: "attestTimestamp", type: "uint64" },
          { internalType: "uint64", name: "revokeTimestamp", type: "uint64" },
          { internalType: "address", name: "attester", type: "address" },
          { internalType: "uint64", name: "validUntil", type: "uint64" },
          {
            internalType: "enum DataLocation",
            name: "dataLocation",
            type: "uint8",
          },
          { internalType: "bool", name: "revoked", type: "bool" },
          { internalType: "bytes[]", name: "recipients", type: "bytes[]" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        internalType: "struct Attestation",
        name: "attestation",
        type: "tuple",
      },
      { internalType: "string", name: "indexingKey", type: "string" },
      { internalType: "bytes", name: "delegateSignature", type: "bytes" },
      { internalType: "bytes", name: "extraData", type: "bytes" },
    ],
    name: "attest",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "constant",
    type: "function",
  },
  ];

  // Need to call attest for Sign Protocol now
  const provider = new ethers.providers.JsonRpcProvider('${rpcAddress}');

  const iface = new ethers.utils.Interface(attestAbi);
  const calldata = iface.encodeFunctionData('attest',[
    [ ${schemaId},
      0,
      0,
      0,
      '${pkpAddress}',
      0,
      0,
      false,
      [],
      schemaDataBytes
    ],
    address,
    '0x',
    '0x'
  ]);
  const nonce = await provider.getTransactionCount(
    '${pkpAddress}', 'latest'
  );

  const tx = {
    to: '${signProtocolAddress}',
    data: calldata,
    gasPrice: await provider.getGasPrice(),
    // TODO: actually estimate gas
    gasLimit: 2_000_000,
    nonce
  };
  const toSign = ethers.utils.arrayify(ethers.utils.keccak256(ethers.utils.serializeTransaction(tx)));
  const signatureResult = await Lit.Actions.signAndCombineEcdsa({
    toSign,
    publicKey: '${pkpPublicKey.slice(2)}',
    sigName: 'sig4',
  });
  const signature = JSON.parse(signatureResult);
  signature.r = '0x' + signature.r.substring(2);
  signature.s = '0x' + signature.s;
  const signedTransaction = ethers.utils.serializeTransaction(tx, ethers.utils.joinSignature(signature));

  let sendTxRes = await Lit.Actions.runOnce({ waitForResponse: true, name: "txnSender" }, async () => {
    try {
      const tx = await provider.sendTransaction(signedTransaction);
      return JSON.stringify(tx);
    } catch (e) {
      return JSON.stringify(e);
    }
  });

  Lit.Actions.setResponse({response: sendTxRes});
})();`;
  const res = await litNodeClient.executeJs({
    code: litActionCode,
    sessionSigs,
  });
  return res;
}
