import { BlockField, LogField, Query } from '@envio-dev/hypersync-client';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import memoizee from 'memoizee';
import { encodeEventTopics, erc20Abi } from 'viem';
import { getCoin, getLatestBlock } from '../logic/blockchain';
import { chains, ChainSetting } from '../constants';
import { fetchApeData } from '../logic/ape-store';

interface Coin {
  address: `0x${string}`;
  symbol: string;
  name: string;
  transactionCount: number;
}

async function queryCoins24h(chainSetting: ChainSetting) {
  console.log('querying coins!');
  const lastBlock = await getLatestBlock(chainSetting);
  // block time is 2 seconds, so just count back 24 hours worth of blocks
  const startBlock = lastBlock - BigInt((24 * 60 * 60) / 2);

  const transferTopics = encodeEventTopics({
    abi: erc20Abi,
    eventName: 'Transfer',
  });

  const query: Query = {
    fromBlock: Number(startBlock),
    logs: [
      {
        topics: [transferTopics as string[]],
      },
    ],
    fieldSelection: {
      block: [BlockField.Timestamp],
      log: [LogField.Address],
    },
  };
  const res = await chainSetting.hypersyncClient.get(query);
  const logs = res.data.logs;
  const addresses = logs.map((log) => log.address!);
  // Create map of address -> count
  const addressCount = new Map<string, number>();
  for (const address of addresses) {
    addressCount.set(address, (addressCount.get(address) || 0) + 1);
  }
  // create top 100 counts
  const top100 = Array.from(addressCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);

  async function apedata(address: string) {
    if (!chainSetting.hasApeStore) {
      return {};
    }
    try {
      return (await fetchApeData(address)) ?? {};
    } catch (e) {
      console.error(e);
      return {};
    }
  }

  const promises = top100.map(
    async ([address, transactionCount]) =>
      ({
        address,
        transactionCount,
        ...(await getCoin(chainSetting, address)),
        apestore: await apedata(address),
      }) as Coin
  );
  return await Promise.all(promises);
}

const getCoins = memoizee(queryCoins24h, { maxAge: 5 * 60 * 1000, promise: true });

export default async function coinController(fastify: FastifyInstance) {
  for (const [name, chainSetting] of Object.entries(chains)) {
    fastify.get('/' + name, async function (_request: FastifyRequest, reply: FastifyReply) {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET');
      const coins = await getCoins(chainSetting);
      reply.send(coins);
    });
  }
}
