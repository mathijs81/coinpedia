import { FastifyInstance } from 'fastify';
import indexController from './controller/indexController';
import coinController from './controller/coinController';

export default async function router(fastify: FastifyInstance) {
  fastify.register(coinController, { prefix: '/api/v1/coin' });
  fastify.register(indexController, { prefix: '/' });
}
