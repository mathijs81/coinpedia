import { FastifyInstance } from 'fastify';
import coinController from './controller/coinController';
import indexController from './controller/indexController';
import submitController from './controller/submitController';

export default async function router(fastify: FastifyInstance) {
  fastify.register(coinController, { prefix: '/api/v1/coin' });

  fastify.register(submitController, { prefix: '/api/v1/submit' });
  fastify.register(indexController, { prefix: '/' });
}
