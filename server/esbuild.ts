import path from 'node:path';
import { cp } from 'node:fs/promises';
import { build } from 'esbuild';
import type { Plugin } from 'esbuild';
import esbuildPluginPino from 'esbuild-plugin-pino';

(async function () {
  const entryPoints = ['src/index.ts'];

  build({
    entryPoints,
    logLevel: 'info',
    outdir: 'build',
    bundle: true,
    minify: true,
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
    loader: { '.node': 'file' },
    external: ['sqlite3', '@envio-dev/hypersync-client' ]
  });
})();
