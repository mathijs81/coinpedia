import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { runTask } from '../logic/lit';

export default async function submitController(fastify: FastifyInstance) {
  fastify.get(
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
      const address = (request.query as any).address;

      const action = await runTask();
      reply.send({ address: address, action });
    }
  );
}
