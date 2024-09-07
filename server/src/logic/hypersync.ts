import { BlockField, LogField, Query } from '@envio-dev/hypersync-client';
import memoizee from 'memoizee';
import { encodeEventTopics, erc20Abi } from 'viem';
import { ChainSetting } from '../constants';
import { getLatestBlock } from '../logic/blockchain';

export interface HypersyncData {
  address: `0x${string}`;
  transactionCount: number;
}

async function queryCoins1h(
  chainSetting: ChainSetting,
  topCount: number = 100
): Promise<HypersyncData[]> {
  console.log('querying coins!');
  const lastBlock = await getLatestBlock(chainSetting);
  // block time is 2 seconds, so just count back an hour worth of blocks
  const startBlock = lastBlock - BigInt((60 * 60) / 2);

  // fetch all ERC20 transfers from hypersync

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
  const topAddresses = Array.from(addressCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topCount);

  return topAddresses.map(([address, transactionCount]) => ({
    address: address as `0x${string}`,
    transactionCount,
  }));
}

export const getTopTransferredCoins = memoizee(queryCoins1h, {
  maxAge: 5 * 60 * 1000,
  promise: true,
});
