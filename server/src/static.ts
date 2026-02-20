import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';

const MIME_TYPES: Record<string, string> = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export function createDevProxy(vitePort: number) {
  const handler = (req: IncomingMessage, res: ServerResponse) => {
    const proxy = http.request(
      {
        headers: { ...req.headers, host: `localhost:${vitePort}` },
        hostname: 'localhost',
        method: req.method,
        path: req.url,
        port: vitePort,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxy.on('error', () => {
      res.writeHead(502);
      res.end(`Vite dev server not available on port ${vitePort}`);
    });
    req.pipe(proxy);
  };

  // Proxy WebSocket upgrade requests for Vite HMR
  const handleUpgrade = (req: IncomingMessage, socket: net.Socket, head: Buffer) => {
    const upstream = net.connect(vitePort, 'localhost');
    upstream.on('connect', () => {
      const headers = [`${req.method} ${req.url} HTTP/1.1`];
      for (const [key, value] of Object.entries(req.headers)) {
        headers.push(`${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      }
      upstream.write(headers.join('\r\n') + '\r\n\r\n');
      if (head.length) upstream.write(head);
      upstream.pipe(socket);
      socket.pipe(upstream);
    });
    upstream.on('error', () => socket.destroy());
    socket.on('error', () => upstream.destroy());
  };

  return { handleUpgrade, handler };
}

export function createStaticHandler(root: string) {
  const indexHtml = path.join(root, 'index.html');

  return (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const filePath = path.join(root, url.pathname);

    // Prevent directory traversal
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }

    // Try to serve the exact file
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream',
          'Content-Length': stat.size,
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    } catch {
      // File doesn't exist, fall through to SPA fallback
    }

    // SPA fallback: serve index.html
    try {
      const stat = fs.statSync(indexHtml);
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': stat.size,
      });
      fs.createReadStream(indexHtml).pipe(res);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  };
}
