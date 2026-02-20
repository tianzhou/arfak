import http from 'node:http';
import path from 'node:path';
import { connectNodeAdapter } from '@connectrpc/connect-node';
import { createSubsystemLogger } from './logging/index.js';
import routes from './routes.js';
import { createStaticHandler } from './static.js';

const log = createSubsystemLogger('server');

const connectHandler = connectNodeAdapter({ routes });

const uiDist = path.join(import.meta.dirname, '../../ui/dist');
const staticHandler = createStaticHandler(uiDist);

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    connectHandler(req, res);
    return;
  }

  staticHandler(req, res);
});

const port = parseInt(process.env.PORT ?? '3000', 10);
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    log.fatal(`Port ${port} is already in use. Stop the other process or set PORT=<port> to use a different port.`);
    process.exit(1);
  }
  throw err;
});
server.listen(port, () => {
  log.info(`Server listening on http://localhost:${port}`);
});
