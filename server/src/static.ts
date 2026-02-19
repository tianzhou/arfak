import fs from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
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
