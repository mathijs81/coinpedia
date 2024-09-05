import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { chains, ChainSetting } from '../constants';
import { fetchApeData } from '../logic/ape-store';
import { getCoin } from '../logic/blockchain';
import { getTopTransferredCoins } from '../logic/hypersync';
import { getAttestedData } from '../logic/sign-protocol';
import { baseSepolia } from 'viem/chains';

function getFetchers(chainSetting: ChainSetting) {
  return [
    async (address: string) => await getCoin(chainSetting, address),
    async (address: string) =>
      chainSetting.hasApeStore ? { apestore: await fetchApeData(address) } : {},
    async (address: string) => await getAttestedData(chainSetting, address),
  ];
}

async function getCoinData(chainSetting: ChainSetting, address: string) {
  const fetchers = getFetchers(chainSetting);
  const resultsArray = await Promise.all(fetchers.map((fetcher) => fetcher(address)));
  return Object.assign({}, ...resultsArray);
}

async function getTopCoins(chainSetting: ChainSetting) {
  let topCoins = await getTopTransferredCoins(chainSetting);
  if (chainSetting.chain === baseSepolia) {
    // Add two of our test coins at the start
    topCoins = [...topCoins];
    topCoins.unshift({
      address: '0xAf13556e566B33912618bf8EB21FAE184A0eb2E2',
      transactionCount: 13371337,
    });
  }

  // get the data that we need for each coin
  const fetchers = getFetchers(chainSetting);

  const promises = topCoins.map(async (coin) => {
    const resultsArray = await Promise.all(
      fetchers.map((fetcher) => {
        try {
          return fetcher(coin.address);
        } catch (e) {
          console.error(e);
          return {};
        }
      })
    );
    return {
      ...coin,
      ...Object.assign({}, ...resultsArray),
    };
  });
  return await Promise.all(promises);
}

export default async function coinController(fastify: FastifyInstance) {
  for (const [name, chainSetting] of Object.entries(chains)) {
    fastify.get('/' + name, async function (_request: FastifyRequest, reply: FastifyReply) {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET');
      const coins = await getTopCoins(chainSetting);
      reply.send(coins);
    });

    fastify.get(
      '/' + name + '/:address',
      async function (request: FastifyRequest, reply: FastifyReply) {
        reply.header('Access-Control-Allow-Origin', '*');
        reply.header('Access-Control-Allow-Methods', 'GET');
        const { address } = request.params as any;
        reply.send(await getCoinData(chainSetting, (address as string).toLowerCase()));
      }
    );
  }
}
