import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { runTask } from '../logic/lit';

const runTimestamps = new Map<string, number>();

export default async function submitController(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        querystring: {
          address: { type: 'string' },
        },
      },
    },
    async function (request: FastifyRequest, reply: FastifyReply) {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET');
      const address = ((request.query as any).address as string).toLowerCase();
      if (runTimestamps.has(address) && Date.now() - runTimestamps.get(address)! < 5 * 60 * 1000) {
        reply.send({ address: address, action: 'task executed less than 5 minutes ago' });
        return;
      }
      runTimestamps.set(address, Date.now());
      const action = await runTask(address);
      reply.send({ address: address, action });
    }
  );
}
