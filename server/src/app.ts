import fastify from 'fastify';
import 'dotenv/config';
import router from './router';
import { startSignProtocolListener } from './logic/blockchain';
import { clearCache } from './logic/sign-protocol';

const server = fastify({
  // Logger only for production
  logger: !!(process.env.NODE_ENV !== 'development'),
});

// Middleware: Router
server.register(router);

if (process.env.NODE_ENV !== 'development') {
  // Listen to the blockchain attestation event to immediately refresh our data when something changes.
  startSignProtocolListener((address) => {
    clearCache(address);
  });
}

export default server;
