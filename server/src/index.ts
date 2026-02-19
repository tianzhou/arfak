import http from 'node:http';
import path from 'node:path';
import { connectNodeAdapter } from '@connectrpc/connect-node';
import routes from './routes.js';
import { createStaticHandler } from './static.js';

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
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
