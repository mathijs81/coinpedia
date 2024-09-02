import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface Coin {
  address: `0x${string}`;
  symbol: string;
  name: string;
}

const coins: Coin[] = [
  {
    address: '0xabc',
    symbol: 'USDC',
    name: 'USD Coin',
  },
  {
    address: '0xdef',
    symbol: 'USDT',
    name: 'Tether USD',
  }
];

export default async function coinController(fastify: FastifyInstance) {
  // GET /api/v1/coin
  fastify.get('/', async function (_request: FastifyRequest, reply: FastifyReply) {
    reply.send(coins);
  });
}
